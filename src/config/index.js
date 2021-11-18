import path from 'path';

const DB_URL = 'mongodb://admin:123456@119.91.192.232:27017/admin'
const JWT_SECRET = 'sjjimg&khdkjp*hji2%ijjdenipsjj-^2shvidkjthj!hdueblgp'

// 图片储存路径
const uploadPath = path.join(__dirname, '../../public')

// 配置超级管理员用户
const admins = ['ok@qq.com']

/**在使用export default导出,一定要通过变量名引入,
 * 比如import config from '../config/index';
 * 在通过 config.uploadPath 这样
 * */
export default {
  DB_URL,
  JWT_SECRET,
  uploadPath,
  admins
}