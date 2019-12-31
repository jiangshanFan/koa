// index:

module.exports = {
  'GET /': async (ctx, next) => {
    let user = ctx.state.user;
        //console.log(ctx.cookies.get('name'));
    if (user) {
      ctx.render('room.html', {
        user: user
      });
    } else {
      ctx.response.redirect('/signin');
    }
  }
};