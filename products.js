// Ϊ�˲���Product��������products.js��װ���в��������԰�����Ϊһ��Service��
// ����products�൱�����ڴ���ģ�������ݿ⣬������Ϊ�˼��߼���

// ��ʵ�������ݿ�,�������еĴ����������ص��ӿ��ĵ�api.js��
/** �������е� models �ļ����е� Model */
const model = require('./model');

let Product = model.products;

module.exports = {
  getProducts: async (id) => {
    // �첽��������ʹ�� async/await
    // ��ѯ���з�������������
    let res = await Product.findAll();
    console.log(`find ${res.length} product:`);

    let products = JSON.parse(JSON.stringify(res));
    return products;
  },

  createProduct: async (name, manufacturer, price) => {
    // create��������Ӽ�¼
    let res = await Product.create({ name, manufacturer, price });
    console.log(JSON.stringify(res));

    let p = JSON.parse(JSON.stringify(res));
    return p;
  },

  deleteProduct: async (id) => {
    // ��ɾ���ġ�������Ҫ�ȡ��顱���ݣ�Ȼ����ͨ��save()�Լ�destroy()�������в���
    let products = await Product.findAll({
      where: {
        id: id
      }
    });
    if (!products) {
      ctx.status = 404;
      return;
    }
    for (let p of products) {
      await p.destroy();
      console.log(`${p.name} was destroyed.`);
    }

    return products;
  },

}