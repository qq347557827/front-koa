import SignRecord from '../model/SignRecord';
import { getJWTPayload } from '../conmon/Utils';
import User from '../model/test';
import moment from 'dayjs';
import Mock from 'mockjs';
import qs from 'qs';



class UserController {
  constructor() {
  }
  async cheshi (ctx) {
    console.log('进入UserController.cheshi');
    ctx.body = {
      code: 200
    }
  }
  // 用户签到接口
  async userSign (ctx) {
    console.log('进入UserController.userSign');
    // 取得用户id
    const obj = await getJWTPayload(ctx.header.authorization)
    // 查询用户上一次签到记录
    console.log('取得用户id', obj);
    const record = await SignRecord.findByUid(obj._id)
    console.log('取得用户签到记录', record);
    const user = await User.findById(obj._id)
    console.log('取得用户信息', user);
    let result
    let newRcord = {}
    // 判断签到逻辑
    if (record !== null) {
      // 有历史签到数据
      // 判断用户上一次签到记录的created时间是否和今天相同
      // 如果相同,代表用户是在连续签到
      // 如果当前时间和日期与用户上一次签到日期相同,说明用户已经签到
      if (moment(record.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
        ctx.body = {
          code: 500,
          msg: '用户已经签到',
          favs: user.favs,
          count: user.count,
          lastSign: record.created
        }
        return
      } else {
        // 有上一次的签到记录,并且不与今天相同,进行连续签到的判断
        // 如果相同,代表用户在连续签到
        const count = user.count + 1
        let fav = 0
        //判断签到时间
        if (moment(record.created).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD')) {
          if (count < 5) {
            fav = 5
          } else if (count >= 5 && count < 15) {
            fav = 10
          } else if (count >= 15 && count < 30) {
            fav = 15
          } else if (count >= 30 && count < 100) {
            fav = 20
          } else if (count >= 100 && count < 365) {
            fav = 30
          } else if (count >= 365) {
            fav = 50
          }
          await User.updateOne(
            { _id: obj._id },
            {
              // $inc方法相当于favs += fav
              $inc: { favs: fav, count: 1 }
            }
          )
          result = {
            favs: user.favs + fav,
            count: user.count + 1
          }
        } else {
          fav = 5
          await User.updateOne(
            { _id: obj._id },
            {
              $set: { count: 1 },
              $inc: { favs: fav }
            }
          )
          result = {
            favs: user.favs + fav,
            count: 1
          }
        }
        // 更新签到记录
        newRcord = new SignRecord({
          uid: obj._id,
          favs: fav,
          lastSign: record.created
        })
        await newRcord.save()
      }

    } else {
      // 无签到数据
      // 保存用户的签到数据
      await User.updateOne({
        _id: obj._id
      },
        {
          $set: { count: 1 },
          $inc: { favs: 5 }
        })
      newRcord = new SignRecord({
        uid: obj._id,
        favs: 5,
        lastSign: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      await newRcord.save()
      // console.log(user.favs);
      let favs
      if (user.favs == null || user.favs === 'undefined') {
        favs = 5
      } else {
        favs = user.favs + 5
      }
      result = {
        favs: favs,
        // favs:  5,
        count: 1
      }
    }
    ctx.body = {
      code: 200,
      msg: '请求成功',
      ...result,
      lastSign: newRcord.created
    }
  }

  // async userSign (ctx) {
  //   code: 200
  //   msg: '请求成功'
  // }
  async upUserInfo (ctx) {
    const obj = await getJWTPayload(ctx.header.authorization)
    console.log(obj);
    const user = await User.findById(obj._id)
    console.log(user);
    const pic = ctx.request.body.pic
    // User.pic = pic
    await User.updateOne({
      _id: obj._id
    }, {
      pic: pic
    })
    ctx.body = {
      code: 200
    }
  }
  // 更新密码接口
  async upUserInfPwd (ctx) {
    const body = ctx.request.body
    if (body.oldPass !== body.pass && body.pass === body.checkPass) {
      const obj = await getJWTPayload(ctx.header.authorization)
      const user = await User.findById(obj._id)
      if (user.password === body.oldPass) {
        const result = await User.updateOne({
          _id: obj._id
        }, {
          $set: { password: body.pass }
        })
        ctx.body = {
          code: 200,
          msg: '修改成功'
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '密码不正确,请检查'
        }
      }
    } else if (body.oldPass === body.pass) {
      ctx.body = {
        code: 500,
        msg: '新旧密码相同,请检查'
      }
    } else if (body.pass !== body.checkPass) {
      ctx.body = {
        code: 500,
        msg: '新密码和确认密码不同,请检查'
      }
    }
  }

  async getMyMsg (ctx) {
    console.log('ctx: ', ctx);
    const params = ctx.query
    console.log('params: ', params);
    ctx.body = {
      code: 200
    }
  }

  async getUserList (ctx) {
    let params = ctx.query
    params = qs.parse(params)
    const limit = parseInt(params.limit)
    const page = parseInt(params.page) - 1
    const options = params.options
    console.log('options: ', options);
    console.log('options: ', typeof options);
    const result = await User.getList(options, page, limit)
    // console.log('result: ', result);
    const total = await User.countlist(options)

    // const Random = Mock.Random
    // console.log('params: ', params);
    // let data = []
    // for (let i = 0; i < limit; i++) {
    //   const template = {
    //     'name': Random.name(),
    //     'created': Random.date(),
    //     'username': Random.email(),
    //     'pic': Random.image('200x100', '#50B347', '#FFF', 'Mock.js'),
    //     'status': Random.boolean() ? '1' : '0',
    //     'isVip': Random.integer(0, 8),
    //     'favs': Random.integer(700, 1000),
    //     'rules': Mock.mock({
    //       "array|1": [
    //         "user",
    //         "admin",
    //         "super_admin"
    //       ]
    //     })
    //   }
    //   data.push(template)
    // }
    // console.log('data: ', data);



    ctx.body = {
      code: 200,
      data: result,
      total: total
    }
  }

  async addUser (ctx) {
    const body = ctx.request.body
    console.log('body: ', body);
    const result = await User.findOne({ username: body.username })
    if (!result) {
      if (body.pwd === body.password) {
        const user = new User(body)
        const data = await user.save()
        const dataObj = data.toJSON()
        const arr = ['password']
        arr.map(item => {
          delete dataObj[item]
        })
        ctx.body = {
          code: 200,
          data: dataObj,
          msg: '新增成功'
        }
      } else {
        ctx.body = {
          code: 400,
          msg: '密码校验不通过'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '用户名已存在'
      }
    }
  }

  async deleteUser (ctx) {
    const body = ctx.request.body
    console.log('body: ', body);
    const result = await User.deleteMany({
      _id: {
        $in: body.idArr
      }
    })
    ctx.body = {
      code: 200
    }
  }
}


// export default new UserController()
export default new UserController()