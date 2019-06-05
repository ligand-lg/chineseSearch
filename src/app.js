//app.js
import simpleToTraditional from './utils/simpleToTraditional'
import buildSvg from './services/buildSvg/buildSvg'
import searchData from './services/data/data'

App({
  globalData: {
    requestsPromise: null,

    isLoading: false,
    inputChar: '',
    hasTraditional: false,
    simple: {
      char: '',
      svgCodes: ''
    },
    traditional: {
      char: '',
      svgCodes: ''
    }
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.strokeOrderApi('刚')
  },
  strokeOrderApi(character) {
    const simpleChar = character
    const traditionalChar = simpleToTraditional(simpleChar)
    const hasTraditional = traditionalChar !== null

    // 新的数据
    const ans = {
      simple: '',
      traditional: '',
    }

    this.globalData.requestsPromise = new Promise((resolve, reject) => {
      /* 请求成功调用  */
      let _requestRemainder = hasTraditional ? 2 : 1
      const requestFinish = (resp, isSimple) => {
        const svgCodes = buildSvg(resp)
        if (isSimple) {
          ans.simple = {
            char: simpleChar,
            svgCodes
          }
        } else {
          ans.traditional = {
            char: traditionalChar,
            svgCodes
          }
        }
        // 同步处理
        _requestRemainder -= 1
        if (_requestRemainder <= 0) {
          this.globalData.simple = ans.simple
          this.globalData.traditional = ans.traditional
          this.globalData.isLoading = false
          this.globalData.hasTraditional = hasTraditional
          this.globalData.inputChar = character
          resolve(this.globalData)
        }
      }
      /* 请求失败处理 */
      const requestFail = (err) => {
        this.globalData.isLoading = false
        wx.showModal({
          title: '请求数据错误',
          content: err,
          showCancel: false
        })
        // resolve(this.globalData)
        reject(err)
      }
      /** 开始请求 */
      this.globalData.isLoading = true
      // 简体
      searchData(simpleChar)
        .then(resp => { requestFinish(resp, true) })
        .catch(requestFail)
      // 有繁体，在请求数据
      if (hasTraditional) {
        searchData(traditionalChar)
          .then(resp => { requestFinish(resp, false) })
          .catch(requestFail)
      }
    })
    return this.globalData.requestsPromise
  },
  getGlobalStrokeOrder() {
    if (this.globalData.isLoading) {
      return this.globalData.requestsPromise
    } else {
      return Promise.resolve(this.globalData)
    }
  }
})
