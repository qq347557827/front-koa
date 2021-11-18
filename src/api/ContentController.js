import moment from 'dayjs';
import config from '../config/index';
import { getJWTPayload, base64ToImg, checkCode } from '../conmon/Utils';

import User from '../model/test';
import Post from '../model/Post';
import Comments from '../model/Comments';
import CommentHands from '../model/CommentHands';
import Chats from '../model/CommentChat';




// 这是自己封装的路径检测路径创建方法
import { dirExists } from '../conmon/Utils';
// 这个是第三方封装好的
import mkdir from 'make-dir';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

class ContentController {
  async uploadImg (ctx) {
    const file = ctx.request.files.file

    const ext = file.name.split('.').pop()


    const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
    // const dir2 = `public/path/${moment().format('YYYYMMDD')}`

    // 
    // await dirExists(dir)
    await mkdir(dir)

    const picname = uuidv4()
    const destPath = `${dir}/${picname}.${ext}`
    const render = fs.createReadStream(file.path)
    const upStream = fs.createWriteStream(destPath)
    const filePath = `/${moment().format('YYYYMMDD')}/${picname}.${ext}`

    render.pipe(upStream)
    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: filePath
    }
  }

  async addPost (ctx) {
    const body = ctx.request.body

    const code = await checkCode(body.sid, body.code)

    switch (code) {
      case 1:
        const obj = await getJWTPayload(ctx.header.authorization)
        const user = await User.findById(obj._id)
        if (user.favs >= body.favs) {
          const newPost = new Post(body)
          newPost.uid = obj._id
          const result = await newPost.save()
          await User.updateOne({ _id: obj._id }, {
            favs: user.favs - body.favs
          })
          ctx.body = {
            code: 200,
            msg: '发帖成功'
          }
        } else {
          ctx.body = {
            code: 501,
            msg: '积分不足'
          }
        }


        break;

      case 0:
        ctx.body = {
          code: 500,
          msg: '验证码错误'
        }
        break;

      case 2:
        ctx.body = {
          code: 500,
          msg: '验证码失效'
        }
        break;


    }
    // if (code === 1) {
    //   const obj = await getJWTPayload(ctx.header.authorization)
    //   const user = await User.findById(obj._id)
    //   const result = await User.updateOne({
    //     _id: obj._id
    //   }, {
    //     $set: { content: body.content }
    //   })
    //   ctx.body = {
    //     code: 200
    //   }
    // }else if (code === 0) {
    //   ctx.body = {
    //     code: 500,
    //     msg: '验证码错误'
    //   }  
    // } else if (condition) {

    // }
  }

  async updatePost (ctx) {
    const { body } = ctx.request
    console.log('body: ', body);
    const result = await Post.updateOne({ _id: body._id }, body)
    ctx.body = {
      code: 200
    }
  }
  async getPostDetail (ctx) {

    const params = ctx.query
    if (!params.tid) {
      ctx.body = {
        code: 500,
        msg: '文章标题为空'
      }
      return
    }
    const post = await Post.findByTid(params.tid)
    ctx.body = {
      code: 200,
      data: post
    }
  }
  // 获取评论
  async getComments (ctx) {

    console.log('开始时间 ', moment().format('HH:mm:ss'));
    const params = ctx.query

    const tid = params.tid
    const page = params.page ? params.page - 1 : 0
    const limit = params.limit ? parseInt(params.limit) : 10
    if (!tid) {
      ctx.body = {
        code: 500,
        msg: '文章标题为空'
      }
      return
    }
    let result = await Comments.getCommentsList(tid, page, limit)
    const total = await Comments.queryCount(tid)

    result = result.map(item => item.toJSON())
    for (let i = 0; i < result.length; i++) {
      let item = result[i]

      const id = item._id.toJSON()
      const chats = await Chats.getCommentChatList(id)
      if (chats.length > 0) {
        result[i].chats = chats

      }
    }

    if (ctx.header.authorization) {
      const obj = await getJWTPayload(ctx.header.authorization)
      if (typeof obj._id !== 'undefined') {
        // result = result.map(item => item.toJSON())
        for (let i = 0; i < result.length; i++) {
          let item = result[i]
          item.handed = '0'
          const commentHands = await CommentHands.findOne({ cid: item._id, uid: obj._id })
          if (commentHands && commentHands.cid) {
            if (commentHands.uid === obj._id) {
              item.handed = '1'
            }
          }
        }
      }
    }


    await Post.updateOne({ _id: tid }, {
      $inc: {
        reads: 1
      }
    })
    console.log('结束时间 ', moment().format('HH:mm:ss'));

    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '查詢成功'
    }
  }
  async updateBase64 (ctx) {
    const body = ctx.request.body
    const base = body.base
    const imgPath = await base64ToImg(base)
    ctx.body = {
      code: 200,
      imgPath
    }
  }

  async getLists (ctx) {
    const body = ctx.query
    console.log('body: ', body);
    const data = await Post.getLists(body.page - 1, body.limit)
    ctx.body = {
      code: 200,
      data
    }
  }

  async cheshi (ctx) {
    const body = ctx.request.body
    const data = await Post.getLists(0, 10)
    console.log('data: ', data);
    ctx.body = {
      code: 200,
      data
    }
  }

}

export default new ContentController()