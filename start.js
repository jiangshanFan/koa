/** 
 * 把WebSocketServer绑定到同一个端口的关键代码是先获取koa创建的http.Server的引用，再根据http.Server创建WebSocketServer： 
 * 实际上，3000端口并非由koa监听，而是koa调用Node标准的http模块创建的http.Server监听的。
 * koa只是把响应函数注册到该http.Server中了。
 * 类似的，WebSocketServer也可以把自己的响应函数注册到http.Server中，这样，同一个端口，根据协议，可以分别由koa和ws处理：
 * */

// start.js 负责启动应用, 这样做是便于后面的 http 测试
const app = require('./app');

const websocket = require('./websocket');


// koa app的listen()方法返回 http.Server
let server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});


app.wss = websocket.createWebSocketServer(server, websocket.onConnect, websocket.onMessage, websocket.onClose);

console.log('app started at port 3000...');

// 要始终注意，浏览器创建WebSocket时发送的仍然是标准的HTTP请求。无论是WebSocket请求，还是普通HTTP请求，都会被http.Server处理。
// 具体的处理方式则是由koa和WebSocketServer注入的回调函数实现的。
// WebSocketServer会首先判断请求是不是WS请求，如果是，它将处理该请求，如果不是，该请求仍由koa处理。