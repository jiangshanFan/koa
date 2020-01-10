// 导入根目录下的 db.js 
const db = require('../db');

// 此处defineModel的第一个参数必须和 models文件夹中的名字一致
const todos = db.defineModel('todos', {
  id: {
    type: db.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: db.STRING(100),
  description: db.STRING(200),
});

module.exports = todos;