const db = require('../config/db')
const Sequelize = db.sequelize;
const HttpErrorInfo = Sequelize.import('../schema/HttpErrorInfo');
const CommonSql = require("../util/commonSql")
const Utils = require('../util/utils');
HttpErrorInfo.sync({force: false});

class HttpErrorInfoModel {
  /**
   * 创建HttpErrorInfo信息
   * @param data
   * @returns {Promise<*>}
   */
  static async createHttpErrorInfo(data) {
    return await HttpErrorInfo.create({
      ...data
    })
  }

  /**
   * 更新HttpErrorInfo数据
   * @param id  用户ID
   * @param status  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updateHttpErrorInfo(id, data) {
    await HttpErrorInfo.update({
      ...data
    }, {
      where: {
        id
      },
      fields: Object.keys(data)
    })
    return true
  }

  /**
   * 获取HttpErrorInfo列表
   * @returns {Promise<*>}
   */
  static async getHttpErrorInfoList() {
    return await HttpErrorInfo.findAndCountAll()
  }

  /**
   * 获取HttpErrorInfo详情数据
   * @param id  HttpErrorInfo的ID
   * @returns {Promise<Model>}
   */
  static async getHttpErrorInfoDetail(id) {
    return await HttpErrorInfo.findOne({
      where: {
        id,
      },
    })
  }

  /**
   * 删除HttpErrorInfo
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteHttpErrorInfo(id) {
    await HttpErrorInfo.destroy({
      where: {
        id,
      }
    })
    return true
  }


  /**
   * 获取当前用户所有的请求记录
   * @returns {Promise<*>}
   */
  static async getHttpErrorsByUser(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select * from HttpErrorInfos where " + customerKeySql + " and " + happenTimeSql + " and " + webMonitorIdSql
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取24小时内，每小时的错误量
   * @returns {Promise<*>}
   */
  static async getHttpErrorInfoListByHour(param) {
    const sql = "SELECT DATE_FORMAT(createdAt,'%m-%d %H') AS hour, COUNT(id) AS count " +
      "FROM HttpErrorInfos " +
      "WHERE webMonitorId='" + param.webMonitorId + "' and DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H') <= createdAt " +
      "GROUP BY HOUR"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 获取7天前，24小时内，每小时的错误量
   * @returns {Promise<*>}
   */
  static async getHttpErrorInfoListSevenDayAgoByHour(param) {
    const tempNowHour = new Date().getHours();
    let nowHour = tempNowHour
    let sevenDayAgo = ""
    if (tempNowHour === 23) {
      sevenDayAgo = Utils.addDays(-5) + " 00:00:00";
    } else {
      nowHour = nowHour + 1
      sevenDayAgo = Utils.addDays(-6) + " " + nowHour + ":00:00";
    }
    const sql = "SELECT DATE_FORMAT(createdAt,'%m-%d %H') AS hour, COUNT(id) AS count " +
      "FROM HttpErrorInfos " +
      "WHERE webMonitorId='" + param.webMonitorId + "' and `status`>201 and createdAt<'" + sevenDayAgo + "' and DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 7 DAY) - INTERVAL 23 HOUR, '%Y-%m-%d %H') <= createdAt " +
      "GROUP BY HOUR"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  static async getHttpErrorCountByDay(param) {
    let sql = "select DATE_FORMAT(createdAt,'%Y-%m-%d') as day, count(id) as count from HttpErrorInfos WHERE webMonitorId='" + param.webMonitorId + "' and DATE_SUB(CURDATE(),INTERVAL 30 DAY) <= createdAt GROUP BY day"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取当前用户所有的日志加载失败记录
   * @returns {Promise<*>}
   */
  static async getHttpErrorInfoListByDay(param) {
    const { timeType } = param
    const queryStr = CommonSql.createTimeScopeSql(timeType)
    const sql = "select simpleHttpUrl, COUNT(simpleHttpUrl) as count from HttpErrorInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " GROUP BY simpleHttpUrl order by count desc limit 20"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }


  /**
   * 最近发生时间
   * @param httpUrl
   * @param param
   * @returns {Promise<*>}
   */
  static async getHttpErrorLatestTime(simpleHttpUrl, param) {
    const { timeType } = param
    const queryStr = CommonSql.createTimeScopeSql(timeType)
    return await Sequelize.query("select createdAt, happenTime from HttpErrorInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " and  simpleHttpUrl= '" + simpleHttpUrl + "' ORDER BY createdAt desc limit 1", { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 分类接口状态
   * @param httpUrl
   * @param param
   * @returns {Promise<*>}
   */
  static async getStatusCountBySimpleHttpUrl(simpleHttpUrl, param) {
    const { timeType } = param
    const queryStr = CommonSql.createTimeScopeSql(timeType)
    const sql = "select `status`, count(`status`) as count from HttpErrorInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " and  simpleHttpUrl= '" + simpleHttpUrl + "' GROUP BY `status`"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }


}

module.exports = HttpErrorInfoModel
