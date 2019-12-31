/** ============================ 在入口文件中创建 WebSocket Server 服务器的实例 =============================== */

// 导入WebSocket模块
const WebSocket = require('ws');

// 引用Server类
const WebSocketServer = WebSocket.Server;

// 实例化
const wss = new WebSocketServer({
  port: 9990
});

/**
// ================================================= 在浏览器console中测试用例
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

// 打开一个WebSocket:
var ws = new WebSocket('ws://localhost:9990/test');
// 响应onmessage事件:
ws.onmessage = function (msg) { console.log(msg); };
// 给服务器发送一个字符串:
ws.onopen = function () {
  ws.send('Hello!');
}
*/

// 服务端默认响应 message
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

// 没有处理路由，请求任何地址都会得到一样的响应
let ws = new WebSocket('ws://localhost:9990/ws/chat');

// 打开WebSocket连接后立刻发送一条消息:
ws.on('open', function () {
  console.log(`[CLIENT] open()`);
  ws.send('Hello!');
});

// 响应收到的消息:
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
 *  打印如下：
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