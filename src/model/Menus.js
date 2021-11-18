import mongoose from '../config/DBHelpler';
// import moment from 'dayjs';

const Schema = mongoose.Schema

const MenuSchema = new Schema({
  title: { type: String, default: '' },
  path: { type: String, default: '' },
  type: { type: String, default: '' },
  name: { type: String, default: '' },
  href: { type: String, default: '' },
  component: { type: String, default: '' },
  sort: { type: Number, default: 0 },
  hideInBread: { type: Boolean, default: false },
  hideInMenu: { type: Boolean, default: false },
  notCache: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  redirect: { type: String, default: '' },
  expand: { type: Boolean, default: true },
})

const OperationSchema = new Schema({
  name: { type: String, default: '' },
  type: { type: String, default: '' },
  method: { type: String, default: '' },
  path: { type: String, default: '' },
  regmark: { type: String, default: '' },
})

MenuSchema.add({
  children: [MenuSchema],
  operation: [OperationSchema]
})

const Menus = mongoose.model('menus', MenuSchema)

export default Menus