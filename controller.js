const fs = require('fs');

// add url-route in /controllers:
// 循环设置当前某个控制器文件比如hello.js中的每一个URL
function addMapping(router, mapping) {
  for (var url in mapping) {
    if (url.startsWith('GET ')) {
      // 如果url类似"GET xxx":
      var path = url.substring(4);
      router.get(path, mapping[url]);
      console.log(`register URL mapping: GET ${path}`);
    } else if (url.startsWith('POST ')) {
      // 如果url类似"POST xxx":
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
      // 无效的URL:
      console.log(`invalid URL: ${url}`);
    }
  }
}

function addControllers(router, dir) {
  // 先导入fs模块，然后用readdirSync列出文件
  // 这里可以用sync是因为启动时只运行一次，不存在性能问题:
  // 过滤出.js文件:
  fs.readdirSync(__dirname + '/' + dir).filter((f) => {
    return f.endsWith('.js');
  }).forEach((f) => {
    console.log(`process controller: ${f}...`);
    // 循环导入js文件，并调用URL处理函数
    let mapping = require(__dirname + '/' + dir + '/' + f);
    addMapping(router, mapping);
  });
}

module.exports = function (dir) {
  let
    controllers_dir = dir || 'controllers',  // 设置默认值，避免undefined
    router = require('koa-router')();
  addControllers(router, controllers_dir);
  // 获取所有的route
  return router.routes();
};