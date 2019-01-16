//app.js
import { ChartTranslate, generationSVG } from './tools/tools'
App({
  globalData: {
    isLoading: false,
    thePromise: null,
    simple: {
      chart: '',
      svgCode: ''
    },
    traditional: {
      chart: '',
      svgCode: ''
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
    this.strokeOrderApi('刚').then(ans => console.log(this.globalData))
  },
  strokeOrderApi(character) {
    const { simple, traditional } = ChartTranslate.translate(character)
    const collection = wx.cloud.database().collection('chineseSearch')
    const ans = {
      simple: '',
      traditional: '',
      // 同步两次请求。
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
            svgCode: generationSVG(res.data[0])
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
            svgCode: generationSVG(res.data[0])
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
