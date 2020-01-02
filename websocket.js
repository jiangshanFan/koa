// 导入 url, cookies
// 注意：Koa 使用了 Express 的 cookies 模块，options 参数只是简单地直接进行传递。
const url = require('url');

// 导入 ws 模块
const ws = require('ws');

// 创建WebSocket Server
const WebSocketServer = ws.Server;

const auth = require('./auth');

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

  // 新版的 ws 调用 connection 方法的回调函数是两个参数，其中第一个表示请求中的所有参数
  wss.on('connection', function (ws, req) {
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
    let user = auth(req);
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


/** ******************************** 在客户端创建了ws连接，会经过服务端wss的下列处理函数加工 ************************************* */
function onConnect() {
  let user = this.user;
  let msg = createMessage('join', user, `${user.name} joined.`);
  // 服务端将某个客户端的消息广播到所有的客户端
  this.wss.broadcast(msg); 
  
  // build user list: 获取所有客户端的ws连接，并且返回客户端登录用户 users
  let users = [];
  this.wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      users.push(client.user);
    }
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


module.exports = {
  createWebSocketServer,
  onConnect,
  onMessage,
  onClose
}