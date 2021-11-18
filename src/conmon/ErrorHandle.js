export default (ctx, next) => {
  return next().catch((err) => {
    if (401 === err.status) {
      ctx.status = 401;
      console.log(401);
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {

      console.log(404);
      throw err;
    }
  })
}

// export default (ctx, next) => {
//   if (ctx.url.match(/^\/public/)) {
//     ctx.body = 'unprotected\n';
//   } else {
//     return next();
//   }
// }