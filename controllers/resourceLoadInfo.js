const ResourceLoadInfoModel = require('../modules/resourceLoadInfo')
const statusCode = require('../util/status-code')
const utils = require("../util/utils")
class ResourceLoadInfoController {
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
      let ret = await ResourceLoadInfoModel.createResourceLoadInfo(data);
      let res = await ResourceLoadInfoModel.getResourceLoadInfoDetail(ret.id);
  
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
  static async getResourceLoadInfoList(ctx) {
    let req = ctx.request.body
  
    if (req) {
      const data = await ResourceLoadInfoModel.getResourceLoadInfoList();
  
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
      let data = await ResourceLoadInfoModel.getResourceLoadInfoDetail(id);
  
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
      await ResourceLoadInfoModel.deleteResourceLoadInfo(id);
  
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
      await ResourceLoadInfoModel.updateResourceLoadInfo(id, req);
      let data = await ResourceLoadInfoModel.getResourceLoadInfoDetail(id);
  
      ctx.response.status = 200;
      ctx.body = statusCode.SUCCESS_200('更新信息成功！', data);
    } else {
  
      ctx.response.status = 412;
      ctx.body = statusCode.ERROR_412('更新信息失败！')
    }
  }

  /**
   * 获取当天静态资源加载错误列表
   * @returns {Promise.<void>}
   */
  static async getResourceLoadInfoListByDay(ctx) {

    const param = JSON.parse(ctx.request.body)
    let resourceErrorSortList = null
    await ResourceLoadInfoModel.getResourceLoadInfoListByDay(param).then(data => {
      resourceErrorSortList = data
    })
    for (let i = 0; i < resourceErrorSortList.length; i ++) {
      // 查询最近发生时间
      await ResourceLoadInfoModel.getResourceErrorLatestTime(resourceErrorSortList[i].sourceUrl, param).then(data => {
        resourceErrorSortList[i].createdAt = data[0].createdAt
        resourceErrorSortList[i].happenTime = data[0].happenTime
      })
      // 查询影响页面
      await ResourceLoadInfoModel.getPageCountByResourceError(resourceErrorSortList[i].sourceUrl, param).then(data => {
        resourceErrorSortList[i].pageCount = data[0].pageCount
      })
      // 查询影响用户
      await ResourceLoadInfoModel.getCustomerCountByResourceError(resourceErrorSortList[i].sourceUrl, param).then(data => {
        resourceErrorSortList[i].customerCount = data[0].customerCount
      })
    }
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', resourceErrorSortList)
  }

  /**
   * 获取每天静态资源加载错误数量列表
   * @returns {Promise.<void>}
   */
  static async getResourceErrorCountByDay(ctx) {
    const param = utils.parseQs(ctx.request.url)
    await ResourceLoadInfoModel.getResourceErrorCountByDay(param).then(data => {
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
   * 根据时间获取一天内静态资源加载错误的数量信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getResourceErrorCountByHour(ctx) {
    const param = utils.parseQs(ctx.request.url)
    // const result = [];
    // const nowDate = new Date();
    // const year = nowDate.getFullYear();
    // const month = nowDate.getMonth() + 1;
    // const day = nowDate.getDate();
    // const nowHour = nowDate.getHours();
    // let hour = nowHour;
    // const startTimeStr = year + "-" + month + "-" + day + " ";
    // const endTimeStr = year + "-" + month + "-" + day + " ";
    // let startTime = startTimeStr + hour + ":00:00";
    // let endTime = endTimeStr + hour + ":59:59";
    // for (var i = 23; i >= 0; i -- ) {
    //   hour = nowHour - i;
    //   if (hour < 0) continue;
    //   startTime = startTimeStr + hour + ":00:00";
    //   endTime = endTimeStr + hour + ":59:59";
    //   await ResourceLoadInfoModel.getResourceErrorInfoListByHour(startTime, endTime, param).then(data => {
    //     result.push({day: hour + "点", count: data[0].count});
    //   })
    // }

    let result1 = []
    await ResourceLoadInfoModel.getResourceLoadErrorInfoListByHour(param).then(data => {
      result1 = data;
    })
    let result2 = []
    await ResourceLoadInfoModel.getResourceLoadErrorInfoListSevenDayAgoByHour(param).then(data => {
      result2 = data;
    })
    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询信息列表成功！', {today: result1, seven: result2})
  }

}

module.exports = ResourceLoadInfoController
