/** 
 * ��WebSocketServer�󶨵�ͬһ���˿ڵĹؼ��������Ȼ�ȡkoa������http.Server�����ã��ٸ���http.Server����WebSocketServer�� 
 * ʵ���ϣ�3000�˿ڲ�����koa����������koa����Node��׼��httpģ�鴴����http.Server�����ġ�
 * koaֻ�ǰ���Ӧ����ע�ᵽ��http.Server���ˡ�
 * ���Ƶģ�WebSocketServerҲ���԰��Լ�����Ӧ����ע�ᵽhttp.Server�У�������ͬһ���˿ڣ�����Э�飬���Էֱ���koa��ws����
 * */

// ���� url, cookies
// ע�⣺Koa ʹ���� Express �� cookies ģ�飬options ����ֻ�Ǽ򵥵�ֱ�ӽ��д��ݡ�
const url = require('url');

// ���� ws ģ��
const ws = require('ws');

const Cookies = require('cookies');

// start.js ��������Ӧ��, �������Ǳ��ں���� http ����
const app = require('./app');

// ����WebSocket Server
const WebSocketServer = ws.Server;


// parse user from cookie
app.use(async (ctx, next) => {
  ctx.state.user = parseUser(ctx.cookies.get('name') || '');
  await next();
});


// koa app��listen()�������� http.Server
let server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});


// ע�⣬���������в�δ��cookie����hash������ȡcookie�������ctx.state��
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

// Ҫʼ��ע�⣬���������WebSocketʱ���͵���Ȼ�Ǳ�׼��HTTP����������WebSocket���󣬻�����ͨHTTP���󣬶��ᱻhttp.Server����
// ����Ĵ���ʽ������koa��WebSocketServerע��Ļص�����ʵ�ֵġ�
// WebSocketServer�������ж������ǲ���WS��������ǣ��������������������ǣ�����������koa����