// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// koa middleware
//middleware的顺序很重要，也就是调用app.use()的顺序决定了middleware的顺序。
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
app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});

// 在端口9000监听:
// 特别地，注意6000等端口不可以作为端口
var server = app.listen(9000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});