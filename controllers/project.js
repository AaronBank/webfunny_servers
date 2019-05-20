const ProjectModel = require('../modules/project')
const statusCode = require('../util/status-code')
const fetch = require('node-fetch')
class ProjectController {
    /**
     * 创建信息
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async create(ctx) {
        let req = ctx.request.body;

        if (req.title && req.author && req.content && req.category) {
            let ret = await ProjectModel.createProject(req);
            let data = await ProjectModel.getProjectDetail(ret.id);

            ctx.response.status = 200;
            ctx.body = statusCode.SUCCESS_200('创建信息成功', data)
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
    static async getProjectList(ctx) {
        let req = ctx.request.body

        if (req) {
            const data = await ProjectModel.getProjectList();

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
            let data = await ProjectModel.getProjectDetail(id);

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
            await ProjectModel.deleteProject(id);

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
            await ProjectModel.updateProject(id, req);
            let data = await ProjectModel.getProjectDetail(id);

            ctx.response.status = 200;
            ctx.body = statusCode.SUCCESS_200('更新信息成功！', data);
        } else {

            ctx.response.status = 412;
            ctx.body = statusCode.ERROR_412('更新信息失败！')
        }
    }

    /**
     * 创建新项目
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async createNewProject(ctx) {
        const data = JSON.parse(ctx.request.body)
        const webMonitorId = data.webMonitorId
        if (data) {
            let result = await ProjectModel.checkProjectName(data.projectName)
            const count = parseInt(result[0].count)
            if (count <= 0) {
                let monitorCode = ""
                await fetch("http://www.webfunny.cn/resource/monitor.fetch.min.js")
                  .then( res => res.text())
                  .then( body => {
                      monitorCode = encodeURIComponent(body.toString().replace(/jeffery_webmonitor/g, webMonitorId));
                  });
                data.monitorCode = monitorCode
                data.projectType = "customer"
                data.remotePath = "//www.webfunny.cn/resource/monitor.fetch.min.js?id=" + webMonitorId
                await ProjectModel.createProject(data);
                ctx.response.status = 200;
                ctx.body = statusCode.SUCCESS_200('创建信息成功', data)
            } else {
                ctx.response.status = 200;
                ctx.body = statusCode.SUCCESS_200('项目名重复，创建信息失败', count)
            }

        } else {

            ctx.response.status = 412;
            ctx.body = statusCode.ERROR_412('创建信息失败，请求参数不能为空！')
        }
    }
}

module.exports = ProjectController
