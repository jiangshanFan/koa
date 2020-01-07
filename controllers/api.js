/**
 * koa ���� REST API
 */

const products = require('../products');

const APIError = require('../rest').APIError;

/**ģ��TODO���ݿ� */
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
 * ��дAPIʱ����Ҫע�⣺
 * ����ͻ��˴�����JSON��ʽ�����ݣ����磬POST���󣩣���async��������ͨ��ctx.request.bodyֱ�ӷ����Ѿ������л���JavaScript����
 * ������bodyParser()���middleware��ɵġ����ctx.request.bodyΪundefined��˵��ȱ��middleware������middlewareû����ȷ���á�
 * ���API·�����в���������������:��ʾ�����磬DELETE /api/products/:id���ͻ��˴��ݵ�URL���ܾ���/api/products/A001������id��Ӧ��ֵ����A001��Ҫ������������������ctx.params.id��
 * ���Ƶģ����API·���ж�����������磬/api/products/:pid/reviews/:rid���������������ֱ���ctx.params.pid��ctx.params.rid��ȡ��
 * ���������koa-router���middleware�ṩ��
 * 
 * *********************************** ��ע�⣺API·���Ĳ�����Զ���ַ�����**************************************
 **/