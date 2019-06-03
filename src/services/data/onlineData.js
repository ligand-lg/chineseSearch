/**
 * 在线搜索。使用微信云开发提供的云数据库。具体见面文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
 */


// 数据库连接管理
let _collection = null
const getCollection = () => {
  if (_collection === null) {
    _collection = wx.cloud.database().collection('chineseSearch')
  }
  return _collection
}

function strokesOrderApi(character) {
  const collection = getCollection()
  return new Promise((resolve, reject) => {
    // 检查是否连接成功
    if (collection === null) {
      reject('数据库连接错误')
    }

    // 查询数据库
    collection.where({ character: character })
      .get().then(res => {
        // 有数据，解析
        if (res.data.length > 0) {
          resolve(res.data[0])
        } else {
          // 没有找到
          reject(`数据库：查无此字'${character}'`)
        }
      })
      .catch(reject)
  })
}

export {
  strokesOrderApi
}

