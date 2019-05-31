//app.js
import ChartTranslate from './tools/chartTranslate'
import generationSVG from './tools/generationSvg'
import Base64 from './tools/base64'
import searchData from './services/data/data'
import { download, cleanup, hasLocalData } from './services/data/offlineData/fileManager'

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
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // just for test
    if (!hasLocalData()) {
      download()
    }
    this.strokeOrderApi('刚')
  },
  strokeOrderApi(character) {
    const { simple, traditional } = ChartTranslate.translate(character)
    const ans = {
      simple: '',
      traditional: '',
      // 同步两次请求, 表示完成个数，为2表示简体和繁体都返回了。
      status: 0
    }
    this.globalData.thePromise = new Promise((resolve, reject) => {
      this.globalData.isLoading = true
      searchData(simple)
        .then(res => {
          ans.simple = {
            chart: simple,
            svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(res, { withAnimation: true }))}`
          }
          ans.status += 1
          if (ans.status === 2) {
            this.globalData.simple = ans.simple
            this.globalData.traditional = ans.traditional
            this.globalData.isLoading = false
            resolve(ans)
          }
        })
        .catch(err => {
          this.globalData.isLoading = false
          reject(err)
        })

      searchData(traditional)
        .then(res => {
          ans.traditional = {
            chart: traditional,
            svgBase64Code: `data:image/svg+xml;base64,${Base64.encode(generationSVG(res, { withAnimation: true }))}`
          }
          ans.status += 1
          if (ans.status === 2) {
            this.globalData.simple = ans.simple
            this.globalData.traditional = ans.traditional
            this.globalData.isLoading = false
            resolve(ans)
          }
        })
        .catch(err => {
          this.globalData.isLoading = false
          reject(err)
        })
    })
    return this.globalData.thePromise
  },
  getGlobalStrokeOrder() {
    if (this.globalData.isLoading) {
      return this.globalData.thePromise
    } else {
      return Promise.resolve(this.globalData)
    }
  }
})
