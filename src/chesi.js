// import Chats from '../model/CommentChat';
import Post from './model/Post';


// async function getLists (page, limit) {
//   const lists = await Post.find().skip(page * limit).populate({
//     path: 'uid',
//     select: 'name isVip pic'
//   })

//   console.log('lists: ', lists);
// }

async function gettid (id) {
  const data = await Post.findByTid(id)
  console.log('data: ', data);
}
gettid('613246a5fef0617968cabff1')
// async function getLists (page, limit) {
//   const lists = await Post.getLists(page, limit)

//   console.log('lists: ', lists);
// }
// getLists(0, 10)
