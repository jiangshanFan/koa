// Ϊ��ͳһ����Model��������ϵ���ݿ�Ͷ���֮���ӳ���ϵ
const Sequelize = require('sequelize');

const uuid = require('node-uuid');

const config = require('./config');

console.log('init sequelize...');

function generateId() {
  return uuid.v4();
}
console.log(config);
var sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
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

  //attrs.u_id = {
  //  type: ID_TYPE,
  //  allowNull: false
  //};
  //attrs.createdAt = {
  //  type: Sequelize.BIGINT,
  //  allowNull: false
  //};
  //attrs.updatedAt = {
  //  type: Sequelize.BIGINT,
  //  allowNull: false
  //};
  //attrs.version = {
  //  type: Sequelize.BIGINT,
  //  allowNull: false
  //};

  // ��ӡ��ǰ����͹�ϵ���ݿ���ӳ���ϵ
  console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
    if (k === 'type') {
      for (let key in Sequelize) {
        if (key === 'ABSTRACT' || key === 'NUMBER') {
          continue;
        }
        let dbType = Sequelize[key];
        if (typeof dbType === 'function') {
          if (v instanceof dbType) {
            if (v._length) {
              return `${dbType.key}(${v._length})`;
            }
            return dbType.key;
          }
          if (v === dbType) {
            return dbType.key;
          }
        }
      }
    }
    return v;
  }, '  '));

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
          if (!obj.u_id) {
            // generateId()������ node-uuid ģ�����ɵ� UID Ψһ��ʶ
            obj.u_id = generateId();
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
 

var exp = {
  defineModel: defineModel,
  sync: () => {
    // only allow create ddl in non-production environment
    if (process.env.NODE_ENV !== 'production') {
      console.log(process.env.NODE_ENV);
      sequelize.sync({ force: true });
    } else {
      throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    }
  }
};

// ��Ӧ db.js �е����Ͷ���� Sequelize �����Ͷ�Ӧ
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];
for (let type of TYPES) {
  exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;