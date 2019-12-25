// �� index.js �ļ��м��� Nunjucks����дһ��middleware
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

// ��Ҫ�����Ƿ���һ��middleware�������middleware�У�ֻ��ctx����װ����һ��render()����������controller.js�оͿ���ֱ����ctx�Ͻ���render����
function templating(path, opts) {
  // ����Nunjucks��env����
  var env = createEnv(path, opts);
  return async (ctx, next) => {
    // ��ctx��render����
    ctx.render = function (view, modle) {
      // ��render������ݸ�ֵ��response.body
      ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, modle || {}));
      // ����Content-Type
      ctx.response.type = 'text/html';
    };

    // ������������
    await next();
  };
}

module.exports = templating;