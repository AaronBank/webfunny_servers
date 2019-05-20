const db = require('../config/db')
const Sequelize = db.sequelize;
const HttpLogInfo = Sequelize.import('../schema/HttpLogInfo');
const Utils = require('../util/utils');
HttpLogInfo.sync({force: false});

class HttpLogInfoModel {
  /**
   * 创建HttpLogInfo信息
   * @param data
   * @returns {Promise<*>}
   */
  static async createHttpLogInfo(data) {
    return await HttpLogInfo.create({
      ...data
    })
  }

  /**
   * 更新HttpLogInfo数据
   * @param id  用户ID
   * @param status  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updateHttpLogInfo(id, data) {
    await HttpLogInfo.update({
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
   * 获取HttpLogInfo列表
   * @returns {Promise<*>}
   */
  static async getHttpLogInfoList() {
    return await HttpLogInfo.findAndCountAll()
  }

  /**
   * 获取HttpLogInfo详情数据
   * @param id  HttpLogInfo的ID
   * @returns {Promise<Model>}
   */
  static async getHttpLogInfoDetail(id) {
    return await HttpLogInfo.findOne({
      where: {
        id,
      },
    })
  }

  /**
   * 删除HttpLogInfo
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteHttpLogInfo(id) {
    await HttpLogInfo.destroy({
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
  static async getHttpLogsByUser(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select * from HttpLogInfos where " + customerKeySql + " and " + happenTimeSql + " and " + webMonitorIdSql
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 删除
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteHttpLogInfoFifteenDaysAgo(days) {
    const timeScope = Utils.addDays(0 - days) + " 00:00:00"
    var querySql = "delete from HttpLogInfos where createdAt<'" + timeScope + "'"
    return await Sequelize.query(querySql, { type: Sequelize.QueryTypes.DELETE})
  }
}

module.exports = HttpLogInfoModel
