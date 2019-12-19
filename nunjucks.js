// 测试Nunjucks模板引擎的入口文件
// 模板渲染本身速度非常快，因为就是字符串的拼接，纯CPU操作
// 性能问题主要出现在从文件读取模板内容这一步，是IO操作，Nunjucks默认是同步
// Nunjucks会缓存已读取的文件内容，再次请求可以从缓存拿出，只需要指定 noCache: false，但是在开发环境最好关闭设置为 true
const nunjucks = require('nunjucks');

// 变量env生成时需要传入读取文档的path路径以及模板引擎参数
function createEnv(path, opts) {
  var
    autoescape = opts.autoescape === undefined ? true : opts.autoescape,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false,
    // 新建模板引擎，配置环境变量
    env = new nunjucks.Environment(
      // 创建文件系统加载器，读取path路径下的所有文件
      new nunjucks.FileSystemLoader(path, {
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

// 变量env就表示Nunjucks模板引擎对象
var env = createEnv('views', {
  watch: true,
  filters: {
    hex: function (n) {
      return '0x' + n.toString(16);
    }
  }
});

// env模板引擎对象有一个render(view, model)方法，正好传入view和model两个参数，并返回字符串
var s = env.render('hello.html', {
  name: '<Nunjucks>',
  fruits: ['Apple', 'Pear', 'Banana'],
  count: 12000
});

console.log(s);

console.log(env.render('extend.html', {
  header: 'Hello',
  body: 'bla bla bla...'
}));