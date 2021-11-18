
import SvgCaptcha from 'svg-captcha';
import { setValue, getValue } from '../config/RedisConfig'
import { getJWTPayload, menusGetMenuData } from '../conmon/Utils';

import jsonwebtoken from 'jsonwebtoken';
import config from '../config/index';
import { checkCode } from '../conmon/Utils';

import User from '../model/test';
import Roles from '../model/Roles';

import SignRecord from '../model/SignRecord';
import moment from 'dayjs';
import Menus from '../model/Menus';


//新加接口前记得在jwt里面放行

class Login {
    constructor() {
    }
    getSvgCaptcha = async (ctx) => {
        let body = ctx.request.query

        let svgCaptcha = SvgCaptcha.create({
            size: 4,
            ignoreChars: '0o1il',
            color: true,
            noise: Math.floor(Math.random() * 5),
            width: 150,
            height: 50
        })
        // 
        if (body.sid) {
            setValue(body.sid, svgCaptcha.text, 10 * 60)//设置10分钟的失效时间
        }

        getValue(body.sid)
        ctx.body = {
            svg: svgCaptcha.data
        }
    }
    async submitLogin (ctx) {
        const body1 = ctx.request.body

        // 
        let sid = body1.sid
        let code = body1.code
        const checkCodes = await checkCode(sid, code)
        if (checkCodes == 1) {
            let checkeUserPasswd = false


            let users = await User.findOne({ username: body1.username })

            if (users && users.password === body1.password) {
                const userObj = users.toJSON()

                // 

                let arr = ['password']
                arr.map(item => {
                    delete userObj[item]
                })

                let token = jsonwebtoken.sign(
                    { _id: userObj._id },
                    config.JWT_SECRET,
                    { expiresIn: '7d' }
                )


                const signRecord = await SignRecord.findByUid(userObj._id)
                if (signRecord !== null) {
                    if (moment(signRecord.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                        userObj.isSign = true
                    } else {
                        userObj.isSign = false
                    }
                    userObj.lastSign = signRecord.created
                } else {
                    userObj.isSign = false
                }

                // 获取用户的路由数据
                const { roles } = users
                let menus = []
                for (let i = 0; i < roles.length; i++) {
                    const element = roles[i];
                    const menu = await Roles.findOne({ code: element }, { menu: 1 })
                    menus.push(...menu.menu)
                }
                menus = Array.from(new Set(menus))
                const treeData = await Menus.find()
                const routes = menusGetMenuData(treeData, menus)

                ctx.body = {
                    code: 200,
                    data: userObj,
                    routes: routes,
                    token: token
                }
            } else {
                ctx.body = {
                    code: 401,
                    msg: '用户名或者密码错误'
                }
            }

        } else if (checkCodes === 2) {
            // ctx.status = 401

            ctx.body = {
                code: 401,
                msg: '验证码失效, 请重新输入'
            }
        } else {
            // ctx.status = 401,

            ctx.body = {
                code: 401,
                msg: '验证码错误, 请重新输入'
            }
        }
        // if(code==)


    }

    // 获取用户信息
    async getUserInfo (ctx) {
        const token = ctx.header.authorization

        const obj = await getJWTPayload(token)
        const user = await User.findById(obj._id)
        let arr = ['password']
        arr = arr.map(item => {
            delete user[item]
        })


        // 获取用户的路由数据
        const { roles } = user
        let menus = []
        for (let i = 0; i < roles.length; i++) {
            const element = roles[i];
            const menu = await Roles.findOne({ code: element }, { menu: 1 })
            menus.push(...menu.menu)
        }
        menus = Array.from(new Set(menus))
        const treeData = await Menus.find()
        const routes = menusGetMenuData(treeData, menus)

        ctx.body = {
            code: 200,
            data: user,
            routes
        }
    }
    toSvg = async (ctx) => {

        // let text = ctx.request.query
        // 
        ctx.body = {
            svg: '!!!'
        }
    }
    /*
        注册接口
    */
    async reg (ctx) {
        const body1 = ctx.request.body

        let sid = body1.sid
        let code = body1.svgValue
        const checkCodes = await checkCode(sid, code)
        //校验验证码是否正确 或者 过期
        if (checkCodes == 1) {
            let checkeUserPasswd = false


            let users = await User.findOne({ username: body1.email })
            //验证用户名是否存在

            if (!users) {

                const data = new User({
                    username: body1.email,
                    password: body1.password
                })
                let users = await data.save()
                ctx.body = {
                    code: 200,
                }
            } else {

                ctx.body = {
                    code: 501,
                    msg: '邮箱已存在'
                }
            }
            // 
        } else if (checkCodes === 2) {
            // ctx.status = 401

            ctx.body = {
                code: 401,
                msg: '验证码失效, 请重新输入'
            }
        } else {
            // ctx.status = 401,

            ctx.body = {
                code: 401,
                msg: '验证码错误, 请重新输入'
            }
        }
        // ctx.body = {
        //     code: 200,
        //     msg: 'ok'
        // }
    }
    async isEmail (ctx) {

        ctx.body = {
            code: 200
        }
    }

}


export default new Login()
// module.exports = {a}