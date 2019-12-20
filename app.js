// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// koa middleware
// middleware的顺序很重要，也就是调用app.use()的顺序决定了middleware的顺序。

// 第一个middleware 记录URL以及页面执行时间
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  var
    start = new Date().getTime(),
    execTime;
  await next();
  execTime = new Date().getTime - start;
  ctx.response.set('X-Response-Time', `${execTime}ms`);
});


// 第二个middleware 添加处理 static 静态文件的 middleware
const staticFiles = require('./static');
app.use(staticFiles('/static/', __dirname + 'static'));


// 第三个middleware 解析post请求的主体body,特别注意必须在controller router引入之前导入，否则无法解析
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// 第四个middleware 导入Nunjucks模板引擎，给ctx“安装”一个render()函数
const templating = require('./templating');
//注意：生产环境上必须配置环境变量NODE_ENV = 'production'，而开发环境不需要配置，实际上NODE_ENV可能是undefined，所以判断的时候，不要用NODE_ENV === 'development'。
const isProduction = process.env.NODE_ENV === 'production';
app.use(templating('views', {
  noCache: !isProduction,
  watch: !isProduction
}));


// 第五个middleware 导入controller middleware，处理URL路由
const controller = require('./controller');
// 使用controller
app.use(controller());


/** ======================================================== MVC 模式 注入 结束 =========================================================== */



/** ====================================================== 关联 MySQL 开始 ===========================================================*/
const Sequelize = require('sequelize');

const config = require('./config');

console.log('init sequelize...');

// 创建Sequelize实例，关联数据库
var sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 30000
  }
});

// 定义对象和关系数据库的映射
var Student = sequelize.define('students', {
  id: {
    type: Sequelize.BIGINT(20),
    autoIncrement: true,
    primaryKey: true
  },
  class_id: Sequelize.BIGINT(20),
  name: Sequelize.STRING(100),
  gender: Sequelize.STRING(1),
  score: Sequelize.INTEGER(11)
}, {
  timestamps: false
});


////使用then, catch方式解析Promise对象
//Student.create({
//  class_id: 2,
//  name: 'Gaffey',
//  gender: 'F',
//  score: 93,
//}).then(function (p) {
//  console.log('created.' + JSON.stringify(p));
//}).catch(function (err) {
//  console.log('failed: ' + err);
//});


// 调用Sequelize定义的映射关系对象 Student，新增数据，当前是自执行，可以封装成方法调用
(async () => {
  var sam = await Student.create({
    class_id: 1,
    name: 'sam',
    gender: 'M',
    score: 91
  });
  console.log('created: ' + JSON.stringify(sam));
})();


// “删、改”数据需要先“查”数据，然后再通过save()以及destroy()方法进行操作
(async () => {
  var students = await Student.findAll({
    where: {
      name: 'Gaffey'
    }
  });
  console.log(`find ${students.length} students:`);
  for (let p of students) {
    console.log(JSON.stringify(p));
    console.log('update student...');
    p.gender = 'M';
    p.score = 100;
    p.version++;
    await p.save();
    if (p.version === 3) {
      await p.destroy();
      console.log(`${p.name} was destroyed.`);
    }
  }
})();
/** ================================================= 关联 MySQL 结束 ========================================================= */


/*app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`Time: ${ms}ms`);
});*/

// 对于任何请求，app将调用该异步函数处理请求：
// Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
// 此外，如果一个middleware没有调用await next() ，会怎么办？答案是后续的middleware将不再执行了。这种情况也很常见，
//例如，一个检测用户权限的middleware可以决定是否继续处理请求，还是直接返回403错误：
//app.use(async (ctx, next) => {
//  if (await checkUserPermission(ctx)) {
//    await next();
//  } else {
//    ctx.response.status = 403;
//  }
//});
/*app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});*/



/** ========================================================= 在端口9000监听: ================================================*/
// 特别地，注意6000等端口不可以作为端口
var server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});