/**
 * koa 处理 REST API
 */

const products = require('../products');

const APIError = require('../rest').APIError;

/**模拟TODO数据库 */
var gid = 0;

function nextId() {
  gid++;
  return 't' + gid;
}

var todos = [
  {
    id: nextId(),
    name: 'Learn Git',
    description: 'Learn how to use git as distributed version control'
  },
  {
    id: nextId(),
    name: 'Learn JavaScript',
    description: 'Learn JavaScript, Node.js, NPM and other libraries'
  },
  {
    id: nextId(),
    name: 'Learn Python',
    description: 'Learn Python, WSGI, asyncio and NumPy'
  },
  {
    id: nextId(),
    name: 'Learn Java',
    description: 'Learn Java, Servlet, Maven and Spring'
  }
];

module.exports = {
  'GET /api/products': async (ctx, next) => {
    ctx.rest({
      products: products.getProducts()
    });
  },

  'POST /api/products': async (ctx, next) => {
    var p = products.createProduct(ctx.request.body.name, ctx.request.body.manufacturer, parseFloat(ctx.request.body.price));
    ctx.rest(p);
  },

  'DELETE /api/products/:id': async (ctx, next) => {
    console.log(`delete product ${ctx.params.id}...`);
    var p = products.deleteProduct(ctx.params.id);
    if (p) {
      ctx.rest(p);
    } else {
      throw new APIError('product: not_found', 'product not found by id.');
    }
  },


/** TODO */
  'GET /api/todos': async (ctx, next) => {
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
    todo = {
      id: nextId(),
      name: t.name.trim(),
      description: t.description.trim()
    };
    todos.push(todo);
    ctx.rest(todo);
  },

  'PUT /api/todos/:id': async (ctx, next) => {
    var
      t = ctx.request.body,
      index = -1,
      i, todo;
    if (!t.name || !t.name.trim()) {
      throw new APIError('invalid_input', 'Missing name');
    }
    if (!t.description || !t.description.trim()) {
      throw new APIError('invalid_input', 'Missing description');
    }
    for (i = 0; i < todos.length; i++) {
      if (todos[i].id === ctx.params.id) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      throw new APIError('notfound', 'Todo not found by id: ' + ctx.params.id);
    }
    todo = todos[index];
    todo.name = t.name.trim();
    todo.description = t.description.trim();
    ctx.rest(todo);
  },

  'DELETE /api/todos/:id': async (ctx, next) => {
    var i, index = -1;
    for (i = 0; i < todos.length; i++) {
      if (todos[i].id === ctx.params.id) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      throw new APIError('notfound', 'Todo not found by id: ' + ctx.params.id);
    }
    ctx.rest(todos.splice(index, 1)[0]);
  }
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