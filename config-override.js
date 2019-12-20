// MySQL简单的实际配置文件,通常不写，部署到服务器时，由运维团队配置好config-override.js，以覆盖config-override.js的默认设置
var config = {
  database: 'production',
  username: 'www',
  password: 'secret-password',
  host: '192.168.1.199'
};

module.exports = config;