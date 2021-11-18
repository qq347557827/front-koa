import { getValue, setValue, getHvalue} from './RedisConfig';

// setValue('name', '测试Redis')

// getValue('name').then( res => {
//   console.log(res);
// })

setValue('测试obj', {
  name: '测试objname',
  age: 18,
  email: '~~~~@qq.com' 
})

getHvalue('测试obj').then( res => {
  console.log(res);
})