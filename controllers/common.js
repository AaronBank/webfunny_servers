const BehaviorInfoModel = require('../modules/behaviorInfo')
const JavascriptErrorInfoModel = require('../modules/javascriptErrorInfo')
const ScreenShotInfo = require('../modules/ScreenShotInfo')
const CustomerPVModel = require('../modules/customerPV')
const LoadPageModel = require('../modules/loadPageInfo')
const IgnoreErrorModel = require('../modules/ignoreError')
const ScreenShotInfoModel = require('../modules/ScreenShotInfo')
const HttpLogInfoModel = require('../modules/HttpLogInfo')
const ExtendBehaviorInfoModel = require('../modules/extendBehaviorInfo')
const ResourceLoadInfo = require('../modules/resourceLoadInfo')
const statusCode = require('../util/status-code')
const fetch = require('node-fetch')
const Utils = require('../util/utils');
const log = require("../config/log");
const fs = require('fs');
class Common {
  /**
   * 旧版上传日志的接口
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async uploadLog(ctx) {
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('创建信息成功')
  }

  /**
   * 接受并分类处理上传的日志
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async upLg(ctx) {
    var req = ctx.req
    const clientIpString = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    // const tempArr = clientIpString.split(":")
    // const clientIp = tempArr[tempArr.length - 1]
    // const ipPath = "http://ip.taobao.com/service/getIpInfo.php?ip=" + clientIp
    let province = ""
    let city = ""
    // await fetch(ipPath)
    //   .then( res => res.text())
    //   .then( body => {
    //     try {
    //       const obj = JSON.parse(body);
    //       province = obj.data.region || "未知";
    //       city = obj.data.city;
    //     } catch(e) {
    //       province = "未知";
    //       city = "未知";
    //     }
    //   });
    // 暂时先把线上的日志记录过滤掉
    const paramStr = ctx.request.body.data.replace(/": Script error\./g, "script error")
    // if (paramStr.indexOf("-qa") !== -1 || paramStr.indexOf("-staging") !== -1) {
    if (true) {
      const param = JSON.parse(paramStr)
      const logArray = param.logInfo.split("$$$")
      for(var i = 0; i < logArray.length; i ++) {
        if (!logArray[i]) continue;
        const logInfo = JSON.parse(logArray[i]);
        logInfo.monitorIp = clientIpString
        logInfo.province = province
        logInfo.city = city
        switch (logInfo.uploadType) {
          case "ELE_BEHAVIOR":
            await BehaviorInfoModel.createBehaviorInfo(logInfo);
            break;
          case "JS_ERROR":
            const arr = await IgnoreErrorModel.getIgnoreErrorByMsg(logInfo);
            const count = arr[0].count
            if (count <= 0) {
              await JavascriptErrorInfoModel.createJavascriptErrorInfo(logInfo);
            }
            break;
          case "HTTP_LOG":
            await HttpLogInfoModel.createHttpLogInfo(logInfo);
            break;
          case "SCREEN_SHOT":
            await ScreenShotInfo.createScreenShotInfo(logInfo);
            break;
          case "CUSTOMER_PV":
            await CustomerPVModel.createCustomerPV(logInfo);
            break;
          case "LOAD_PAGE":
            await LoadPageModel.createLoadPageInfo(logInfo);
            break;
          default:
            break;
        }
      }
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('创建信息成功')
    } else {
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('创建信息成功')
    }
  }

  /**
   * 接受并分类处理上传的拓展日志
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async uploadExtendLog(ctx) {
    let param = {}
    if (typeof ctx.request.body !== 'object') {
      param = JSON.parse(ctx.request.body)
    } else {
      param = ctx.request.body
    }
    ExtendBehaviorInfoModel.createExtendBehaviorInfo(param)
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('创建信息成功')
  }

  /**
   * 根据查询参数，查询出该用户所有的行为记录
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async searchBehaviorsRecord(ctx) {
    const param = JSON.parse(ctx.request.body)
    param.userId = Utils.md5Encrypt(param.searchValue)
    param.happenTimeScope = new Date(Utils.addDays(0 - param.timeScope) + " 00:00:00").getTime()
    let customerKeyList = []
    let result1 = []
    let result2 = []
    let result3 = []
    let result4 = []
    let result5 = []
    let result6 = []
    let result7 = []
    let result = []
    let startDateTime = new Date().getTime()
    // 查询当前用户的customerKey列表
    await CustomerPVModel.getCustomerKeyByUserId(param).then((res) => {
      res.forEach((customerKeyInfo) => {
        customerKeyList.push(customerKeyInfo.customerKey)
      })
      let currentDateTime = new Date().getTime()
      console.log("customerKey获取时间：", currentDateTime - startDateTime)
      startDateTime = currentDateTime
    })
    let customerKeySql = ""
    let webMonitorIdSql = "1=1" // " webMonitorId='" + param.webMonitorId + "' "
    let happenTimeSql = " happenTime>" + param.happenTimeScope + " "
    let userIdSql = " userId='" + Utils.md5Encrypt(Utils.b64DecodeUnicode(param.searchValue)) + "' "
    let base64UserIdSql = " userId='" + Utils.md5Encrypt(param.searchValue) + "' "
    if (customerKeyList.length) {
      customerKeyList.forEach((customerKey, index) => {
        if (index === customerKeyList.length -1) {
          customerKeySql += " customerKey='" + customerKey + "' "
        } else {
          customerKeySql += " customerKey='" + customerKey + "' or "
        }
      })
      customerKeySql = " (" + customerKeySql + ") "
    } else {
      // 如果userId查不到，则用customerKey来进行查询
      const customerKey = Utils.b64DecodeUnicode(param.searchValue)
      customerKeySql += " customerKey='" + customerKey + "' "
    }

    await BehaviorInfoModel.getBehaviorsByUser(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      result1 = res
    })
    await CustomerPVModel.getBehaviorsByUser(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      result2 = res
    })
    await JavascriptErrorInfoModel.getBehaviorsByUser(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      result3 = res
    })
    await ScreenShotInfoModel.getBehaviorsByUser(webMonitorIdSql, happenTimeSql, base64UserIdSql).then((res) => {
      result4 = res
    })
    await HttpLogInfoModel.getHttpLogsByUser(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      result5 = res
    })
    await ExtendBehaviorInfoModel.getExtendBehaviorInfoByUserId(happenTimeSql, userIdSql).then((res) => {
      result6 = res
    })
    await ResourceLoadInfo.getResourceLoadInfoByUserId(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      result7 = res
    })

    result = result.concat(result1, result2, result3, result5, result6, result7)
    result4.forEach((item) => {
      item.screenInfo = (item.screenInfo || "").toString()
      result.push(item)
    })
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('创建信息成功', {behaviorList: result})
  }

  /**
   * 根据userId，查询出该用户详细信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async searchCustomerInfo(ctx) {
    const param = JSON.parse(ctx.request.body)
    param.userId = Utils.md5Encrypt(param.searchValue)
    param.happenTimeScope = new Date(Utils.addDays(0 - param.timeScope) + " 00:00:00").getTime()
    let customerKeyList = []
    let pvCountList = null
    let loadPageTimeList = null
    let ipPath = ""
    let cusDetail = null
    let startDateTime = new Date().getTime()
    // 查询当前用户的customerKey列表
    await CustomerPVModel.getCustomerKeyByUserId(param).then((res) => {
      res.forEach((customerKeyInfo) => {
        customerKeyList.push(customerKeyInfo.customerKey)
      })
    })
    let customerKeySql = ""
    let webMonitorIdSql = " 1=1 "
    let happenTimeSql = " happenTime>" + param.happenTimeScope + " "
    if (customerKeyList.length) {
      customerKeyList.forEach((customerKey, index) => {
        if (index === customerKeyList.length -1) {
          customerKeySql += " customerKey='" + customerKey + "' "
        } else {
          customerKeySql += " customerKey='" + customerKey + "' or "
        }
      })
      customerKeySql = " (" + customerKeySql + ") "
    } else {
      // 如果userId查不到，则用customerKey来进行查询
      const customerKey = Utils.b64DecodeUnicode(param.searchValue)
      customerKeySql += " customerKey='" + customerKey + "' "
    }
    await CustomerPVModel.getCustomerPVDetailByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      cusDetail = res[0]
      if (cusDetail) {
        ipPath = "http://ip.taobao.com/service/getIpInfo.php?ip=" + cusDetail.monitorIp
      }
      let currentDateTime = new Date().getTime()
      console.log("个人信息获取时间：", currentDateTime - startDateTime)
      startDateTime = currentDateTime
    })
    if (ipPath) {
      try {
        await fetch(ipPath)
          .then( res => res.text())
          .then( body => {
            try {
              const obj = JSON.parse(body);
              cusDetail.province = obj.data.region || "未知";
              cusDetail.city = obj.data.city;
            } catch(e) {
              cusDetail.province = "未知";
              cusDetail.city = "未知";
            }

          });
      } catch (e) {
        cusDetail.province = "未知";
        cusDetail.city = "未知";
      }

    }
    await CustomerPVModel.getPVsByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      pvCountList = res
      let currentDateTime = new Date().getTime()
      console.log("PVcount获取时间：", currentDateTime - startDateTime)
      startDateTime = currentDateTime
    })

    await LoadPageModel.getPageLoadTimeByCustomerKey(webMonitorIdSql, customerKeySql, happenTimeSql).then((res) => {
      loadPageTimeList = res
      let currentDateTime = new Date().getTime()
      console.log("loadPage获取时间：", currentDateTime - startDateTime)
      startDateTime = currentDateTime
    })
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('创建信息成功', {pvCountList, loadPageTimeList, cusDetail})
  }

  /**
   * 立邦开关
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async liBangData(ctx) {
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('success', 1)
  }
}
module.exports = Common
