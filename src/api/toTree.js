const source = [{
  id: 1,
  pid: 0,
  name: 'body'
}, {
  id: 2,
  pid: 1,
  name: 'title'
}, {
  id: 3,
  pid: 1,
  name: 'div'
}, {
  id: 4,
  pid: 3,
  name: 'span'
}, {
  id: 5,
  pid: 3,
  name: 'icon'
}, {
  id: 6,
  pid: 4,
  name: 'subspan'
}]

const toTree = (data) => {
  let result = []
  while (data.length > 0) {
    const q = data.shift()
    data.filter(item => {
      if (item.id === q.pid) {
        (item.children || (item.children = [])).push(q)
      } else {
        result.push(q)
      }
    })
  }
  return result
}

export { source, toTree }