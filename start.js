// start.js ��������Ӧ��, �������Ǳ��ں���� http ����
const app = require('./app');

var server = app.listen(9002, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app started at http://%s:%s', host, port);
});