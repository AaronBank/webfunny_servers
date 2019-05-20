const db = require('../config/db')
const Sequelize = db.sequelize;
const LoadPageInfo = Sequelize.import('../schema/loadPageInfo');
const utils = require("../util/utils")
LoadPageInfo.sync({force: false});

class LoadPageInfoModel {
  /**
   * 创建LoadPageInfo信息
   * @param data
   * @returns {Promise<*>}
   */
  static async createLoadPageInfo(data) {
    return await LoadPageInfo.create({
      ...data
    })
  }

  /**
   * 更新LoadPageInfo数据
   * @param id  用户ID
   * @param status  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updateLoadPageInfo(id, data) {
    await LoadPageInfo.update({
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
   * 获取LoadPageInfo列表
   * @returns {Promise<*>}
   */
  static async getLoadPageInfoList() {
    return await LoadPageInfo.findAndCountAll()
  }

  /**
   * 获取LoadPageInfo详情数据
   * @param id  LoadPageInfo的ID
   * @returns {Promise<Model>}
   */
  static async getLoadPageInfoDetail(id) {
    return await LoadPageInfo.findOne({
      where: {
        id,
      },
    })
  }

  /**
   * 删除LoadPageInfo
   * @param id listID
   * @returns {Promise.<boolean>}
   */
  static async deleteLoadPageInfo(id) {
    await LoadPageInfo.destroy({
      where: {
        id,
      }
    })
    return true
  }

  /**
   * 根据customerKey获取用户访问每个页面的平均请求时间，判断网络状态
   */
  static async getPageLoadTimeByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "SELECT CAST(simpleUrl AS char) as simpleUrl, COUNT(simpleUrl) as urlCount, AVG(loadPage) as loadPage, AVG(domReady) as domReady, AVG(request) as resource, AVG(lookupDomain) as DNS from LoadPageInfos where loadPage>0 and " + happenTimeSql + "and" + customerKeySql + " and " + webMonitorIdSql + " GROUP BY simpleUrl ORDER BY urlCount desc"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 根据customerKey获取用户访问每个页面的平均请求时间，判断网络状态
   */
  static async getLoadPageInfoByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql) {
    let sql = "SELECT * from LoadPageInfos where " + happenTimeSql + "and" + customerKeySql + " and " + webMonitorIdSql
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }

  /**
   * 根据时间获取当日页面加载的平均时间
   */
  static async getPageLoadTimeByDate(param) {
    const endTimeScope = utils.addDays(0 - param.timeScope)
    const sql = "SELECT CAST(simpleUrl AS char) as simpleUrl, COUNT(simpleUrl) as urlCount, AVG(loadPage) as loadPage, AVG(domReady) as domReady, AVG(request) as resource, AVG(lookupDomain) as DNS from LoadPageInfos where createdAt>'" + endTimeScope + "' and loadPage>1 and loadPage<15000 and webMonitorId='" + param.webMonitorId + "' GROUP BY simpleUrl having urlCount>50 ORDER BY loadPage desc limit 15"
    return await Sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT})
  }
}

module.exports = LoadPageInfoModel
