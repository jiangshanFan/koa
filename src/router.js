const Koa = require('koa');

// ע��require('koa-router')���ص��Ǻ���
const router = require('koa-router')();

// post �����н���body
const bodyPaser = require('koa-bodyparser');

const app = new Koa();

app.use(bodyPaser());

// log request URL
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// add url-route
router.get('/hello/:name', async (ctx, next) => {
  var name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}!</h1>`;
});

// default ��/�� �������
router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>Index</h1>
    <form action="/signin" method="post">
      <p>Name: <input name="name" value="koa"></p>
      <p>Password: <input name="password" type="password"></p>
      <p><input type="submit" value="Submit"></p>
    </form>`;
});


// ���� post ����
router.post('/signin', async (ctx, next) => {
  var name = ctx.request.body.name || '',
    password = ctx.request.body.password || '';
  console.log(`signin with name: ${name}, password: ${password}`);
  if (name === 'koa' && password === '12345') {
    // ���ֱ����תĳ��ָ����ҳ�棿
    ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
  } else {
    ctx.response.body = `<h1>Login failed!</h1>
      <p><a href="/">Try again</a></p>`;
  }
})

// add router middleware
app.use(router.routes());

app.listen(9001);
console.log('app started at port 9001...');
