const koa = require('koa')
const combineRoutes = require('./routes/routes')
const cors = require('@koa/cors')
const json = require('koa-json')
import Body from 'koa-body';
import serve from 'koa-static';
import JWT from 'koa-jwt';
import config from './config/index';
import ErrorHandle from './conmon/ErrorHandle';
import path from 'path';
import WebSocket from './config/WebSocket.js';
import Auth from './conmon/Auth';
import init from './conmon/Init';



const app = new koa()

const ws = new WebSocket()
ws.init()
global.ws = ws

const jwt = JWT({ secret: config.JWT_SECRET }).unless({ path: [/^\/public/, /^\/svgcap/, /^\/submitLogin/, /^\/reg/, /^\/add/] })

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
  // 'Access-Control-Allow-Methods':'POST',

  allowMethods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],

}

const koaBodyConfig = {
  multipart: true, //// 开启文件上传
  jsonLimit: '100mb',//JSON 数据体的大小限制
  formLimit: '100mb',//表单请求体的大小限制
  textLimit: '100mb',// text body 的大小限制
  formidable: {
    // 上传目录
    // uploadDir: path.join(__dirname, 'public/uploads'),
    // 保留文件扩展名
    keepExtensions: true,

    maxFields: 10 * 1024 * 1024, //限制字段的数量
    maxFieldsSize: 10 * 1024 * 1024 //限制字段的最大大小



  }
}

app.use(Body(koaBodyConfig))
app.use(serve(path.join(__dirname, '../public'), {
  index: false,
  hidden: false,
  defer: false
}))
app.use(Auth)
app.use(cors())
app.use(ErrorHandle)
app.use(json({ pretty: false, param: 'pretty' }))
app.use(combineRoutes())
app.use(jwt)
app.listen(3000, init())