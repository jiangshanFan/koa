/**
 * koa ���� REST API
 */

const products = require('../products');

const APIError = require('../rest').APIError;

// excel
const path = require('path');
const fs = require('mz/fs');
const saved_dir = path.normalize(__dirname + path.sep + '..' + path.sep + 'saved-docs');
console.log(`documents will be saved in ${saved_dir}`);

// ���model.js
const model = require('../model');
const TODO = model.todos;


///**ģ��TODO���ݿ� */
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
  /** ******************************* Sequelize �������ݿ⣬��ȡ���� ***************************************** */
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
    // �첽��������ʹ�� async/await
    // ��ѯ���з�������������
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


    // ��ɾ���ġ�������Ҫ�ȡ��顱���ݣ�Ȼ����ͨ��save()�Լ�destroy()�������в���
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
    // ��ɾ���ġ�������Ҫ�ȡ��顱���ݣ�Ȼ����ͨ��save()�Լ�destroy()�������в���
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
 * ��дAPIʱ����Ҫע�⣺
 * ����ͻ��˴�����JSON��ʽ�����ݣ����磬POST���󣩣���async��������ͨ��ctx.request.bodyֱ�ӷ����Ѿ������л���JavaScript����
 * ������bodyParser()���middleware��ɵġ����ctx.request.bodyΪundefined��˵��ȱ��middleware������middlewareû����ȷ���á�
 * ���API·�����в���������������:��ʾ�����磬DELETE /api/products/:id���ͻ��˴��ݵ�URL���ܾ���/api/products/A001������id��Ӧ��ֵ����A001��Ҫ������������������ctx.params.id��
 * ���Ƶģ����API·���ж�����������磬/api/products/:pid/reviews/:rid���������������ֱ���ctx.params.pid��ctx.params.rid��ȡ��
 * ���������koa-router���middleware�ṩ��
 * 
 * *********************************** ��ע�⣺API·���Ĳ�����Զ���ַ�����**************************************
 **/