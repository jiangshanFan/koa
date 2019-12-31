// sign in:

// 使用index变量保存登录的用户数量，在真实实例中会使用某个唯一标识来区分
var index = 0;

module.exports = {
  'GET /signin': async (ctx, next) => {
    let names = '甲乙丙丁戊己庚辛壬癸';
    let name = names[index % 10];
    ctx.render('signin.html', {
      name: `路人${name}`
    });
  },

  // 在signin.html中点击提交按钮调用当前RESTful API
  'POST /signin': async (ctx, next) => {
    index++;
    let name = ctx.request.body.name || '路人甲';
    let user = {
      id: index,
      name: name,
      image: index % 10 // 确认登录时的头像，真实实例中是获取用户自定义或者系统默认头像
    };
    // 将用户信息首先通过JSON.stringify转换成字符串类型，在通过Buffer.from转换成成二进制数据，最后通过toString方法转换成base64位
    // 后续调用websocket时可以通过解析获取到当前用户user的所有信息 JSON.parse(Buffer.from(s, 'base64').toString());
    let value = Buffer.from(JSON.stringify(user)).toString('base64');
    console.log(`Set cookie value: ${value}`);
    // 写入浏览器的cookie，然后执行app.use()【在app.js中】所有接口路径回调，将cookie值写入到ctx.state.user中
    ctx.cookies.set('name', value);
    ctx.response.redirect('/');
  },

  // 调用退出登录方法，清空浏览器的cookie，并跳转回登录signin.html页面
  'GET /signout': async (ctx, next) => {
    ctx.cookies.set('name', '');
    ctx.response.redirect('/signin');
  }
};