// ���� url, cookies
// ע�⣺Koa ʹ���� Express �� cookies ģ�飬options ����ֻ�Ǽ򵥵�ֱ�ӽ��д��ݡ�
const url = require('url');

// ���� ws ģ��
const ws = require('ws');

// ����WebSocket Server
const WebSocketServer = ws.Server;

const auth = require('./auth');

// ********************************************** ���� websocket server ���� �Լ�����˴�����
function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
  let wss = new WebSocketServer({
    server: server
  });
  // �㲥����������Ӧ����˵��ÿ�յ�һ����Ϣ������Ҫ�Ѹ���Ϣ�㲥������WebSocket�����ϡ�
  wss.broadcast = function broadcast(data) {
    // wss.clients�ܹ���ȡ���еĿͻ�������
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

  // �°�� ws ���� connection �����Ļص��������������������е�һ����ʾ�����е����в���
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
    // check user: ��WebSocketServer�У�����Ҫ��Ӧconnection�¼���Ȼ��ʶ���û���
    let user = auth(req);
    if (!user) {
      ws.close(4001, 'Invalid user');
    }
    ws.user = user;
    ws.wss = wss;
    onConnection.apply(ws);  // ��ʶ��ɹ������connection����
  });
  console.log('WebSocketServer was attached.');
  return wss;
}


// ��Ϣ�кܶ����ͣ���һ�����������Ϣ���������л�ȡ�û��б��û����롢�û��˳��ȶ�����Ϣ��
// ����������createMessage()����һ��JSON��ʽ���ַ��������͸��������������˵�JavaScript�Ϳ���ֱ��ʹ�ã�
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


/** ******************************** �ڿͻ��˴�����ws���ӣ��ᾭ�������wss�����д������ӹ� ************************************* */
function onConnect() {
  let user = this.user;
  let msg = createMessage('join', user, `${user.name} joined.`);
  // ����˽�ĳ���ͻ��˵���Ϣ�㲥�����еĿͻ���
  this.wss.broadcast(msg); 
  
  // build user list: ��ȡ���пͻ��˵�ws���ӣ����ҷ��ؿͻ��˵�¼�û� users
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