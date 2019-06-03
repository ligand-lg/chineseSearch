/**
 * 缓存文件管理。
 */

import { getChunkNum } from './compress'

// 微信提供的本地文件管理。空间大小为 10MB（垃圾）
const fs = wx.getFileSystemManager()

// 本地文件目录相关，与 compress.js 中保持一致
const DATADIRNAME = 'compressData'
const ROOTDIRPATH = wx.env.USER_DATA_PATH
const DATADIRPATH = `${ROOTDIRPATH}/${DATADIRNAME}`
const filePath = filename => {
  return `${DATADIRPATH}/${filename}`
}

// 文件命名相关
const indexFileName = 'index.json'
const dataFilenName = chunkId => {
  return `${chunkId}.bin`
}

// 云开发中文件存储的前缀
const FILEIDPREFIX = 'cloud://chinese-search-383574.6368-chinese-search-383574-1258333587'
const getFileID = filename => {
  return `${FILEIDPREFIX}/${filename}`
}


const EXISTKEY = 'exitKey'
const existTag = {
  setExistTag: () => {
    wx.setStorageSync(EXISTKEY, true)
  },
  removeExistTag: () => {
    wx.setStorageSync(EXISTKEY, false)
  },
  getExistTag: () => {
    try {
      const value = wx.getStorageSync(EXISTKEY)
      return value
    } catch (e) {
      return false
    }
  }
}

/**
 * 微信 fs.saveFile的promise封装，同时处理文件路径问题。
 * @param {*} tmpFilePath 
 * @param {*} filename 
 */
const mySaveFile = (tmpFilePath, filename) => {
  return new Promise((resolve, reject) => {
    fs.saveFile({
      tempFilePath: tmpFilePath,
      filePath: filePath(filename),
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 下载缓存到本地数据
 * 先后调用 cleanup，再重建 _myPrefix 文件夹，并下载文件。下载完成，设置 exist 标签
 */

function download() {
  return new Promise((resolve, reject) => {
    //  1.清理旧数据
    cleanup().then(() => {
      // 2. 创建文件夹
      fs.mkdir({
        dirPath: DATADIRPATH,
        recursive: true,
        success: () => {
          // 3. 开始下载数据。首先下载 index.json, 通过 index.json 来获取 chunkNum,从而构造出各个数据块名字。
          wx.cloud.downloadFile({
            fileID: getFileID(indexFileName)
          }).then(res => {
            mySaveFile(res.tempFilePath, indexFileName).then(() => {
              // 从 index.json 中读取chunkNum，根据chunkNum进行下载
              // 同步变量，chunk下载完成计数
              let successCnt = 0
              const chunkNum = getChunkNum()
              // 同时下载多个文件，注意同步
              for (let id = 1; id <= chunkNum; ++id) {
                wx.cloud.downloadFile({
                  fileID: getFileID(dataFilenName(id))
                }).then(res => {
                  // 下载完成，保存文件
                  mySaveFile(res.tempFilePath, dataFilenName(id))
                    .then(() => {
                      successCnt++
                      // 全部下完，设置缓存标记为true
                      if (successCnt === chunkNum) {
                        console.log('下载完成')
                        existTag.setExistTag()
                        resolve()
                      }
                    })
                    .catch(reject)
                })
                  .catch(reject)
              }
            })
              .catch(reject)
          }).catch(reject)
        },
        fail: reject
      })
    })
      .catch(reject)
  })
}

/**
 * 删除本地所有缓存。
 * 如果文件夹 _myPrefix 存在，删除之，并去除 exist 标签
 */
function cleanup() {
  existTag.removeExistTag()
  return new Promise((resolve, reject) => {
    // 1.判断数据文件夹是否存在
    fs.access({
      path: DATADIRPATH,
      success: () => {
        // 2.存在，递归删除整个文件夹
        fs.rmdir({
          dirPath: DATADIRPATH,
          recursive: true,
          success: resolve,
          fail: reject,
        })
      },
      fail: resolve
    })
  })
}

/**
 * 本地是否有缓存。
 */
function hasLocalData() {
  return existTag.getExistTag()
}

/**
 * 本地缓存占用的大小
 */
function totalSize() {

}

// 读文件
function readFile() {

}

export {
  download,
  cleanup,
  hasLocalData
}