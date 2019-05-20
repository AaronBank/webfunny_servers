const HttpErrorInfoModel = require('../modules/HttpErrorInfo')
const statusCode = require('../util/status-code')
const Utils = require('../util/utils');
class HttpErrorInfoController {
  /**
   * 创建信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async create(ctx) {
    const param = ctx.request.body
    const data = JSON.parse(param.data)
    /* 判断参数是否合法 */
    if (req.happenTime) {
      let ret = await HttpErrorInfoModel.createHttpErrorInfo(data);
      let res = await HttpErrorInfoModel.getHttpErrorInfoDetail(ret.id);
  
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
  static async getHttpErrorInfoList(ctx) {
    let req = ctx.request.body
  
    if (req) {
      const data = await HttpErrorInfoModel.getHttpErrorInfoList();
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', data)
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('查询信息列表失败！');
    }
  
  }
  
  /**
   * 查询单条信息数据
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    let id = ctx.params.id;
  
    if (id) {
      let data = await HttpErrorInfoModel.getHttpErrorInfoDetail(id);
  
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
      await HttpErrorInfoModel.deleteHttpErrorInfo(id);
  
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
      await HttpErrorInfoModel.updateHttpErrorInfo(id, req);
      let data = await HttpErrorInfoModel.getHttpErrorInfoDetail(id);
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('更新信息成功！', data);
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('更新信息失败！')
    }
  }


  /**
   * 根据时间获取一天内http请求错误的数量信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getHttpErrorInfoListByHour(ctx) {
    const param = Utils.parseQs(ctx.request.url)
    let result1 = []
    await HttpErrorInfoModel.getHttpErrorInfoListByHour(param).then(data => {
      result1 = data;
    })
    let result2 = []
    await HttpErrorInfoModel.getHttpErrorInfoListSevenDayAgoByHour(param).then(data => {
      result2 = data;
    })
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', {today: result1, seven: result2})
  }


  /**
   * 获取每天接口请求错误数量列表
   * @returns {Promise.<void>}
   */
  static async getHttpErrorCountByDay(ctx) {
    const param = Utils.parseQs(ctx.request.url)
    await HttpErrorInfoModel.getHttpErrorCountByDay(param).then(data => {
      if (data) {
        ctx.response.status = 200;
        ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', Utils.handleDateResult(data))
      } else {
        ctx.response.status = 412;
        ctx.body = statusCode.ERROR_412('查询信息列表失败！');
      }
    })
  }

  /**
   * 获取每天接口请求错误列表
   * @returns {Promise.<void>}
   */
  static async getHttpErrorListByDay(ctx) {

    const param = JSON.parse(ctx.request.body)
    let httpErrorSortList = null
    await HttpErrorInfoModel.getHttpErrorInfoListByDay(param).then(data => {
      httpErrorSortList = data
    })
    for (let i = 0; i < httpErrorSortList.length; i ++) {
      // 查询最近发生时间
      await HttpErrorInfoModel.getHttpErrorLatestTime(httpErrorSortList[i].simpleHttpUrl, param).then(data => {
        httpErrorSortList[i].createdAt = data[0].createdAt
        httpErrorSortList[i].happenTime = data[0].happenTime
      })
      // 查询不同状态的次数
      await HttpErrorInfoModel.getStatusCountBySimpleHttpUrl(httpErrorSortList[i].simpleHttpUrl, param).then(data => {
        httpErrorSortList[i].statusArray = data[0]
      })
    }
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', httpErrorSortList)
  }
}

module.exports = HttpErrorInfoController
