const db = require('../config/db')
const Sequelize = db.sequelize;
const CustomerPV = Sequelize.import('../schema/customerPV');
const Utils = require('../util/utils');
CustomerPV.sync({force: false});

class CustomerPVModel {
  /**
   * 创建CustomerPV信息
   * @param data
   * @returns {Promise<*>}
   */
  static async createCustomerPV(data) {
    return await CustomerPV.create({
      ...data
    })
  }

  /**
   * 更新CustomerPV数据
   * @param id  用户ID
   * @param status  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updateCustomerPV(id, data) {
    await CustomerPV.update({
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
   * 获取CustomerPV列表
   * @returns {Promise<*>}
   */
  static async getCustomerPVList() {
    return await CustomerPV.findAndCountAll()
  }

  /**
   * 获取CustomerPV详情数据
   * @param id  CustomerPV的ID
   * @returns {Promise<Model>}
   */
  static async getCustomerPVDetail(id) {
    return await CustomerPV.findOne({
      where: {
        id,
      },
    })
  }

  /**
   * 删除CustomerPV
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteCustomerPV(id) {
    await CustomerPV.destroy({
      where: {
        id,
      }
    })
    return true
  }
  /**
   * 删除
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteCustomerPVsFifteenDaysAgo(days) {
    const timeScope = Utils.addDays(0 - days) + " 00:00:00"
    var querySql = "delete from CustomerPVs where createdAt<'" + timeScope + "'";
    return await Sequelize.query(querySql, { type: Sequelize.QueryTypes.DELETE})
  }
  /**
   * 获取PC错误总数
   * @returns {Promise<*>}
   */
  static async getCustomerPvPcCount(param) {
    return await Sequelize.query("SELECT COUNT(DISTINCT pageKey) as count FROM CustomerPVs WHERE webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + param.day + "' and os LIKE 'web%'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取IOS错误总数
   * @returns {Promise<*>}
   */
  static async getCustomerPvIosCount(param) {
    return await Sequelize.query("SELECT COUNT(DISTINCT pageKey) as count FROM CustomerPVs WHERE webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + param.day + "' and os LIKE 'ios%'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取Android错误总数
   * @returns {Promise<*>}
   */
  static async getCustomerPvAndroidCount(param) {
    return await Sequelize.query("SELECT COUNT(DISTINCT pageKey) as count FROM CustomerPVs WHERE webMonitorId='" + param.webMonitorId + "' and  createdAt > '" + param.day + "' and os LIKE 'android%'", { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 获取当前用户所有的行为记录
   * @returns {Promise<*>}
   */
  static async getBehaviorsByUser(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select * from CustomerPVs where " + happenTimeSql + " and " + customerKeySql + " and " + webMonitorIdSql
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 根据userId获取到所有的customerKey
   * @returns {Promise<*>}
   */
  static async getCustomerKeyByUserId(param) {
    const createdAtTime = Utils.addDays(0 - param.timeScope) + " 00:00:00"
    const sql =
      "select DISTINCT(customerKey) from CustomerPVs where createdAt>'" + createdAtTime + "' and userId='" + param.userId + "'"
      + " UNION " +
      "select DISTINCT(customerKey) from behaviorInfos where createdAt>'" + createdAtTime + "' and userId='" + param.userId + "'"
      + " UNION " +
      "select DISTINCT(customerKey) from HttpLogInfos where createdAt>'" + createdAtTime + "' and userId='" + param.userId + "'"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 根据customerKey 获取用户详情
   */
  static async getCustomerPVDetailByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select * from CustomerPVs where " + happenTimeSql + "and" + customerKeySql + " and " + webMonitorIdSql + " limit 1"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 根据customerKey获取用户访问每个页面的次数
   */
  static async getPVsByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "select CAST(simpleUrl AS char) as simpleUrl, count(simpleUrl) from CustomerPVs where " + happenTimeSql + "and" + customerKeySql + " and " + webMonitorIdSql + " GROUP BY simpleUrl "
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 根据时间获取日活量
   */
  static async getCustomerCountByTime(param) {
    const endTimeScope = Utils.addDays(0 - param.timeScope)
    let sql = "select DATE_FORMAT(createdAt,'%Y-%m-%d') as day, count(DISTINCT(customerKey)) as count from LoadPageInfos WHERE createdAt>'" + endTimeScope + "' AND webMonitorId = '" + param.webMonitorId + "' GROUP BY day"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 获取平台分布数据
   */
  static async getOsAnalysis(param) {
    const endTimeScope = Utils.addDays(0 - param.timeScope)
    let sql = "SELECT os, count(os) from CustomerPVs where createdAt>'" + endTimeScope + "' AND webMonitorId = '" + param.webMonitorId + "' GROUP BY os"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
  /**
   * 根据时间获取某一天的用户数量
   */
  static async getCustomerCountByDayTime(webMonitorId, startTimeScope, endTimeScope) {
    let sql = "select count(DISTINCT(customerKey)) as count from LoadPageInfos WHERE createdAt>'" + startTimeScope + "' AND createdAt>'" + endTimeScope + "'  AND webMonitorId = '" + webMonitorId + "'"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
}

module.exports = CustomerPVModel
