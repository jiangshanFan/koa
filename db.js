// 为了统一建立Model，创建关系数据库和对象之间的映射关系
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

// name 对应数据库中的表名
function defineModel(name, attributes) {
  // attrs是映射关系的属性集合
  var attrs = {};
  // 默认设置allowNull: false, 若需要修改必须显性设置
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

  // 打印当前对象和关系数据库表的映射关系
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

  // 返回映射关系, name 是数据库对应的表名
  return sequelize.define(name, attrs, {
    tableName: name,
    timestamps: false,
    // Sequelize在创建、修改Entity时会调用我们指定的函数，这些函数通过hooks在定义Model时设定。
    // 我们在beforeValidate这个事件中根据是否是isNewRecord设置主键（如果主键为null或undefined）、设置时间戳和版本号。
    hooks: {
      beforeValidate: function (obj) {
        let now = Date.now();
        if (obj.isNewRecord) {
          if (!obj.u_id) {
            // generateId()函数是 node-uuid 模块生成的 UID 唯一标识
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

// 对应 db.js 中的类型定义和 Sequelize 的类型对应
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];
for (let type of TYPES) {
  exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;