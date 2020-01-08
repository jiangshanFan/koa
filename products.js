// Ϊ�˲���Product��������products.js��װ���в��������԰�����Ϊһ��Service��
// ����products�൱�����ڴ���ģ�������ݿ⣬������Ϊ�˼��߼���

// ��ʵ�������ݿ�,�������еĴ����������ص��ӿ��ĵ�api.js��
/** �������е� models �ļ����е� Model */
const model = require('./model');

let Product = model.products;

var id = 0;

function nextId() {
  id++;
  return 'p' + id;
}

function Products(name, manufacturer, price) {
  this.id = nextId();
  this.name = name;
  this.manufacturer = manufacturer;
  this.price = price;
}

var products = [
  new Products('iPhone 7', 'Apple', 6800),
  new Products('ThinkPad T440', 'Lenovo', 5999),
  new Products('LBP2900', 'Canon', 1099)
];

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
    let res = await Product.create({ name: name, manufacturer: manufacturer, price: price });
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