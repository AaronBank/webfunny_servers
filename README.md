# webfunny_servers


[点击前往线上Demo](https://www.webfunny.cn/)

[点击前往博客讲解](https://www.cnblogs.com/warm-stranger/p/10209990.html)    

[如果实在嫌部署麻烦，Demo系统可以提供7天的监控量，我会长期维护，点击跳转](https://www.webfunny.cn/webfunny/createProject)
    
监控系统日志分析后台


运行环境：
    关于环境安装如果有问题，可以参考 [阿里云服务器搭建篇](https://zhuanlan.zhihu.com/p/35760691) 
    安装nodejs 10.6.0 环境， 
    安装mysql数据库， 
    将config/db.js配置正确，以确保能够连接上mysql数据库
    
运行项目：

    执行 npm install
    
    执行 npm run start 即可自动创建数据库表
    
    所有接口都在 routes/index.js 文件里
