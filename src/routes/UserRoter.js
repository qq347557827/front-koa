import Router from 'koa-router';
import UserController from '../api/UserController';
// src\api\UserController.js

const router = new Router()

router.prefix('/user')

router.get('/fav', UserController.userSign)
// router.get('/fav', async (ctx) => {
//   console.log('/fav')
//   ctx.body = {
//     code: 200
//   }
// })
router.post('/upUserInfo', UserController.upUserInfo)
// 更新密码接口
router.post('/upUserInfPwd', UserController.upUserInfPwd)
// 获取我的消息
router.get('/getMyMsg', UserController.getMyMsg)

router.get('/user_list', UserController.getUserList)



export default router
