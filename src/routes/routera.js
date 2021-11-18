const Router = require('koa-router')
// import {a} from '../api/a'
// const a = require('../api/a')
import Login from '../api/a';
import ContentController from '../api/ContentController';


const router = new Router()

router.get('/svgcap', Login.getSvgCaptcha)
router.post('/submitLogin', Login.submitLogin)
router.post('/toSvg', Login.toSvg)
router.post('/reg', Login.reg)
router.get('/isEmail', Login.isEmail)
router.get('/get_lists', ContentController.getLists)
router.get('/userInfo', Login.getUserInfo)


module.exports = router