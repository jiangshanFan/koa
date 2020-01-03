/**
 * koa ���� REST API
 */

const products = require('../products');

const APIError = require('../rest').APIError;

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