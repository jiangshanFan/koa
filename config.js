// ��ȡ����ʱ��ʵ�ֲ�ͬ�����¶�ȡ��ͬ�������ļ�
const defaultConfig = './config-default.js';
// ���趨Ϊ����·��
const overrideConfig = './config-override.js';
const testConfig = './config-test.js';

const fs = require('fs');

var config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load ${testConfig}...`);
  config = require(testConfig);
} else {
  // ���������£��Ŷ�ͳһʹ��Ĭ�ϵ����ã���������config-override.js
  console.log(`Load ${defaultConfig}...`);
  config = require(defaultConfig);
  try {
    // ���𵽷�����ʱ������ά�Ŷ����ú�config-override.js
    if (fs.statSync(overrideConfig).isFile()) {
      console.log(`Load ${overrideConfig}...`);
      // �ж������ config-override.js �ļ��͸���Ĭ�������ļ�
      config = Object.assign(config, require(overrideConfig));
    }
  } catch (err) {
    console.log(`Cannot load ${overrideConfig}.`);
  }
}

module.exports = config;