// 处理静态文件夹 static 的入口文件
const path = require('path');
// 获取文件的格式
const mime = require('mime');
//mz提供的API和Node.js的fs模块完全相同，但fs模块使用回调，而mz封装了fs对应的函数，并改为Promise。这样，我们就可以非常简单的用await调用mz的函数，而不需要任何回调。
const fs = require('mz/fs');

// URL: 类似 '/static/'
// dir: 类似 _dirname + '/static'
function staticFiles(url, dir) {
  return async (ctx, next) => {
    let rpath = ctx.request.path;
    // 判断是否以指定的URL开头
    if (rpath.startsWith(url)) {
      // 获取文件完整路径
      // path.join() 方法使用平台特定的分隔符把全部给定的 path 片段连接到一起，并规范化生成的路径。会按照cd模式来执行生成的路径，Windows下默认是'\'
        let fp = path.join(dir, rpath.substring(url.length));
        console.log(fp);
      // 判断文件是否存在
      if (await fs.exists(fp)) {
        // 查找文件的mime
          ctx.response.type = mime.getType(rpath);
        // 读取文件内容并赋值给response.body
        ctx.response.body = await fs.readFile(fp);
      } else {
        // 文件不存在
        ctx.response.status = 404;
      }
    } else {
      // 不是指定前缀的URL，继续处理下一个middleware
      await next();
    }
  };
}

module.exports = staticFiles;