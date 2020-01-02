/** 
 * ��WebSocketServer�󶨵�ͬһ���˿ڵĹؼ��������Ȼ�ȡkoa������http.Server�����ã��ٸ���http.Server����WebSocketServer�� 
 * ʵ���ϣ�3000�˿ڲ�����koa����������koa����Node��׼��httpģ�鴴����http.Server�����ġ�
 * koaֻ�ǰ���Ӧ����ע�ᵽ��http.Server���ˡ�
 * ���Ƶģ�WebSocketServerҲ���԰��Լ�����Ӧ����ע�ᵽhttp.Server�У�������ͬһ���˿ڣ�����Э�飬���Էֱ���koa��ws����
 * */

// start.js ��������Ӧ��, �������Ǳ��ں���� http ����
const app = require('./app');

const websocket = require('./websocket');


// koa app��listen()�������� http.Server
let server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});


app.wss = websocket.createWebSocketServer(server, websocket.onConnect, websocket.onMessage, websocket.onClose);

console.log('app started at port 3000...');

// Ҫʼ��ע�⣬���������WebSocketʱ���͵���Ȼ�Ǳ�׼��HTTP����������WebSocket���󣬻�����ͨHTTP���󣬶��ᱻhttp.Server����
// ����Ĵ���ʽ������koa��WebSocketServerע��Ļص�����ʵ�ֵġ�
// WebSocketServer�������ж������ǲ���WS��������ǣ��������������������ǣ�����������koa����