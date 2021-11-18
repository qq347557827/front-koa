import TestModel from './test';

//增
const user = {
  username: 'jack',
  password: "123456"
}
const insertMethods  = async () => {
  const data = new TestModel(user)
  const result = await data.save()
  // console.log(result);
  return result
}
insertMethods().then( res=> {
  console.log(res);
})
//查
const findMethods = async () => {
  const result = await TestModel.find()
  console.log(result);
}
// findMethods()
//改
const updateMethods = async () => {
  const result = await TestModel.updateOne({name: '测试名字'}, {name: '修改名字'})
  console.log(result);
}
// updateMethods()
//删
const deletedMethods = async () => {
  const result = await TestModel.deleteOne({name: '测试名字'})
  console.log(result);
}
// deletedMethods()



