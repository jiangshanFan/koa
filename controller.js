const fs = require('fs');

// add url-route in /controllers:
// ѭ�����õ�ǰĳ���������ļ�����hello.js�е�ÿһ��URL
function addMapping(router, mapping) {
  for (var url in mapping) {
    if (url.startsWith('GET ')) {
      // ���url����"GET xxx":
      var path = url.substring(4);
      router.get(path, mapping[url]);
      console.log(`register URL mapping: GET ${path}`);
    } else if (url.startsWith('POST ')) {
      // ���url����"POST xxx":
      var path = url.substring(5);
      router.post(path, mapping[url]);
      console.log(`register URL mapping: POST ${path}`);
    } else if (url.startsWith('PUT ')) {
      var path = url.substring(4);
      router.put(path, mapping[url]);
      console.log(`register URL mapping: PUT ${path}`);
    } else if (url.startsWith('DELETE ')) {
      var path = url.substring(7);
      router.del(path, mapping[url]);
      console.log(`register URL mapping: DELETE ${path}`);
    } else {
      // ��Ч��URL:
      console.log(`invalid URL: ${url}`);
    }
  }
}

function addControllers(router, dir) {
  // �ȵ���fsģ�飬Ȼ����readdirSync�г��ļ�
  // ���������sync����Ϊ����ʱֻ����һ�Σ���������������:
  // ���˳�.js�ļ�:
  fs.readdirSync(__dirname + '/' + dir).filter((f) => {
    return f.endsWith('.js');
  }).forEach((f) => {
    console.log(`process controller: ${f}...`);
    // ѭ������js�ļ���������URL������
    let mapping = require(__dirname + '/' + dir + '/' + f);
    addMapping(router, mapping);
  });
}

module.exports = function (dir) {
  let
    controllers_dir = dir || 'controllers',  // ����Ĭ��ֵ������undefined
    router = require('koa-router')();
  addControllers(router, controllers_dir);
  // ��ȡ���е�route
  return router.routes();
};