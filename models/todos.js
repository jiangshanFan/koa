// �����Ŀ¼�µ� db.js 
const db = require('../db');

// �˴�defineModel�ĵ�һ����������� models�ļ����е�����һ��
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