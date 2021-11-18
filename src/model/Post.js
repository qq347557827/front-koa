import mongoose from '../config/DBHelpler';
import moment from 'dayjs';

const Schema = mongoose.Schema

const PostSchema = new Schema({
  uid: { type: String, ref: 'users' },
  title: { type: String },
  content: { type: String },
  created: { type: Date },
  catalog: { type: String },
  favs: { type: Number },
  isEnd: { type: String, default: '0' },
  reads: { type: Number, default: 0 },
  answer: { type: Number, default: 0 },
  status: { type: String, default: '0' },
  isTop: { type: String, default: '0' },
  sort: { type: Number, default: '0' },
  tags: {
    type: Array,
    default: [
      {
        name: '',
        class: ''
      }
    ]
  }
})



PostSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

PostSchema.statics = {
  getList: function (options, sort, page, limit) {
    return this.find(options)
      .sort({ [sort]: - 1 })
      .skip(page * limit)
      .populate({
        path: 'uid',
        select: 'name isVip pic'
      })
  },

  getLists: function (page, limit) {
    return this.find({})
      .skip(page * limit).limit(parseInt(limit))
      .populate({
        path: 'uid',
        select: 'name pic isVip _id'
      })
  },
  // getLists: function (page, limit) {
  //   return this.find({})
  //     .populate({ path: 'uid' }).exec(function (err, docs) {
  //       console.log(docs);
  //     })

  // },


  getTopWeek: function () {
    return this.find({
      created: {
        $gte: moment().subtract(7, 'days')
      }
    }, {
      answer: 1,
      title: 1
    }).sort({ answer: -1 }).limit(15)
  },

  findByTid: function (id) {
    return this.findOne({ _id: id }).populate({
      path: 'uid',
      select: 'name pic isVip _id'
    })
  }
}

const postModel = mongoose.model('post', PostSchema)

export default postModel