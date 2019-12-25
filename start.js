// start.js 负责启动应用, 这样做是便于后面的 http 测试
const app = require('./app');

var server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});