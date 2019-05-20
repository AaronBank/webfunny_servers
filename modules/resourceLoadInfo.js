const db = require('../config/db')
const Sequelize = db.sequelize;
const ResourceLoadInfo = Sequelize.import('../schema/resourceLoadInfo');
const Utils = require("../util/utils")
const CommonSql = require("../util/commonSql")
ResourceLoadInfo.sync({force: false});

class ResourceLoadInfoModel {
  /**
   * 创建ResourceLoadInfo信息
   * @param data
   * @returns {Promise<*>}
   */
  static async createResourceLoadInfo(data) {
    return await ResourceLoadInfo.create({
      ...data
    })
  }

  /**
   * 更新ResourceLoadInfo数据
   * @param id  用户ID
   * @param status  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updateResourceLoadInfo(id, data) {
    await ResourceLoadInfo.update({
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
   * 获取ResourceLoadInfo列表
   * @returns {Promise<*>}
   */
  static async getResourceLoadInfoList() {
    return await ResourceLoadInfo.findAndCountAll()
  }

  /**
   * 获取ResourceLoadInfo详情数据
   * @param id  ResourceLoadInfo的ID
   * @returns {Promise<Model>}
   */
  static async getResourceLoadInfoDetail(id) {
    return await ResourceLoadInfo.findOne({
      where: {
        id,
      },
    })
  }

  /**
   * 删除ResourceLoadInfo
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteResourceLoadInfo(id) {
    await ResourceLoadInfo.destroy({
      where: {
        id,
      }
    })
    return true
  }

  /**
   * 获取当前用户所有的日志加载失败记录
   * @returns {Promise<*>}
   */
  static async getResourceLoadInfoByUserId(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select * from ResourceLoadInfos where " + happenTimeSql + "and" + customerKeySql + " and " + webMonitorIdSql
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取当前用户所有的日志加载失败记录
   * @returns {Promise<*>}
   */
  static async getResourceLoadInfoListByDay(param) {
    const { simpleUrl, timeType } = param
    const queryStr1 = simpleUrl ? " and simpleUrl='" + simpleUrl + "' " : " "
    const queryStr = queryStr1 + CommonSql.createTimeScopeSql(timeType)
    const sql = "select sourceUrl, COUNT(sourceUrl) as count from ResourceLoadInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " GROUP BY sourceUrl order by count desc limit 20"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 最近发生时间
   * @param sourceUrl
   * @param param
   * @returns {Promise<*>}
   */
  static async getResourceErrorLatestTime(sourceUrl, param) {
    const { simpleUrl, timeType } = param
    const queryStr1 = simpleUrl ? " and simpleUrl='" + simpleUrl + "' " : " "
    const queryStr = queryStr1 + CommonSql.createTimeScopeSql(timeType)
    return await Sequelize.query("select createdAt, happenTime from ResourceLoadInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " and  sourceUrl= '" + sourceUrl + "' ORDER BY createdAt desc limit 1", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 影响多少页面
   * @param sourceUrl
   * @param param
   * @returns {Promise<*>}
   */
  static async getPageCountByResourceError(sourceUrl, param) {
    const { simpleUrl, timeType } = param
    const queryStr1 = simpleUrl ? " and simpleUrl='" + simpleUrl + "' " : " "
    const queryStr = queryStr1 + CommonSql.createTimeScopeSql(timeType)
    return await Sequelize.query("SELECT count(DISTINCT simpleUrl) as pageCount from ResourceLoadInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " and sourceUrl='" + sourceUrl + "'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 影响了多少用户
   * @param sourceUrl
   * @param param
   * @returns {Promise<*>}
   */
  static async getCustomerCountByResourceError(sourceUrl, param) {
    const { simpleUrl, timeType } = param
    const queryStr1 = simpleUrl ? " and simpleUrl='" + simpleUrl + "' " : " "
    const queryStr = queryStr1 + CommonSql.createTimeScopeSql(timeType)
    return await Sequelize.query("SELECT count(DISTINCT (customerKey)) as customerCount from ResourceLoadInfos where webMonitorId='" + param.webMonitorId + "' " + queryStr + " and sourceUrl='" + sourceUrl + "'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取当前用户所有的日志加载失败记录列表
   * @returns {Promise<*>}
   */
  static async getResourceErrorCountByDay(param) {
    let sql = "select DATE_FORMAT(createdAt,'%Y-%m-%d') as day, count(id) as count from ResourceLoadInfos WHERE webMonitorId='" + param.webMonitorId + "' and DATE_SUB(CURDATE(),INTERVAL 30 DAY) <= createdAt GROUP BY day"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取某小时内，错误总数
   * @returns {Promise<*>}
   */
  static async getResourceErrorInfoListByHour(startTime, endTime, param) {
    return await Sequelize.query("SELECT COUNT(*) as count from ResourceLoadInfos where  webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + startTime + "' and createdAt < '" + endTime + "'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取24小时内，每小时的错误量
   * @returns {Promise<*>}
   */
  static async getResourceLoadErrorInfoListByHour(param) {
    const sql = "SELECT DATE_FORMAT(createdAt,'%m-%d %H') AS hour, COUNT(id) AS count " +
      "FROM ResourceLoadInfos " +
      "WHERE webMonitorId='" + param.webMonitorId + "' and DATE_FORMAT(NOW() - INTERVAL 23 HOUR, '%Y-%m-%d %H') <= createdAt " +
      "GROUP BY HOUR"
    // return await Sequelize.query("SELECT COUNT(*) as count from JavascriptErrorInfos where  webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + startTime + "' and createdAt < '" + endTime + "'", { type: Sequelize.QueryTypes.SELECT})
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 获取7天前，24小时内，每小时的错误量
   * @returns {Promise<*>}
   */
  static async getResourceLoadErrorInfoListSevenDayAgoByHour(param) {
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
      "FROM ResourceLoadInfos " +
      "WHERE webMonitorId='" + param.webMonitorId + "' and createdAt<'" + sevenDayAgo + "' and DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 7 DAY) - INTERVAL 23 HOUR, '%Y-%m-%d %H') <= createdAt " +
      "GROUP BY HOUR"
    // return await Sequelize.query("SELECT COUNT(*) as count from JavascriptErrorInfos where  webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + startTime + "' and createdAt < '" + endTime + "'", { type: Sequelize.QueryTypes.SELECT})
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
}

module.exports = ResourceLoadInfoModel
