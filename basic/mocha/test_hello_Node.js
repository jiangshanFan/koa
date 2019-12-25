// 测试 hello.js, 使用 Node.js 提供的 assert 模块进行断言：
const assert = require('assert');
const sum = require('./hello');

// 如果判断正确不会有任何输出，当不正确时会 throw ERROR
assert.strictEqual(sum(), 0);
assert.strictEqual(sum(1), 1);
assert.strictEqual(sum(1, 2), 3);
assert.strictEqual(sum(1, 2, 3), 6);

/** 单独写一个test.js的缺点是没法自动运行测试，而且，如果第一个assert报错，后面的测试也执行不了了。 */