import Router from 'koa-router';
import ContentController from '../api/ContentController';

const router = new Router()

router.prefix('/content')

router.post('/upload', ContentController.uploadImg)
router.post('/addPost', ContentController.addPost)
router.get('/detail', ContentController.getPostDetail)
router.get('/comments', ContentController.getComments)
router.get('/get_lists', ContentController.getLists)
router.get('/cheshi', ContentController.cheshi)
router.post('/updateBase64', ContentController.updateBase64)
router.post('/update_post', ContentController.updatePost)


// router.get('/addPost', async (ctx) => {
//   console.log('/fav')
//   ctx.body = {
//     code: 200
//   }
// })

export default router