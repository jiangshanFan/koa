// ���� hello.js, ʹ�� Node.js �ṩ�� assert ģ����ж��ԣ�
const assert = require('assert');
const sum = require('./hello');

// ����ж���ȷ�������κ������������ȷʱ�� throw ERROR
assert.strictEqual(sum(), 0);
assert.strictEqual(sum(1), 1);
assert.strictEqual(sum(1, 2), 3);
assert.strictEqual(sum(1, 2, 3), 6);

/** ����дһ��test.js��ȱ����û���Զ����в��ԣ����ң������һ��assert��������Ĳ���Ҳִ�в����ˡ� */