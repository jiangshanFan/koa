/** ============================ ������ļ��д��� WebSocket Server ��������ʵ�� =============================== */

// ����WebSocketģ��
const WebSocket = require('ws');

// ����Server��
const WebSocketServer = WebSocket.Server;

// ʵ����
const wss = new WebSocketServer({
  port: 9990
});

/**
// ================================================= �������console�в�������
wss.on('connection', function (ws) {
  console.log(`[SERVER] connection()`);
  ws.on('message', function (message) {
    console.log(`[SERVER] Received: ${message}`);
    ws.send(`ECHO: ${message}`, (err) => {
      if (err) {
        console.log(`[SERVER] error: ${err}`);
      }
    });
  })
});

// ��һ��WebSocket:
var ws = new WebSocket('ws://localhost:9990/test');
// ��Ӧonmessage�¼�:
ws.onmessage = function (msg) { console.log(msg); };
// ������������һ���ַ���:
ws.onopen = function () {
  ws.send('Hello!');
}
*/

// �����Ĭ����Ӧ message
wss.on('connection', function (ws) {
  console.log(`[SERVER] connection()`);
  ws.on('message', function (message) {
    console.log(`[SERVER] Received: ${message}`);
    setTimeout(() => {
      ws.send(`What's your name?`, (err) => {
        if (err) {
          console.log(`[SERVER] error: ${err}`);
        }
      });
    }, 1000);
  })
});
 

console.log('ws server started at port 9990...');

// ======================================================== client test:

let count = 0;

// û�д���·�ɣ������κε�ַ����õ�һ������Ӧ
let ws = new WebSocket('ws://localhost:9990/ws/chat');

// ��WebSocket���Ӻ����̷���һ����Ϣ:
ws.on('open', function () {
  console.log(`[CLIENT] open()`);
  ws.send('Hello!');
});

// ��Ӧ�յ�����Ϣ:
ws.on('message', function (message) {
  console.log(`[CLIENT] Received: ${message}`);
  count++;
  if (count > 3) {
    ws.send('Goodbye!');
    ws.close();
  } else {
    setTimeout(() => {
      ws.send(`Hello, I'm Mr No.${count}!`);
    }, 1000);
  }
});

/**
 *  ��ӡ���£�
    D: \VisualStudio\NodeTest\koa\basic\websocket > node app
    ws server started at port 9990...
    [SERVER] connection()
    [CLIENT] open()
    [SERVER] Received: Hello!
    [CLIENT] Received: What's your name?
    [SERVER] Received: Hello, I'm Mr No.1!
    [CLIENT] Received: What's your name?
    [SERVER] Received: Hello, I'm Mr No.2!
    [CLIENT] Received: What's your name?
    [SERVER] Received: Hello, I'm Mr No.3!
    [CLIENT] Received: What's your name?
    [SERVER] Received: Goodbye!
    [SERVER] error: Error: WebSocket is not open: readyState 3(CLOSED)
 */