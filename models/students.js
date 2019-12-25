// �����Ŀ¼�µ� db.js 
const db = require('../db');

// �˴�defineModel�ĵ�һ����������� models�ļ����е�����һ��
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