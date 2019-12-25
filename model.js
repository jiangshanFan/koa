// ʹ��Model����Ҫ�����Ӧ��Model�ļ����Զ���ɨ��models�ļ��У��������е�Model
const fs = require('fs');
const db = require('./db');

// �˴��������жϣ���Ĭ�ϵ�Model�����ļ��в���modelsʱ���滻������
let files = fs.readdirSync(__dirname + '/models');

// ��������ֻ��ȡ��׺Ϊ ��.js�� ���ļ�
let js_files = files.filter((f) => {
  return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
  console.log(`import model from file ${f}...`);
  let name = f.substring(0, f.length - 3);
  module.exports[name] = require(__dirname + '/models/' + f);
}

// Sequelize �ṩ��һ�� sync() �����������Զ��������ݿ�
module.exports.sync = () => {
  db.sync();
};


//��������Ҫ�õ�ʱ��д��������������
//const model = require('./model');
//let Pet = model.Pet, User = model.User;
//var pet = await Pet.create({ ... });