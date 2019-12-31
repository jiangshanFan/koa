const url = require('url');

const ws = require('ws');

const Cookies = require('cookies');

// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

const WebSocketServer = ws.Server;

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// ***************************************************** parse user from cookie， 全局所有接口路径调用时都会调用此回调函数，识别用户
app.use(async (ctx, next) => {
  ctx.state.user = parseUser(ctx.cookies.get('name') || '');
  await next();  // 必须添加，否则无法执行后续的接口路径调用
});
// ********************************************************************************************************************


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


// 第五个middleware 导入controller middleware，处理URL路由
const controller = require('./controller');
// 使用controller
app.use(controller());

/** **************************************** middleware的顺序很重要，也就是调用app.use()的顺序决定了middleware的顺序。********************************* */


/** *********************************** 引入websocket，首先创建websocket server并绑定到http server上， ************************************** */
// 创建 http.Server
/**
 * 在3000端口被koa占用后，WebSocketServer如何使用该端口？
 * 实际上，3000端口并非由koa监听，而是koa调用Node标准的http模块创建的http.Server监听的。
 * koa只是把响应函数注册到该http.Server中了。
 * 类似的，WebSocketServer也可以把自己的响应函数注册到http.Server中，这样，同一个端口，根据协议，可以分别由koa和ws处理：
 */
let server = app.listen(3000);

// 先把识别用户身份的逻辑提取为一个单独的函数：解析客户端websocket连接传递的请求request中的数据
function parseUser(obj) {
  if (!obj) {
    return;
  }
  let s = '';
  if (typeof obj === 'string') {
    s = obj;
  } else if (obj.headers) {
    let cookies = new Cookies(obj, null);
    s = cookies.get('name');
  }
  if (s) {
    try {
      let user = JSON.parse(Buffer.from(s, 'base64').toString());
      console.log(`User: ${user.name}, ID: ${user.id}`);
      return user;
    } catch (e) {
      // ignore
    }
  }
}


// ********************************************** 创建 websocket server 服务， 以及服务端处理函数
function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
  let wss = new WebSocketServer({
    server: server
  });
  // 广播：对于聊天应用来说，每收到一条消息，就需要把该消息广播到所有WebSocket连接上。
  wss.broadcast = function broadcast(data) {
    // wss.clients能够获取所有的客户端连接
    wss.clients.forEach(function each(client) {
      client.send(data);
    });
  };
  onConnection = onConnection || function() {
    console.log('[WebSocket] connected.');
  };
  onMessage = onMessage || function(msg) {
    console.log('[WebSocket] message received: ' + msg);
  };
  onClose = onClose || function(code, message) {
    console.log(`[WebSocket] closed: ${code} - ${message}`);
  };
  onError = onError || function(err) {
    console.log('[WebSocket] error: ' + err);
  };

  // 新版的 ws 调用 connection 方法的回调函数是两个参数，其中第一个表示请求中的所有参数
  wss.on('connection', function(ws, req) {
    let location = url.parse(req.url, true);
    console.log('[WebSocketServer] connection: ' + location.href);
    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);
    if (location.pathname !== '/ws/chat') {
        // close ws:
        ws.close(4000, 'Invalid URL');
    }
    // check user: 在WebSocketServer中，就需要响应connection事件，然后识别用户：
    let user = parseUser(req);
    if (!user) {
        ws.close(4001, 'Invalid user');
    }
    ws.user = user;
    ws.wss = wss;
    onConnection.apply(ws);  // 若识别成功则调用connection函数
  });
  console.log('WebSocketServer was attached.');
  return wss;
}


// 消息有很多类型，不一定是聊天的消息，还可以有获取用户列表、用户加入、用户退出等多种消息。
// 所以我们用createMessage()创建一个JSON格式的字符串，发送给浏览器，浏览器端的JavaScript就可以直接使用：
var messageIndex = 0;

function createMessage(type, user, data) {
  messageIndex++;
  return JSON.stringify({
    id: messageIndex,
    type: type,
    user: user,
    data: data
  });
}

function onConnect() {
  let user = this.user;
  let msg = createMessage('join', user, `${user.name} joined.`);
  this.wss.broadcast(msg);
  // build user list:
  //
  let users = this.wss.clients.forEach(function(client) {
      return client.user;
  });
  this.send(createMessage('list', user, users));
}

function onMessage(message) {
  console.log(message);
  if (message && message.trim()) {
    let msg = createMessage('chat', this.user, message.trim());
    this.wss.broadcast(msg);
  }
}

function onClose() {
  let user = this.user;
  let msg = createMessage('left', user, `${user.name} is left.`);
  this.wss.broadcast(msg);
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);

console.log('app started at port 3000...');

/** **************************************************** MVC模式注入结束 ************************************************************ */


/** ***************************************************************** 关联MySQL开始 ***************************************************** */

/*
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
*/

//// ********************************************************* 模块化定义controller 和 model
/** 导入所有的 models 文件夹中的 Model */
//const model = require('./model');
//// 创建 students 表对应的 Model
//let Student = model.students;

///*//使用then, catch方式解析Promise对象
//Student.create({
//  class_id: 2,
//  name: 'Gaffey',
//  gender: 'F',
//  score: 93,
//}).then(function (p) {
//  console.log('created.' + JSON.stringify(p));
//}).catch(function (err) {
//  console.log('failed: ' + err);
//});*/

//// 调用Sequelize定义的映射关系对象 Student，新增数据，当前是自执行，可以封装成方法调用
//(async () => {
//  var lisa = await Student.create({
//    class_id: 1,
//    name: 'lisa',
//    gender: 'M',
//    score: 91
//  });
//  console.log('created: ' + JSON.stringify(sam));
//})();


//// “删、改”数据需要先“查”数据，然后再通过save()以及destroy()方法进行操作
//(async () => {
//  var students = await Student.findAll({
//    where: {
//      name: 'lisa'
//    }
//  });
//  console.log(`find ${students.length} students:`);
//  for (let p of students) {
//    console.log(JSON.stringify(p));
//    console.log('update student...');
//    p.gender = 'F';
//    p.score = 100;
//    p.version++;
//    await p.save();
//    if (p.version === 3) {
//      await p.destroy();
//      console.log(`${p.name} was destroyed.`);
//    }
//  }
//})();

/** ******************************************************************* 关联MySQL结束 ************************************************** */


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


// ************************************************* http测试，端到端的HTTP自动化测试时使用的简单代码，需要注释上面的模板引擎 view.js 以及控制器 controller.js
/*
app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});
*/




/** ************************************************** app.js只负责创建app实例，不监听端口 *************************************************/
module.exports = app;

/** ************************************************** 在端口9000监听: *************************************************/
// 特别地，注意6000等端口不可以作为端口
/*
var server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});
*/