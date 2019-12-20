// 导入根目录下的 model.js 定义建立model的规则
const db = require('../db');

const students = db.defineModel('students', {
  class_id: db.BIGINT(20),
  name: db.STRING(100),
  gender: db.STRING(1),
  score: db.INTEGER(11)
});

module.exports = students;