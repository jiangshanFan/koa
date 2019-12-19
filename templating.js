// 在 index.js 文件中集成 Nunjucks，编写一个middleware
const nunjucks = require('nunjucks');

function createEnv(path, opts) {
  var
    autoescape = opts.autoescape === undefined ? true : opts.autoescape,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false,
    env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(path || 'views', {
        noCache: noCache,
        watch: watch,
      }), {
      autoescape: autoescape,
      throwOnUndefined: throwOnUndefined
    });

  if (opts.filters) {
    for (var f in opts.filters) {
      env.addFilter(f, opts.filters[f]);
    }
  }

  return env;
}

// 主要作用是返回一个middleware，在这个middleware中，只给ctx”安装“了一个render()函数，这样controller.js中就可以直接在ctx上进行render调用
function templating(path, opts) {
  // 创建Nunjucks的env对象
  var env = createEnv(path, opts);
  return async (ctx, next) => {
    // 给ctx绑定render函数
    ctx.render = function (view, modle) {
      // 把render后的内容赋值给response.body
      ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, modle || {}));
      // 设置Content-Type
      ctx.response.type = 'text/html';
    };

    // 继续处理请求
    await next();
  };
}

module.exports = templating;