// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');


// 创建一个Koa对象表示web app本身:
const app = new Koa();

const auth = require('./auth');

/* ***************************************************** parse user from cookie， 全局所有接口路径调用时都会调用此回调函数，识别用户
 * 必须放在所有的middleware的前面，否则在请求接口路径时不会调用
 * 对于任何请求，app将调用该异步函数处理请求：Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
 * 此外，如果一个middleware没有调用await next() ，会怎么办？答案是后续的middleware将不再执行了。这种情况也很常见，
 */
app.use(async (ctx, next) => {
  ctx.state.user = auth(ctx.cookies.get('name') || '');
  await next();  // 必须添加，否则无法执行后续的接口路径调用
});


// koa middleware
/** ************************************** middleware的顺序很重要，也就是调用app.use()的顺序决定了middleware的顺序。****************************************** */

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
let staticFiles = require('./static.js');
app.use(staticFiles('/static/', __dirname + '/static'));


// 第三个middleware 解析post请求的主体body,特别注意必须在controller router引入之前导入，否则无法解析
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// 第四个middleware 导入Nunjucks模板引擎，给ctx“安装”一个render()函数
const view = require('./view');
//注意：生产环境上必须配置环境变量NODE_ENV = 'production'，而开发环境不需要配置，实际上NODE_ENV可能是undefined，所以判断的时候，不要用NODE_ENV === 'development'。
const isProduction = process.env.NODE_ENV === 'production';
app.use(view('views', {
  noCache: !isProduction,
  watch: !isProduction
}));


// bind .rest() for ctx: 处理 REST API
const rest = require('./rest');
// 执行 rest.restify() 返回一个异步回调函数，而app.use()会执行次函数，从而得到 ctx.rest()赋值
app.use(rest.restify()); 


// 第五个middleware 导入controller middleware，处理URL路由
const controller = require('./controller');
// 使用controller
app.use(controller());

/** **************************************** middleware 导入结束 ********************************* */
/** **************************************************** MVC模式注入结束 ************************************************************ */


/** ************************************************** app.use 的使用开始 ************************************************** */
/*
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`Time: ${ms}ms`);
});
*/

// 对于任何请求，app将调用该异步函数处理请求：
// Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
// 此外，如果一个middleware没有调用await next() ，会怎么办？答案是后续的middleware将不再执行了。这种情况也很常见，
// 例如，一个检测用户权限的middleware可以决定是否继续处理请求，还是直接返回403错误：

/*
app.use(async (ctx, next) => {
  if (await checkUserPermission(ctx)) {
    await next();
  } else {
    ctx.response.status = 403;
  }
});
*/


/* ************************************************* http测试，端到端的HTTP自动化测试时使用的简单代码，需要注释上面的模板引擎 view.js 以及控制器 controller.js

// 只是很简单的，在没有路由的前提下，进行的测试
app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});
 ****************************************************************************************************************************************** */


/** ************************************************** app.js只负责创建app实例，不监听端口 *************************************************/
module.exports = app;

/** ************************************************** 在端口9000监听: *************************************************/
// 特别地，注意6000等端口不可以作为端口