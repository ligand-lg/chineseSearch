//app.js
import ChartTranslate from './tools/chartTranslate'
import generationSVG from './tools/generationSvg'
import Base64 from './tools/base64'
import Coder from './tools/coder'

// 类似 C 的整除
const div = (a, b) => Math.floor(a / b)
// Buffer/ArrayBuffer to ArrayBuffer。NodeJS读文件读返回Buffer，而微信小程序返回 ArrayBuffer，这里做兼容处理。
const toArrayBuffer = (buf, offset, length) => {
  if (buf instanceof ArrayBuffer) {
    return buf.slice(offset, offset + length)
  } else if (buf instanceof Buffer) {
    let ab = new ArrayBuffer(length)
    const view = new Uint8Array(ab)
    for (let i = 0; i < length; ++i) {
      view[i] = buf[offset + i]
    }
    return ab
  }
  throw '不支持的类型buf'
}

App({
  globalData: {
    isLoading: false,
    thePromise: null,
    simple: {
      chart: '',
      svgCodes: ''
    },
    traditional: {
      chart: '',
      svgCodes: ''
    }
  },
  // 离线版本测试代码，仅供测试
  download() {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager()
      //1. 判断本地 索引 和 数据 是否存在。存在直接返回，不存在进行下载，下载完成返回
      // 
      fs.access({
        path: `${wx.env.USER_DATA_PATH}/index.json`,
        success: function () {
          console.log('存在缓存')
          resolve()
        },
        fail: function () {
          // 下载
          console.log('不存在缓存')
          wx.cloud.downloadFile({
            fileID: 'cloud://chinese-search-383574.6368-chinese-search-383574-1258333587/index.json',
            success: res => {
              fs.saveFile({
                tempFilePath: res.tempFilePath,
                filePath: `${wx.env.USER_DATA_PATH}/index.json`,
                success: res => {
                  console.log(res)
                },
                fail: msg => {
                  console.log(msg)
                }
              })
            },
            fail: console.error
          })
          wx.cloud.downloadFile({
            fileID: 'cloud://chinese-search-383574.6368-chinese-search-383574-1258333587/1.bin',
            success: res => {
              fs.saveFile({
                tempFilePath: res.tempFilePath,
                filePath: `${wx.env.USER_DATA_PATH}/1.bin`,
                success: res => {
                  console.log(res)
                },
                fail: msg => {
                  console.log(msg)
                }
              })
            },
            fail: console.error
          })
          resolve()
        }
      })
      // 
    })
  },
  showFiles: function () {
    wx.getSavedFileList({
      success: res => {
        console.log(res)
      }
    })
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.download()
    // this.showFiles()
    // this.strokeOrderApi('刚')
    this.strokeOrderApiLocal('刚')
  },
  /**
 * 给定一个汉字，返回其索引信息，没有找到返回 null。注意 offset 和 length 都是以 16bit(2 byte) 为单位。
 * @param {*} character 目标汉字
 * @return 索引信息：{characterCode, chunkId, offset, length}
 */
  findIndex: function (character) {
    const fs = wx.getFileSystemManager()
    const characterCode = Coder.encode_character(character)
    // read index
    const index = JSON.parse(fs.readFileSync(`${wx.env.USER_DATA_PATH}/index.json`, 'utf8')).index
    // 二分查找index
    let begin = 0, end = index.length, mid
    while (begin < end) {
      mid = div(begin + end, 2)
      if (index[mid][0] === characterCode) {
        break;
      } else if (index[mid][0] < characterCode) {
        begin = mid + 1
      } else {
        end = mid
      }
    }
    // 没有找到
    if (begin >= end) { return null }
    return {
      characterCode: index[mid][0],
      chunkId: index[mid][1],
      offset: index[mid][2],
      length: index[mid][3]
    }
  },

  /**
   * 根据传入的索引信息来返回对应的数据。不做解码，不做校验。
   * @param {*} param0 索引信息
   */
  readEncodeData: function ({ chunkId, offset, length }) {
    const fs = wx.getFileSystemManager()
    // 注意微信返回的是ArrayBuffer，nodejs 返回的是Buffer
    const buf = fs.readFileSync(`${wx.env.USER_DATA_PATH}/${chunkId}.bin`)
    // 注意基本单位
    const arraybuf = toArrayBuffer(buf, offset * 2, length * 2)
    return new Uint16Array(arraybuf)
  },

  /**
   * 给定汉字返回其json格式的笔画信息
   * @param {*} character 
   */
  findLocal: function (character) {
    const index = this.findIndex(character)
    if (index === null) {
      return null
    }
    const encodeData = this.readEncodeData(index)
    const data = Coder.decode(encodeData, character)
    return data
  },
  strokeOrderApiLocal(character) {
    const { simple, traditional } = ChartTranslate.translate(character)
    this.globalData.thePromise = new Promise((resolve, reject) => {
      this.globalData.isLoading = true
      const simpleData = this.findLocal(simple)
      if (simpleData) {
        this.globalData.simple = {
          chart: simple,
          svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(simpleData, { withAnimation: true }))}`
        }
      }
      const traditionalData = this.findLocal(traditional)
      if (traditionalData) {
        this.globalData.traditional = {
          character: traditional,
          svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(traditionalData, { withAnimation: true }))}`
        }
      }
      this.globalData.isLoading = false
      resolve(this.globalData)
    })
    return this.globalData.thePromise
  },
  strokeOrderApi(character) {
    const { simple, traditional } = ChartTranslate.translate(character)
    const collection = wx.cloud.database().collection('chineseSearch')
    const ans = {
      simple: '',
      traditional: '',
      // 同步两次请求, 表示完成个数，为2表示简体和繁体都返回了。
      status: 0
    }
    this.globalData.thePromise = new Promise((resolve, reject) => {
      this.globalData.isLoading = true
      collection.where({
        character: simple
      }).get().then(res => {
        if (res.data.length > 0) {
          ans.simple = {
            chart: simple,
            svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(res.data[0], { withAnimation: true }))}`
          }
          ans.status += 1
          if (ans.status === 2) {
            this.globalData.simple = ans.simple
            this.globalData.traditional = ans.traditional
            this.globalData.isLoading = false
            resolve(ans)
          }
        } else {
          this.globalData.isLoading = false
          reject(simple)
        }
      })
      collection.where({
        character: traditional
      }).get().then(res => {
        if (res.data.length > 0) {
          ans.traditional = {
            chart: traditional,
            svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(res.data[0], { withAnimation: true }))}`
          }
          ans.status += 1
          if (ans.status === 2) {
            this.globalData.simple = ans.simple
            this.globalData.traditional = ans.traditional
            this.globalData.isLoading = false
            resolve(ans)
          }
        } else {
          this.globalData.isLoading = false
          reject(traditional)
        }
      })
    })
    return this.globalData.thePromise
  },
  randomCharacter() {
    return '刚'
  },
  getGlobalStrokeOrder() {
    if (this.globalData.isLoading) {
      return this.globalData.thePromise
    } else {
      return Promise.resolve(this.globalData)
    }
  }
})
