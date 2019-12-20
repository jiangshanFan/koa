// Ϊ��ͳһ����Model��������ϵ���ݿ�Ͷ���֮���ӳ���ϵ
const Sequelize = require('sequelize');

console.log('init sequelize...');

var sequelize = new Sequelize('dbname', 'username', 'password', {
  host: '10.9.1.84',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

const ID_TYPE = Sequelize.STRING(50);

// name ��Ӧ���ݿ��еı���
function defineModel(name, attributes) {
  // attrs��ӳ���ϵ�����Լ���
  var attrs = {};
  // Ĭ������allowNull: false, ����Ҫ�޸ı�����������
  for (let key in attributes) {
    let value = attributes[key];
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false;
      attrs[key] = value;
    } else {
      attrs[key] = {
        type: value,
        allowNull: false
      }
    }
  }

  attrs.id = {
    type: ID_TYPE,
    primaryKey: true
  };
  attrs.createdAt = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  attrs.updatedAt = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  attrs.version = {
    type: Sequelize.BIGINT,
    allowNull: false
  };

  // ����ӳ���ϵ, name �����ݿ��Ӧ�ı���
  return sequelize.define(name, attrs, {
    tableName: name,
    timestamps: false,
    // Sequelize�ڴ������޸�Entityʱ���������ָ���ĺ�������Щ����ͨ��hooks�ڶ���Modelʱ�趨��
    // ������beforeValidate����¼��и����Ƿ���isNewRecord�����������������Ϊnull��undefined��������ʱ����Ͱ汾�š�
    hooks: {
      beforeValidate: function (obj) {
        let now = Date.now();
        if (obj.isNewRecord) {
          if (!obj.id) {
            // generateId()����
            obj.id = generateId();
          }
          obj.createdAt = now;
          obj.updatedAt = now;
          obj.version = 0;
        } else {
          obj.updatedAt = Date.now();
          obj.version++;
        }
      }
    }
  });
}