import mongoose from '../config/DBHelpler';
// import moment from 'dayjs';

const Schema = mongoose.Schema

const RolesSchema = new Schema({
  title: { type: String, default: '' },
  code: { type: String, default: '' },
  describe: { type: String, default: '' },
  menu: { type: Array, default: [] }
})

const Roles = mongoose.model('roles', RolesSchema)

export default Roles