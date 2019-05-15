const JavascriptErrorInfoModel = require('../modules/javascriptErrorInfo')
const CustomerPVModel = require('../modules/customerPV')
const statusCode = require('../util/status-code')
const utils = require("../util/utils")
class JavascriptErrorInfoController {
  /**
   * 创建信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async create(ctx) {
    const param = ctx.request.body
    const data = JSON.parse(param.data)
    /* 判断参数是否合法 */
    if (data.happenTime) {
      let ret = await JavascriptErrorInfoModel.createJavascriptErrorInfo(data);
      let res = await JavascriptErrorInfoModel.getJavascriptErrorInfoDetail(ret.id);
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('创建信息成功', res)
    } else {
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('创建信息失败，请求参数不能为空！')
    }
  }
  
  /**
   * 获取信息列表
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorInfoList(ctx) {
    let req = ctx.request.body

    if (req) {
      const data = await JavascriptErrorInfoModel.getJavascriptErrorInfoList();

      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', data)
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('查询信息列表失败！');
    }
  
  }

  /**
   * 根据时间获取JS错误的数量信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorInfoListByDay(ctx) {
    const param = utils.parseQs(ctx.request.url)
    await JavascriptErrorInfoModel.getJavascriptErrorInfoListByDay(param).then(data => {
      if (data) {
        ctx.response.status = 200;
        ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', utils.handleDateResult(data))
      } else {
        ctx.response.status = 412;
        ctx.body = statusCode.ERROR_412('查询信息列表失败！');
      }
    })
  }

  /**
   * 根据时间获取一天内JS错误的数量信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorInfoListByHour(ctx) {
    const param = utils.parseQs(ctx.request.url)
    let result1 = []
    await JavascriptErrorInfoModel.getJavascriptErrorInfoListByHour(param).then(data => {
      result1 = data;
    })
    let result2 = []
    await JavascriptErrorInfoModel.getJavascriptErrorInfoListSevenDayAgoByHour(param).then(data => {
      result2 = data;
    })
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', {today: result1, seven: result2})
  }

  /**
   * 根据JS错误的数量进行排序
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorSort(ctx) {
    const param = JSON.parse(ctx.request.body)
    let errorSortList = []
    await JavascriptErrorInfoModel.getJavascriptErrorSort(param).then(data => {
      errorSortList = data
    })
    for (let i = 0; i < errorSortList.length; i ++) {
      await JavascriptErrorInfoModel.getJavascriptErrorLatestTime(errorSortList[i].errorMessage, param).then(data => {
        errorSortList[i].createdAt = data[0].createdAt
        errorSortList[i].happenTime = data[0].happenTime
      })
      await JavascriptErrorInfoModel.getPerJavascriptErrorCountByOs(errorSortList[i].errorMessage, param).then(data => {
        errorSortList[i].osInfo = data
      })
    }
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', errorSortList)
  }

  /**
   * 根据JS错误的数量进行排序
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getConsoleErrorSort(ctx) {
    const param = JSON.parse(ctx.request.body)
    let errorSortList = []
    await JavascriptErrorInfoModel.getConsoleErrorSort(param).then(data => {
      errorSortList = data
    })
    for (let i = 0; i < errorSortList.length; i ++) {
      await JavascriptErrorInfoModel.getJavascriptErrorLatestTime(errorSortList[i].errorMessage, param).then(data => {
        errorSortList[i].createdAt = data[0].createdAt
        errorSortList[i].happenTime = data[0].happenTime
      })
      await JavascriptErrorInfoModel.getPerJavascriptErrorCountByOs(errorSortList[i].errorMessage, param).then(data => {
        errorSortList[i].osInfo = data
      })
    }
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', errorSortList)
  }

  /**
   * 查询最近六小时内JS错误的数量信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorCountByHour(ctx) {
    const param = utils.parseQs(ctx.request.url)
    await JavascriptErrorInfoModel.getJavascriptErrorCountByHour(param).then(data => {
      if (data) {
        ctx.response.status = 200;
        ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', utils.handleDateResult(data))
      } else {
        ctx.response.status = 412;
        ctx.body = statusCode.ERROR_412('查询信息列表失败！');
      }
    })
  }

  /**
   * 查询对应平台js错误的数量
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorCountByOs(ctx) {
    const param = utils.parseQs(ctx.request.url)
    const result = {};
    const {day} = param;
    param.day = utils.addDays(0 - day) + " 00:00:00"
    await JavascriptErrorInfoModel.getJavascriptErrorPcCount(param).then(data => {
      result.pcError = data.length ? data[0] : 0;
    })
    await JavascriptErrorInfoModel.getJavascriptErrorIosCount(param).then(data => {
      result.iosError = data.length ? data[0] : 0;
    })
    await JavascriptErrorInfoModel.getJavascriptErrorAndroidCount(param).then(data => {
      result.androidError = data.length ? data[0] : 0;
    })

    await CustomerPVModel.getCustomerPvPcCount(param).then(data => {
      result.pcPv = data.length ? data[0] : 0;
    })
    await CustomerPVModel.getCustomerPvIosCount(param).then(data => {
      result.iosPv = data.length ? data[0] : 0;
    })
    await CustomerPVModel.getCustomerPvAndroidCount(param).then(data => {
      result.androidPv = data.length ? data[0] : 0;
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', result);
    })
  }
  /**
   * 查询分类js错误的数量
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorCountByType(ctx) {
    const param = utils.parseQs(ctx.request.url)
    const {day} = param;
    param.day = utils.addDays(0 - day) + " 00:00:00"
    await JavascriptErrorInfoModel.getJavascriptErrorCountByType(param).then(data => {
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息成功！', data);
    })

  }
  /**
   * 根据errorMsg查询Js错误列表
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorListByMsg(ctx) {
    const param = ctx.request.body
    const data = JSON.parse(param)
    await JavascriptErrorInfoModel.getJavascriptErrorListByMsg(decodeURIComponent(data.errorMsg), data).then(data => {
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', data);
    })
  }

  static async getJavascriptErrorAboutInfo(ctx) {
    const param = ctx.request.body
    const data = JSON.parse(param)
    const result = {}
    await JavascriptErrorInfoModel.getJavascriptErrorAffectCount(decodeURIComponent(data.errorMsg), data).then(data => {
      result.customerCount = data[0].count
    })
    await JavascriptErrorInfoModel.getJavascriptErrorOccurCountByCustomerKey(decodeURIComponent(data.errorMsg), data.webMonitorId, data.customerKey).then(data => {
      result.occurCount = data[0].count
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', result);
    })
  }

  /**
   * 根据页面查询Js错误列表
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorListByPage(ctx) {
    const param = utils.parseQs(ctx.request.url)
    await JavascriptErrorInfoModel.getJavascriptErrorListByPage(param).then(data => {
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', data);
    })
  }

  /**
   * 根据errorMsg查询Js错误列表
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getJavascriptErrorStackCode(ctx) {
    const param = ctx.request.body
    const data = JSON.parse(param)
    await JavascriptErrorInfoModel.getJavascriptErrorStackCode(data.stackList).then(data => {
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', data);
    })
  }

  /**
   * 查询单条信息数据
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    let id = ctx.params.id;
  
    if (id) {
      let data = await JavascriptErrorInfoModel.getJavascriptErrorInfoDetail(id);
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询成功！', data)
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('信息ID必须传');
    }
  }
  
  
  /**
   * 删除信息数据
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async delete(ctx) {
    let id = ctx.params.id;
  
    if (id && !isNaN(id)) {
      await JavascriptErrorInfoModel.deleteJavascriptErrorInfo(id);
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('删除信息成功！')
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('信息ID必须传！');
    }
  }
  
  /**
   * 更新导航条数据
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async update(ctx) {
    let req = ctx.request.body;
    let id = ctx.params.id;
  
    if (req) {
      await JavascriptErrorInfoModel.updateJavascriptErrorInfo(id, req);
      let data = await JavascriptErrorInfoModel.getJavascriptErrorInfoDetail(id);
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('更新信息成功！', data);
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('更新信息失败！')
    }
  }
}

module.exports = JavascriptErrorInfoController
