import mongoose from '../config/DBHelpler';
import moment from 'dayjs';

const Schema = mongoose.Schema

const TestSchema = new Schema({
  'username': { type: String },
  'name': { type: String },
  'password': { type: String },
  'isVip': { type: Number, default: 0 },
  'count': { type: Number },
  'created': { type: Date },
  'status': { type: String, default: '0' },
  'favs': { type: Number },
  'pic': { type: String },
  'roles': { type: Array, default: [] },
  'content': { type: String },
  'status': { type: String, default: '0' },
  'unread_num': { type: Number, default: 0 }, // 未读消息数
})

TestSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const intoQuery = (options) => {
  if (!options) return {}
  // const options = JSON.parse(option)
  const searchKey = options.searchKey
  const searchValue = options.searchValue
  let query = {}

  if (searchValue) {
    if (searchKey === 'created' && searchValue.length > 0) {
      const start = searchValue[0] ? searchValue[0] : ''
      const end = searchValue[1] ? searchValue[1] : ''
      if (start && end) {
        query = { created: { $gte: new Date(start), $lt: new Date(end) } }
      } else if (start) {
        query = { created: { $gte: new Date(start) } }
      } else if (end) {
        query = { created: { $lt: new Date(end) } }
      }
    } else if (searchKey === 'roles') {

      query = { roles: { $in: searchValue } }

    } else if (['name', 'username'].includes(searchKey)) {
      query[searchKey] = { $regex: new RegExp(searchValue) }
    } else if (searchKey === 'status') {
      query[searchKey] = searchValue
    } else if (searchKey === 'isVip') {
      query[searchKey] = parseInt(searchValue)
    } else if (searchKey === 'favs') {

      const start = searchValue.start
      const end = searchValue.end
      if (start && end) {
        query = { favs: { $gte: start, $lt: end } }

      } else if (start) {
        query = { favs: { $gte: start } }
      } else if (end) {
        query = { favs: { $lt: end } }

      }

    }
  }
  return query
}

TestSchema.statics = {
  getList: function (option, page, limit) {
    const query = intoQuery(option)
    console.log('query: ', query);
    return this.find(query, { password: 0 }).skip(page * limit).limit(limit)
  },
  countlist: function (opitons) {
    const query = intoQuery(opitons)
    console.log('countlist->query: ', query);
    return this.countDocuments(query)
  }
}

const TestModel = mongoose.model('users', TestSchema)

export default TestModel