import mongoose from '../config/DBHelpler';
import moment from 'dayjs';

const Schema = mongoose.Schema

const CommentHandsSchema = new Schema({
  cid: { type: String },
  uid: { type: String },
  created: { type: Date }
})

CommentHandsSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})


CommentHandsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error())
  }
})

const CommentHands = mongoose.model('comment_hands', CommentHandsSchema)

export default CommentHands