// 读取配置时，实现不同环境下读取不同的配置文件
const defaultConfig = './config-default.js';
// 可设定为绝对路径
const overrideConfig = './config-override.js';
const testConfig = './config-test.js';

const fs = require('fs');

var config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load ${testConfig}...`);
  config = require(testConfig);
} else {
  // 开发环境下，团队统一使用默认的配置，并且无需config-override.js
  console.log(`Load ${defaultConfig}...`);
  config = require(defaultConfig);
  try {
    // 部署到服务器时，由运维团队配置好config-override.js
    if (fs.statSync(overrideConfig).isFile()) {
      console.log(`Load ${overrideConfig}...`);
      // 判断如果有 config-override.js 文件就覆盖默认配置文件
      config = Object.assign(config, require(overrideConfig));
    }
  } catch (err) {
    console.log(`Cannot load ${overrideConfig}.`);
  }
}

module.exports = config;