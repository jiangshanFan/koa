// 导入根目录下的 db.js 
const db = require('../db');

// 此处defineModel的第一个参数必须和 models文件夹中的名字一致
const students = db.defineModel('students', {
  id: {
    type: db.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  class_id: db.BIGINT,
  name: db.STRING(100),
  gender: db.STRING(1),
  score: db.INTEGER(11),
  u_id: db.STRING(100)
});

module.exports = students;