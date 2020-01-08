# koa MVC

`第一步：在入口app.js文件中导入koa框架并创建实例new Koa()`

`第二步：添加记录URL和执行时间的middleware`

`第三步：添加static静态文件夹解析middleware`

`第四步：添加解析请求响应主体body的middleware，app.use(bodyParser())`

`第五步：添加模板引擎Nunjucks的middleware，给ctx“安装”一个render处理函数`

`第六步：添加controller.js处理路由`



# koa ORM(Sequelize) & products.js & api.js中的products部分，操作数据库的DEMO

`第一步：创建db.js统一建立Model，创建关系数据库和对象之间的映射关系构造函数（defineModel类）`

`第二步：创建model.js统一解析models文件夹中定义的映射关系`

`第三步：引入products.js文件处理所有商品相关的增删改查操作数据库，其他模块类似操作`

`第四步：在api.js文件中对不同的路由调用products.js中对应的处理函数`

`第五步：考虑是否有那些结构比较优化的处理方式`
