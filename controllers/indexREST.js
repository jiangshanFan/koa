// ����REST API
module.exports = {
  'GET /': async (ctx, next) => {
    ctx.render('indexREST.html');
  }
}