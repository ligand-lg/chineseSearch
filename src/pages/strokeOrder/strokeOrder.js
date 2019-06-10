// pages/strokeOrder/strokeOrder.js

import Base64 from '../../utils/base64'
Page({
  data: {
    // 是否为简体模式，不是简体模式就是繁体模式。
    isSimple: true,
    // 当前展示的汉字
    character: '',
    // 当前动画的 svg base64编码
    svgBase64: '',
    // 当前汉字的简体svg代码
    simpleSvg: '',
    // 当前汉字的繁体svg代码
    traditionalSvg: '',
    // 当前汉字是否有对应的不同写法的繁体，没有的话，只展示简体。
    hasTraditional: false,
    isEgg: false
  },
  // 重新开始播放当前动画
  reStartAnimation() {
    if (this.data.isSimple) {
      this.setData({
        svgBase64: this.toUniqueBase64(this.data.simpleSvg)
      })
    } else {
      this.setData({
        svgBase64: this.toUniqueBase64(this.data.traditionalSvg)
      })
    }
  },
  toUniqueBase64(svgCode) {
    const uniqueMark = `<!-- unique mark: ${Date.now()} -->\n`
    return `data:image/svg+xml;base64,${Base64.encode(uniqueMark + svgCode)}`
  },
  //  显示简体字。找到了重画svg的方法，在svg代码头上加上当前时间，来避免svg一样，从而绕过缓存。
  switchToSimple() {
    if (!this.data.isSimple) {
      this.setData({
        svgBase64: this.toUniqueBase64(this.data.simpleSvg),
        isSimple: true
      })
    }
  },
  // 显示繁体字
  switchToTraditional() {
    if (this.data.isSimple && this.data.hasTraditional) {
      this.setData({
        svgBase64: this.toUniqueBase64(this.data.traditionalSvg),
        isSimple: false
      })
    }
  },
  tapSvg() {
    this.reStartAnimation()
  },
  search() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  setting() {
    wx.navigateTo({
      url: '/pages/setting/setting'
    })
  },
  // 从 app.js 中同步数据
  syncData() {
    // 从gloablData中同步过来
    const app = getApp()
    app.getGlobalStrokeOrder().then(resp => {
      let svgBase64 = ''
      let isSimple = true
      // 当前模式为繁体，而且下一个字符有繁体，才显示繁体。不然显示简体。
      if (!this.data.isSimple && resp.hasTraditional) {
        svgBase64 = this.toUniqueBase64(resp.traditional.svgCodes)
        isSimple = false
      } else {
        svgBase64 = this.toUniqueBase64(resp.simple.svgCodes)
        isSimple = true
      }
      /* 彩蛋 */
      if (resp.inputChar === '福') {
        this.setData({
          hasTraditional: resp.hasTraditional,
          character: resp.inputChar,
          svgBase64: '',
          simpleSvg: resp.simple.svgCodes,
          traditionalSvg: resp.hasTraditional ? resp.traditional.svgCodes : '',
          isSimple: isSimple,
          isEgg: true
        })
        // 留一个 时间 给彩蛋动画
        setTimeout(()=> {
          this.setData({
            svgBase64: svgBase64
          })
        }, 1300)
        return
      }

      /* 彩蛋 */
      this.setData({
        hasTraditional: resp.hasTraditional,
        character: resp.inputChar,
        svgBase64: svgBase64,
        simpleSvg: resp.simple.svgCodes,
        traditionalSvg: resp.hasTraditional ? resp.traditional.svgCodes : '',
        isSimple: isSimple,
        isEgg: false
      })
    })
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    this.syncData()
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {
    this.setData({
      isEgg: false,
      svgBase64: ''
    })
  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})