/**
 * koa 处理 REST API
 */

const products = require('../products');

const APIError = require('../rest').APIError;

// excel
const path = require('path');
const fs = require('mz/fs');
const saved_dir = path.normalize(__dirname + path.sep + '..' + path.sep + 'saved-docs');
console.log(`documents will be saved in ${saved_dir}`);

// 添加model.js
const model = require('../model');
const TODO = model.todos;


///**模拟TODO数据库 */
//var gid = 0;

//function nextId() {
//  gid++;
//  return 't' + gid;
//}

//var todos = [
//  {
//    id: nextId(),
//    name: 'Learn Git',
//    description: 'Learn how to use git as distributed version control'
//  },
//  {
//    id: nextId(),
//    name: 'Learn JavaScript',
//    description: 'Learn JavaScript, Node.js, NPM and other libraries'
//  },
//  {
//    id: nextId(),
//    name: 'Learn Python',
//    description: 'Learn Python, WSGI, asyncio and NumPy'
//  },
//  {
//    id: nextId(),
//    name: 'Learn Java',
//    description: 'Learn Java, Servlet, Maven and Spring'
//  }
//];

module.exports = {
  /** ******************************* Sequelize 操作数据库，获取数据 ***************************************** */
  'GET /api/products': async (ctx, next) => {
    ctx.rest({
      products: await products.getProducts()
    });
  },

  'POST /api/products': async (ctx, next) => {
    console.log(ctx.request.body);
    var p = await products.createProduct(ctx.request.body.name, ctx.request.body.manufacturer, parseFloat(ctx.request.body.price));
    ctx.rest(p);
  },

  'DELETE /api/products/:id': async (ctx, next) => {
    console.log(`delete product ${ctx.params.id}...`);
    var p = await products.deleteProduct(ctx.params.id);
    if (p) {
      ctx.rest(p);
    } else {
      throw new APIError('product: not_found', 'product not found by id.');
    }
  },
  /** ******************************* ********************************************* ***************************************** */


/** TODO */
  'GET /api/todos': async (ctx, next) => {
    // 异步函数调用使用 async/await
    // 查询所有符合条件的数据
    let query = ctx.query;
    
    let res = await TODO.findAll({
      where: query
    });
    console.log(`find ${res.length} todo:`);

    let todos = JSON.parse(JSON.stringify(res));
    ctx.rest({
      todos: todos
    });
  },

  'POST /api/todos': async (ctx, next) => {
    var
      t = ctx.request.body,
      todo;
    if (!t.name || !t.name.trim()) {
      throw new APIError('invalid_input', 'Missing name');
    }
    if (!t.description || !t.description.trim()) {
      throw new APIError('invalid_input', 'Missing description');
    }
    let res = await TODO.create({ name: t.name.trim(), description: t.description.trim() });
    console.log(JSON.stringify(res));

    todo = JSON.parse(JSON.stringify(res));
    ctx.rest(todo);
  },

  'PUT /api/todos/:id': async (ctx, next) => {
    var t = ctx.request.body;
    if (!t.name || !t.name.trim()) {
      throw new APIError('invalid_input', 'Missing name');
    }
    if (!t.description || !t.description.trim()) {
      throw new APIError('invalid_input', 'Missing description');
    }


    // “删、改”数据需要先“查”数据，然后再通过save()以及destroy()方法进行操作
    let todos = await TODO.findAll({
      where: {
        id: ctx.params.id
      }
    });

    if (!todos) {
      throw new APIError('notfound', 'Todo not found by id: ' + ctx.params.id);
    }
    for (let todo of todos) {
      await todo.update({ name: t.name.trim(), description: t.description.trim() });
      console.log(`${todo.name} was updated.`);
    }

    ctx.rest(t);
  },

  'DELETE /api/todos/:id': async (ctx, next) => {
    // “删、改”数据需要先“查”数据，然后再通过save()以及destroy()方法进行操作
    let todos = await TODO.findAll({
      where: {
        id: ctx.params.id
      }
    });
    if (!todos) {
      throw new APIError('notfound', 'Todo not found by id: ' + ctx.params.id);
    }
    for (let todo of todos) {
      await todo.destroy();
      console.log(`${todo.name} was destroyed.`);
    }
    ctx.rest(todos);
  },


/** Excel */
  'GET /api/sheets/:id': async (ctx, next) => {
    var s, fp = path.join(saved_dir, '.' + ctx.params.id);
    console.log(`load from file ${fp}...`);
    s = await fs.readFile(fp, 'utf8');
    ctx.rest(JSON.parse(s));
  },
  'PUT /api/sheets/:id': async (ctx, next) => {
    var
      fp = path.join(saved_dir, '.' + ctx.params.id),
      title = ctx.request.body.title,
      rows = ctx.request.body.rows,
      data;
    if (!title) {
      throw new APIError('invalid_data', 'invalid title');
    }
    if (!Array.isArray(rows)) {
      throw new APIError('invalid_data', 'invalid rows');
    }
    data = {
      title: title,
      rows: rows
    };
    await fs.writeFile(fp, JSON.stringify({
      title: title,
      rows: rows
    }), 'utf8');
    console.log(`wrote to file ${fp}.`);
    ctx.rest({
      id: ctx.params.id
    });
  },
};

/**
 * 编写API时，需要注意：
 * 如果客户端传递了JSON格式的数据（例如，POST请求），则async函数可以通过ctx.request.body直接访问已经反序列化的JavaScript对象。
 * 这是由bodyParser()这个middleware完成的。如果ctx.request.body为undefined，说明缺少middleware，或者middleware没有正确配置。
 * 如果API路径带有参数，参数必须用:表示，例如，DELETE /api/products/:id，客户端传递的URL可能就是/api/products/A001，参数id对应的值就是A001，要获得这个参数，我们用ctx.params.id。
 * 类似的，如果API路径有多个参数，例如，/api/products/:pid/reviews/:rid，则这两个参数分别用ctx.params.pid和ctx.params.rid获取。
 * 这个功能由koa-router这个middleware提供。
 * 
 * *********************************** 请注意：API路径的参数永远是字符串！**************************************
 **/