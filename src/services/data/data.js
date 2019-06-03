/**
 * 用于查找汉字笔画数据，包装 onlineSearch 和 offlineSearch。
 * 
 */

import { strokesOrderApi as onlineApi } from './onlineData'
import { strokesOrderApi as offlineApi, hasLocalData } from './offlineData'

/**
 * 汉字：str ->  笔画信息：promise。
 * 在线版本、离线版本使用策略：
 *  if 有网：
 *    使用在线版本
 *  else if 存在离线版本：
 *    使用离线版本
 *  else 
 *    报错
 * @param {*} character 
 */
function searchData(character) {
  return new Promise((resolve, rejecct) => {
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        switch (networkType) {
          case 'wifi':
          case '2g':
          case '3g':
          case '4g':
            // 有网络，使用在线版本
            onlineApi(character)
              .then(resolve)
              .catch(rejecct)
            break
          default:
            // 无网络
            if (hasLocalData()) {
              offlineApi(character)
                .then(resolve)
                .catch(rejecct)
            } else {
              // 无网络、无缓存
              rejecct('断网的瞬间，时间又回来了！不过得先缓存下数据呀！（无网络、无缓存）')
            }
        }
      },
      fail: rejecct
    })
  })
}


export default searchData