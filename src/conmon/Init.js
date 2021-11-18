import config from '../config/index';
import User from '../model/test';
import { setValue, getValue } from '../config/RedisConfig';

export default async () => {
  const admins = config.admins

  let adminIds = []
  for (let i = 0; i < admins.length; i++) {
    const username = admins[i];

    const user = await User.findOne({ username }, { _id: 1 })

    adminIds.push(user._id)
  }

  setValue('adminIds', JSON.stringify(adminIds))

}