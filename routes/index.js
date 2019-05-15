const Router = require('koa-router')
const UserController = require('../controllers/user')
const ProjectController = require('../controllers/project')
const BehaviorInfoController = require('../controllers/behaviorInfo')
const JavascriptErrorInfo = require('../controllers/javascriptErrorInfo')
const ScreenShotInfo = require('../controllers/ScreenShotInfo')
const IgnoreErrorController = require('../controllers/ignoreError')
const CustomerPVController = require('../controllers/customerPV')
const LoadPageController = require('../controllers/loadPageInfo')
const ExtendBehaviorInfo = require('../controllers/extendBehaviorInfo')
const ResourceLoadInfo = require('../controllers/resourceLoadInfo')
const HttpLogInfo = require('../controllers/HttpLogInfo')
const CommonController = require('../controllers/common')
const router = new Router({
    prefix: '/server'
})

/**
 * 日志相关处理
 */
// 用户上传日志
router.post('/uploadLog', CommonController.uploadLog);
router.post('/upLg', CommonController.upLg);

// 上传拓展日志
router.post('/uploadExtendLog', CommonController.uploadExtendLog);
router.post('/extendBehavior', ExtendBehaviorInfo.create);



// 立邦的开关逻辑
router.get('/data', CommonController.liBangData);

/**
 *
 */
// 查询用户的行为列表
router.post('/searchUserBehaviors', CommonController.searchBehaviorsRecord);
// 查询用户的基本信息
router.post('/searchCustomerInfo', CommonController.searchCustomerInfo);


/**
 * 用户接口
 */
// 用户注册
router.post('/user', UserController.create);
// 用户登录
router.post('/user/login', UserController.login);
// 获取用户信息
router.get('/user', UserController.getUserInfo);
// 获取用户列表
router.get('/user/list', UserController.getUserList);
// 删除用户
router.delete('/user/:id', UserController.delete);

/**
 * 应用接口
 */
// 添加应用
router.post('/project', ProjectController.create);
// 获取应用详细信息
router.get('/projectDetail', ProjectController.detail);
// 获取应用列表
router.get('/project/list', ProjectController.getProjectList);

/**
 * 行为信息接口
 */
// 创建文章
router.post('/behaviorInfo', BehaviorInfoController.create);
// 获取文章列表
router.get('/behaviorInfo', BehaviorInfoController.getBehaviorInfoList);
// 获取文章详情
router.get('/behaviorInfo/:id', BehaviorInfoController.detail);
// 删除文章
router.delete('/behaviorInfo/:id', BehaviorInfoController.delete);
// 更改文章
router.put('/behaviorInfo/:id', BehaviorInfoController.update);

/**
 * 用户访问信息接口
 */
// 创建PV信息
router.post('/customerPV', CustomerPVController.create);
// 获取PV列表
router.get('/customerPV', CustomerPVController.getCustomerPVList);
// 获取PV详情
router.get('/customerPV/:id', CustomerPVController.detail);
// 删除PV
router.delete('/customerPV/:id', CustomerPVController.delete);
// 更改PV
router.put('/customerPV/:id', CustomerPVController.update);
// 获取日活量
router.post('/getCustomerCountByTime', CustomerPVController.getCustomerCountByTime);


/**
 * 用户加载页面信息接口
 */
// 创建加载信息
router.post('/loadPage', LoadPageController.create);
// 获取加载信息详情
router.get('/loadPage/:id', LoadPageController.detail);
// 删除加载信息
router.delete('/loadPage/:id', LoadPageController.delete);
// 更改加载信息
router.put('/loadPage/:id', LoadPageController.update);
// 查询当日页面加载的平均时间
router.post('/getPageLoadTimeByDate', LoadPageController.getPageLoadTimeByDate);

/**
 * JS错误信息接口
 */
// 创建JS错误
router.post('/javascriptErrorInfo', JavascriptErrorInfo.create);
// 获取JS错误列表
router.get('/javascriptErrorInfo', JavascriptErrorInfo.getJavascriptErrorInfoList);
// 获取JS错误详情
router.get('/javascriptErrorInfo/:id', JavascriptErrorInfo.detail);
// 删除JS错误
router.delete('/javascriptErrorInfo/:id', JavascriptErrorInfo.delete);
// 更改JS错误
router.put('/javascriptErrorInfo/:id', JavascriptErrorInfo.update);
// 查询一个月内每天的错误总量
router.get('/getJavascriptErrorInfoListByDay', JavascriptErrorInfo.getJavascriptErrorInfoListByDay);
// 查询一个天内每小时的错误量
router.get('/getJavascriptErrorInfoListByHour', JavascriptErrorInfo.getJavascriptErrorInfoListByHour);
// 根据JS错误数量进行分类排序
router.post('/getJavascriptErrorSort', JavascriptErrorInfo.getJavascriptErrorSort);
router.post('/getConsoleErrorSort', JavascriptErrorInfo.getConsoleErrorSort);
// 获取最近24小时内，js错误发生数量
router.get('/getJavascriptErrorCountByHour', JavascriptErrorInfo.getJavascriptErrorCountByHour);
// 获取各种平台js报错数量
router.get('/getJavascriptErrorCountByOs', JavascriptErrorInfo.getJavascriptErrorCountByOs);
// 获取各种平台js分类报错数量
router.get('/getJavascriptErrorCountByType', JavascriptErrorInfo.getJavascriptErrorCountByType);
// 根据ErrorMsg获取js错误列表
router.post('/getJavascriptErrorListByMsg', JavascriptErrorInfo.getJavascriptErrorListByMsg);
// 根据ErrorMsg获取js错误列表
router.post('/getJavascriptErrorAboutInfo', JavascriptErrorInfo.getJavascriptErrorAboutInfo);
// 根据页面获取js错误列表
router.get('/getJavascriptErrorListByPage', JavascriptErrorInfo.getJavascriptErrorListByPage);
// 定位JS错误代码
router.post('/getJavascriptErrorStackCode', JavascriptErrorInfo.getJavascriptErrorStackCode);

/**
 * JS错误信息截屏接口
 */
// 创建截屏信息
router.post('/screenShotInfo', ScreenShotInfo.create);
// 获取忽略js截屏信息列表
router.get('/getScreenShotInfoListByPage', ScreenShotInfo.getScreenShotInfoListByPage);
// 获取截屏详情
router.get('/screenShotInfo/:id', ScreenShotInfo.detail);
// 删除截屏
router.delete('/screenShotInfo/:id', ScreenShotInfo.delete);
/**
 * 忽略js错误信息接口
 */
// 创建忽略js错误信息
router.post('/ignoreError', IgnoreErrorController.create);
// 获取忽略js错误信息列表
router.get('/ignoreError', IgnoreErrorController.getIgnoreErrorList);
// 获取应用忽略js错误信息列表
router.get('/ignoreErrorByApplication', IgnoreErrorController.ignoreErrorByApplication);
// 获取忽略js错误信息详情
router.get('/ignoreError/:id', IgnoreErrorController.detail);
// 删除忽略js错误信息
router.delete('/ignoreError/:id', IgnoreErrorController.delete);
// 更改忽略js错误信息
router.put('/ignoreError/:id', IgnoreErrorController.update);

/**
 * 静态资源加载状态接口
 */
// 获取静态资源错误分类
router.get('/getResourceErrorCountByDay', ResourceLoadInfo.getResourceErrorCountByDay);
router.post('/getResourceLoadInfoListByDay', ResourceLoadInfo.getResourceLoadInfoListByDay);
// 获取最近24小时内，静态资源加载错误发生数量
router.get('/getResourceErrorCountByHour', ResourceLoadInfo.getResourceErrorCountByHour);


/**
 * 静态资源加载状态接口
 */
// 获取静态资源错误分类
router.get('/getHttpErrorCountByHour', HttpLogInfo.getHttpErrorInfoListByHour);



// 获取静态资源错误分类
router.post('/createNewProject', ProjectController.createNewProject);


module.exports = router
