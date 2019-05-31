/**
 * 离线搜索。使用本地缓存数据
 * 
 */


import { hasLocalData } from './offlineData/fileManager'
import { findLocal } from './offlineData/compress'


function strokesOrderApi(character) {
  // 注意，这里直接返回的 findLocal 返回的 Promise
  return findLocal(character)
}

export {
  strokesOrderApi,
  hasLocalData
}

