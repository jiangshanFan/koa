// 使用Model，需要引入对应的Model文件，自动化扫描models文件夹，导入所有的Model
const fs = require('fs');
const db = require('./db');

// 此处可以做判断，当默认的Model容器文件夹不是models时，替换？？？
let files = fs.readdirSync(__dirname + '/models');

// 过滤器，只读取后缀为 “.js” 的文件
let js_files = files.filter((f) => {
  return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
  console.log(`import model from file ${f}...`);
  let name = f.substring(0, f.length - 3);
  module.exports[name] = require(__dirname + '/models/' + f);
}

// Sequelize 提供了一个 sync() 方法，可以自动创建数据库
module.exports.sync = () => {
  db.sync();
};


//这样，需要用的时候，写起来就像这样：
//const model = require('./model');
//let Pet = model.Pet, User = model.User;
//var pet = await Pet.create({ ... });