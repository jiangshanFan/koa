# koa MVC

`第一步：在入口app.js文件中导入koa框架并创建实例new Koa()`

`第二步：添加记录URL和执行时间的middleware`

`第三步：添加static静态文件夹解析middleware`

`第四步：添加解析请求响应主体body的middleware，app.use(bodyParser())`

`第五步：添加模板引擎Nunjucks的middleware，给ctx“安装”一个render处理函数`

`第六步：添加controller.js处理路由`

