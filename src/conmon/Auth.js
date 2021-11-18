import { getJWTPayload } from "./Utils"
import { getValue } from '../config/RedisConfig';



export default async (ctx, next) => {
  const token = ctx.header.authorization

  if (token) {
    const obj = getJWTPayload(token)

    obj._id && (ctx._id = obj._id)
    // const adminIds = JSON.parse(await getValue('adminIds'))
    // if (adminIds && adminIds.includes(obj._id)) {
    //   ctx.isAdmin = true
    // } else {
    //   ctx.isAdmin = false
    // }
  }
  await next()
}