// 为了操作Product，我们用products.js封装所有操作，可以把它视为一个Service：
// 变量products相当于在内存中模拟了数据库，这里是为了简化逻辑。

// 真实连接数据库,导出所有的处理函数，返回到接口文档api.js中
/** 导入所有的 models 文件夹中的 Model */
const model = require('./model');

let Product = model.products;

module.exports = {
  getProducts: async (id) => {
    // 异步函数调用使用 async/await
    // 查询所有符合条件的数据
    let res = await Product.findAll();
    console.log(`find ${res.length} product:`);

    let products = JSON.parse(JSON.stringify(res));
    return products;
  },

  createProduct: async (name, manufacturer, price) => {
    // create方法，添加记录
    let res = await Product.create({ name, manufacturer, price });
    console.log(JSON.stringify(res));

    let p = JSON.parse(JSON.stringify(res));
    return p;
  },

  deleteProduct: async (id) => {
    // “删、改”数据需要先“查”数据，然后再通过save()以及destroy()方法进行操作
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