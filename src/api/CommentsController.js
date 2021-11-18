import { getJWTPayload, base64ToImg } from '../conmon/Utils';
// import { getJWTPayload } from '../conmon/Utils';
import moment from 'dayjs';
import config from '../config/index';

import Comments from '../model/Comments';
import Post from '../model/Post';
import Users from '../model/test';
import Hands from '../model/CommentHands';
import Chats from '../model/CommentChat';



import fs from 'fs';
import mkdir from 'make-dir';
import { v4 as uuidv4 } from 'uuid';

const isStatus = async (token) => {
  const obj = getJWTPayload(token)
  const user = await Users.findById(obj._id)
  return user.status === '1'
}

class CommentsController {

  // 新增评论
  async addComment (ctx) {
    const file = ctx.request.files.file
    const body = ctx.request.body
    const commentObj = {}
    commentObj.content = body.content
    commentObj.tid = body.tid
    let flg = await isStatus(ctx.header.authorization)
    console.log('isStatus: ', isStatus);

    const obj = await getJWTPayload(ctx.header.authorization)

    // const commentObj = { tid, content, commentImg }

    if (file) {
      const ext = file.name.split('.').pop()
      const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
      await mkdir(dir)
      const picname = uuidv4()
      const destPath = `${dir}/${picname}.${ext}`
      const render = fs.createReadStream(file.path)
      const upStream = fs.createWriteStream(destPath)
      render.pipe(upStream)
      commentObj.commentImg = `/${moment().format('YYYYMMDD')}/${picname}.${ext}`
    }
    const newComment = await new Comments(commentObj)

    console.log('obj: ', obj);
    // const newComment = new Comments({ content: body.content })

    // newComment.content = body.content
    newComment.cuid = obj._id
    const comment = await newComment.save()
    await Post.updateOne({ _id: body.tid }, {
      $inc: {
        answer: +1
      }
    })
    ctx.body = {
      code: 200,
      msg: '评论成功',
      data: commentObj
    }

    const findPost = await Post.findById({ _id: body.tid })
    await Users.updateOne({ _id: findPost.uid }, {
      $inc: {
        unread_num: 1
      }
    })
    const user = await Users.findById({ _id: obj._id })
    console.log('findPost: ', findPost);
    const notfiy = {
      title: '文章评论',
      unread_num: user.unread_num,
      message: `${user.name}评论了您的文章${findPost.title}`
    }
    global.ws.send(findPost.uid, notfiy)

  }

  async reviseComment (ctx) {
    // const file = ctx.request.files.file
    // console.log('file: ', file);
    const body = ctx.request.body
    // console.log('body: ', body);
    const comment = await Comments.findById(body.commentId)

    let result = {}

    const obj = await getJWTPayload(ctx.header.authorization)
    if (obj._id === comment.cuid) {
      if (body.content !== comment.content) {
        result = await Comments.updateOne({ _id: body.commentId }, {
          content: body.content
        })
      }
      if (body.commentImg && body.commentImg !== comment.commentImg) {
        const imgPath = await base64ToImg(body.commentImg)
        result = await Comments.updateOne({ _id: body.commentId }, {

          commentImg: imgPath
        })
      } else if (!body.commentImg && body.commentImg !== comment.commentImg) {
        result = await Comments.updateOne({ _id: body.commentId }, {

          commentImg: ''
        })
      }
      console.log('result: ', result);
      console.log('comment: ', comment);
      const data = await Comments.findById(body.commentId)
      ctx.body = {
        code: 200,
        msg: '修改成功',
        data
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '修改人和创建人不符合'
      }
    }

    /** 
    if (obj._id === comment.cuid) {
      console.log('校验成功');
      let commentImg
      if (file) {
        const ext = file.name.split('.').pop()
        const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
        await mkdir(dir)
        const picname = uuidv4()
        const destPath = `${dir}/${picname}.${ext}`
        const render = fs.createReadStream(file.path)
        const upStream = fs.createWriteStream(destPath)
        render.pipe(upStream)
        commentImg = `/${moment().format('YYYYMMDD')}/${picname}.${ext}`
        await Comments.updateOne({ _id: body.commentId }, {
          commentImg: commentImg
        })
      } else if (body.commentImg === '') {
        await Comments.updateOne({ _id: body.commentId }, {
          commentImg: ''
        })
      }

      await Comments.updateOne({ _id: body.commentId }, {
        content: body.content
      })
      
      ctx.body = {
        code: 200,
        data: {
          content: body.content,
          commentImg
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '修改人和创建人不符合'
      }
    }
    */
  }
  // 采纳评论
  async acceptComment (ctx) {
    const body = ctx.request.body
    const bodyTid = body.tid._id
    console.log('bodyTid: ', bodyTid);
    const obj = await getJWTPayload(ctx.header.authorization)
    const comment = await Comments.findById(body.id)
    const post = await Post.findById(bodyTid)
    if (post.uid === obj._id) {
      const fav = post.favs ? post.favs : 0
      if (comment.tid === bodyTid && comment.isBest !== '1' && post.isEnd !== '1') {
        await Comments.updateOne({ _id: body.id }, {
          $set: {
            isBest: '1'
          }
        })
        await Post.updateOne({ _id: bodyTid }, {
          $set: {
            isEnd: '1'
          }
        })
        if (comment.cuid !== post.uid) {
          // await Users.updateOne({ _id: post.uid }, {
          //   $inc: {
          //     favs: - parseInt(fav)
          //   }
          // })
          await Users.updateOne({ _id: comment.cuid }, {
            $inc: {
              favs: parseInt(fav)
            }
          })
        }
        console.log('body: ', body);
        ctx.body = {
          code: 200
        }
      } else {
        ctx.body = {
          code: 501,
          msg: '文章和对应评论不一致'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '只有文章作者才能采纳'
      }
    }

  }
  //评论回复
  async chatRayle (ctx) {
    const body = ctx.request.body
    // console.log('body: ', body);c
    const commentImg = body.commentImg ? await base64ToImg(body.commentImg) : ''
    const obj = await getJWTPayload(ctx.header.authorization)
    body.commentImg = commentImg
    body.chat_id = obj._id
    const chat = await new Chats(body)
    const result = await chat.save()
    await Comments.updateOne({ _id: body.comment_id }, {
      $inc: {
        reply_count: 1
      }
    })
    console.log('result: ', result);
    ctx.body = {
      code: 200,
      data: result
    }
  }
  // 评论回复 再回复
  async chatRayleChat (ctx) {
    const body = ctx.request.body
    const commentImg = body.commentImg ? await base64ToImg(body.commentImg) : ''
    body.commentImg = commentImg
    const obj = await getJWTPayload(ctx.header.authorization)
    body.chat_id = obj._id
    console.log('body: ', body);
    const chat = await new Chats(body)
    const result = await chat.save()
    await Comments.updateOne({ _id: body.comment_id }, {
      $inc: {
        reply_count: 1
      }
    })

    const data = await Chats.getChatOne(result.id)
    console.log('data: ', data);
    ctx.body = {
      code: 200,
      data: data
    }
  }
  // 点赞
  async setHand (ctx) {
    const body = ctx.request.body
    console.log('body: ', body);
    const obj = await getJWTPayload(ctx.header.authorization)

    const findHands = await Hands.findOne({ cid: body.cid })
    if (body.handed === '0' && !findHands) {
      const hands = new Hands(body)
      const data = await hands.save()

      const result = await Comments.updateOne({ _id: body.cid }, {
        $inc: {
          hands: 1
        }
      })
      if (result.ok === 1) {
        ctx.body = {
          code: 200,
          data: data,
          msg: '点赞成功'
        }
      } else {
        ctx.body = {
          code: 500,
          msg: 点赞失败
        }
      }
    } else if (body.handed === '1' && findHands && obj._id === findHands.uid) {
      await Hands.deleteOne({ _id: findHands._id })
      const result = await Comments.updateOne({ _id: body.cid }, {
        $inc: {
          hands: -1
        }
      })
      if (result.ok === 1) {
        ctx.body = {
          code: 200,
          msg: '取消点赞成功'
        }
      }

    }
  }
}
export default new CommentsController()
