// ����Nunjucksģ�����������ļ�
// ģ����Ⱦ�����ٶȷǳ��죬��Ϊ�����ַ�����ƴ�ӣ���CPU����
// ����������Ҫ�����ڴ��ļ���ȡģ��������һ������IO������NunjucksĬ����ͬ��
// Nunjucks�Ỻ���Ѷ�ȡ���ļ����ݣ��ٴ�������Դӻ����ó���ֻ��Ҫָ�� noCache: false�������ڿ���������ùر�����Ϊ true
const nunjucks = require('nunjucks');

// ����env����ʱ��Ҫ�����ȡ�ĵ���path·���Լ�ģ���������
function createEnv(path, opts) {
  var
    autoescape = opts.autoescape === undefined ? true : opts.autoescape,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false,
    // �½�ģ�����棬���û�������
    env = new nunjucks.Environment(
      // �����ļ�ϵͳ����������ȡpath·���µ������ļ�
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

// ����env�ͱ�ʾNunjucksģ���������
var env = createEnv('views', {
  watch: true,
  filters: {
    hex: function (n) {
      return '0x' + n.toString(16);
    }
  }
});

// envģ�����������һ��render(view, model)���������ô���view��model�����������������ַ���
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