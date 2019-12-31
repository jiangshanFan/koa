/** 
 * 把WebSocketServer绑定到同一个端口的关键代码是先获取koa创建的http.Server的引用，再根据http.Server创建WebSocketServer： 
 * 实际上，3000端口并非由koa监听，而是koa调用Node标准的http模块创建的http.Server监听的。
 * koa只是把响应函数注册到该http.Server中了。
 * 类似的，WebSocketServer也可以把自己的响应函数注册到http.Server中，这样，同一个端口，根据协议，可以分别由koa和ws处理：
 * */

// 导入 url, cookies
// 注意：Koa 使用了 Express 的 cookies 模块，options 参数只是简单地直接进行传递。
const url = require('url');

// 导入 ws 模块
const ws = require('ws');

const Cookies = require('cookies');

// start.js 负责启动应用, 这样做是便于后面的 http 测试
const app = require('./app');

// 创建WebSocket Server
const WebSocketServer = ws.Server;


// parse user from cookie
app.use(async (ctx, next) => {
  ctx.state.user = parseUser(ctx.cookies.get('name') || '');
  await next();
});


// koa app的listen()方法返回 http.Server
let server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});


// 注意，下述函数中并未对cookie进行hash处理，获取cookie并存放在ctx.state中
function parseUser(obj) {
  if (!obj) {
    return;
  }
  console.log('try parse: ' + obj);
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


function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
  let wss = new WebSocketServer({
    server: server
  });

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      client.send(data);
    });
  };

  onConnection = onConnection || function () {
    console.log('[WebSocket] connected.');
  };
  onMessage = onMessage || function (msg) {
    console.log('[WebSocket] message received: ' + msg);
  };
  onClose = onClose || function (code, message) {
    console.log(`[WebSocket] closed: ${code} - ${message}`);
  };
  onError = onError || function (err) {
    console.log('[WebSocket] error: ' + err);
  };

  wss.on('connection', function (ws) {
    let location = url.parse(ws.upgradeReq.url, true);
    console.log('[WebSocketServer] connection: ' + location.href);
    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);
    if (location.pathname !== '/ws/chat') {
      // close ws
      ws.close(4000, 'Invalid URL');
    }

    // check user
    let user = parseUser(ws.upgradeReq);
    if (!user) {
      ws.close(4001, 'Invalid user');
    }
    ws.user = user;
    ws.wss = wss;
    onConnection.apply(ws);  // ???
  });
  console.log('WebSocketServer was attached.');
  return wss;
}


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
  let users = this.wss.clients.map(function (client) {
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

// 要始终注意，浏览器创建WebSocket时发送的仍然是标准的HTTP请求。无论是WebSocket请求，还是普通HTTP请求，都会被http.Server处理。
// 具体的处理方式则是由koa和WebSocketServer注入的回调函数实现的。
// WebSocketServer会首先判断请求是不是WS请求，如果是，它将处理该请求，如果不是，该请求仍由koa处理。