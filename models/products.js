// �����Ŀ¼�µ� db.js 
const db = require('../db');

// �˴�defineModel�ĵ�һ����������� models�ļ����е�����һ��
const products = db.defineModel('products', {
  id: {
    type: db.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: db.STRING(100),
  manufacturer: db.STRING(100),
  price: db.BIGINT,
});

module.exports = products;