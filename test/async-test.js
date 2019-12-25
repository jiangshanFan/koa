const assert = require('assert');

// ���� async.js�� �൱�������ļ� modules.exports �����ƶ�����ǰ�ļ���ʹ�����·��ʱ�����Ե�ǰ·��Ϊ��׼
const async = require('../basic/mocha/async.js');

// describe ��������Ƕ�ף��Ա����ز��Կ���һ�����
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

  // �첽���Ե� done �÷�
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

  // async, await �첽����
  it('#async function', async () => {
    // ��ȡ�����ļ���ֵ
    let r = await async();
    assert.strictEqual(r, 15);
  });

  // ͬ������
  /*it('#sync function', () => {
    assert(true);
  });*/
});
