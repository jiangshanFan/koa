const assert = require('assert');

// 导入 async.js， 相当于整个文件 modules.exports 对象移动到当前文件，使用相对路径时必须以当前路径为基准
const async = require('../basic/mocha/async.js');

// describe 可以任意嵌套，以便把相关测试看成一组测试
describe('#async.js', () => {

  before(function () {
    console.log('before');
  });

  after(function () {
    console.log('after');
  });

  beforeEach(function () {
    console.log('beforeEach');
  });

  afterEach(function () {
    console.log('afterEach');
  });

  // 异步测试的 done 用法
  /*it('#async with done', (done) => {
    (async function () {
      try {
        let r = await hello();
        assert.strictEqual(r, 15);
        done();
      } catch (err) {
        done(err);
      }
    })();
  });*/

  // async, await 异步测试
  it('#async function', async () => {
    // 获取测试文件的值
    let r = await async();
    assert.strictEqual(r, 15);
  });

  // 同步测试
  /*it('#sync function', () => {
    assert(true);
  });*/
});
