// ************** 先把识别用户身份的逻辑提取为一个单独的函数：解析客户端websocket连接传递的请求request中的数据
const Cookies = require('cookies');

module.exports = function parseUser(obj) {
  if (!obj) {
    return;
  }
  let s = '';
  if (typeof obj === 'string') {
    s = obj;
  } else if (obj.headers) {
    let cookies = new Cookies(obj, null);
    s = cookies.get('name');
  }
  if (s) {
    try {
      let user = JSON.parse(Buffer.from(s, 'base64').toString());
      console.log(`User: ${user.name}, ID: ${user.id}`);
      return user;
    } catch (e) {
      // ignore
    }
  }
}