const combineRoutes = require('koa-combine-routers')
const aRouter = require('./routera')
import userRouter from './UserRoter';
import contentRouter from './ContentRoter';
import commentsRouter from './CommentsRouter';
import adminRouter from './adminRouter';


module.exports = combineRoutes(
    aRouter,
    userRouter,
    contentRouter,
    commentsRouter,
    adminRouter
)