import { getValue } from '../config/RedisConfig';
import config from '../config/index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

import makedir from 'make-dir';
import { v4 as uuidv4 } from 'uuid';
import moment from 'dayjs';

const getJWTPayload = token => {

  if (!token) return
  if (/^Bearer/.test(token)) {
    return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
  } else {
    return jwt.verify(token, config.JWT_SECRET)
  }


}

const checkCode = async (key, value) => {
  const redisCode = await getValue(key)

  if (redisCode != null) {
    if (value.toLowerCase() === redisCode.toLowerCase()) {

      return 1
    } else {
      return 0
    }
  } else {
    return 2
  }
}



const getStats = (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false)
      } else {
        resolve(stats)
      }
    })
  })
}
const mkdir = (dir) => {
  return new Promise((resolve) => {
    fs.mkdir(dir, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}
//循环遍历递归判读如果上级目录不存在,则创建上级目录
const dirExists = async (dir) => {
  const isExist = await getStats(dir)
  // 如果该路径存在且不是文件, 返回true

  if (isExist && isExist.isDirectory) {
    return true
  } else if (isExist) {
    该路径存在, 但是不是文件, 返回false

    return false
  }

  const tempDir = path.parse(dir).dir

  const status = await dirExists(tempDir)
  if (status) {
    const result = await mkdir(dir)

    return result
  } else {
    return false
  }
}


const base64ToImg = async (base) => {
  const test = base.match(/^data:image\/\w+;base64,/g)

  const ext = test[0].substr(11, test[0].length - 19)
  const base_64_url = base.replace(/^data:image\/\w+;base64,/, "")
  const dataBuffer = await new Buffer.from(base_64_url, 'base64')
  const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
  await makedir(dir)
  const picname = uuidv4()
  const destPath = `${dir}/${picname}.${ext}`

  await fs.writeFile(destPath, dataBuffer, function (err) {//用fs写入文件
    if (err) {

    } else {

    }
  })
  return `/${moment().format('YYYYMMDD')}/${picname}.${ext}`
}

// const menusGetMenuData = (treeData, menus, flg) => {
//   let arr = []
//   for (let i = 0; i < treeData.length; i++) {
//     const item = treeData[i];
//     if (item.type === 'menu') {
//       const id = item._id + ''
//       if (flg || menus.includes(id)) {
//         let obj = {
//           _id: item._id,
//           path: item.path,
//           name: item.name,
//           meta: {
//             title: item.title,
//             hideInBread: item.hideInBread,
//             hideInMenu: item.hideInMenu,
//             notCache: item.notCache,
//             icon: item.icon
//           },
//           component: () => import(`@/${item.component}`)
//         }
//         if (item.children && item.children.length > 0) {
//           obj.children = menusGetMenuData(item.children, menus, flg)
//         }
//         arr.push(obj)
//       }
//     }

//   }
//   return arr
// }

// const menusGetMenuData = (treeData, menus, flg) => {
//   let arr = []
//   for (let i = 0; i < treeData.length; i++) {
//     const item = treeData[i];
//     if (item.type === 'menu') {
//       const id = item._id + ''
//       if (flg || menus.includes(id)) {
//         let obj = {
//           _id: item._id,
//           path: item.path,
//           name: item.name,

//           title: item.title,
//           hideInBread: item.hideInBread,
//           hideInMenu: item.hideInMenu,
//           notCache: item.notCache,
//           icon: item.icon,

//           componentStr: item.component,

//         }
//         if (item.children && item.children.length > 0) {
//           obj.children = menusGetMenuData(item.children, menus, flg)
//         }
//         arr.push(obj)
//       }
//     }

//   }
//   return arr
// }

const menusGetMenuData = (treeData, menus, flg) => {
  let arr = []
  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i];
    if (item.type === 'menu') {
      if (item.children && item.children.length > 0) {
        item.children = menusGetMenuData(item.children, menus, flg)
      }
      const id = item._id + ''
      if (flg || menus.includes(id) || (item.children && item.children.length > 0)) {
        arr.push(item)
      }
    } else if (item.type === 'link' || item.type === 'resource') {
      arr.push(item)
    }

  }
  return arr
}
export {
  checkCode,
  getJWTPayload,
  dirExists,
  base64ToImg,
  menusGetMenuData
}