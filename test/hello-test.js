// 使用 mocha 默认的 BDD-style
const assert = require('assert');

const sum = require('../basic/mocha/hello');

// describe 可以任意嵌套，以便把相关测试看成一组测试
describe('#hello.js', () => {

  describe('#sum()', () => {
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

    // it("name", function() {...}) 代表一个测试
    it('sum() should return 0', () => {
      assert.strictEqual(sum(), 0);
    });

    it('sum(1) should return 1', () => {
      assert.strictEqual(sum(1), 1);
    });

    it('sum(1, 2) should return 3', () => {
      assert.strictEqual(sum(1, 2), 3);
    });

    it('sum(1, 2, 3) should return 6', () => {
      assert.strictEqual(sum(1, 2, 3), 6);
    });
  });
});

/** 编写测试的原则是，一次只测一种情况，且测试代码要非常简单。我们编写多个测试来分别测试不同的输入，并使用assert判断输出是否是我们所期望的。 */