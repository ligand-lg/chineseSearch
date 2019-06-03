// pages/strokeOrder/strokeOrder.js

import Base64 from '../../utils/base64'
Page({
  data: {
    // 是否为简体模式，不是简体模式就是繁体模式。
    isSimple: true,
    // 当前展示的汉字
    character: '',
    // 当前汉字的简体svg的base64编码
    simpleSvg: '',
    // 当前汉字的繁体svg的base64编码
    traditionalSvg: '',
    // 当前汉字是否有对应的不同写法的繁体，没有的话，只展示简体。
    hasTraditional: false
  },
  //  显示简体字
  switchToSimple() {
    if (!this.data.isSimple) {
      // 实在找不到重新播放svg动画的方法，只能refresh整个页面。
      wx.redirectTo({
        url: '/pages/strokeOrder/strokeOrder'
      })
    }
  },
  // 显示繁体字
  switchToTraditional() {
    if (this.data.isSimple && this.data.hasTraditional) {
      this.setData({
        isSimple: false
      })
    }
  },
  search() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  setting() {
    console.log('setting')
  },
  // 从 app.js 中同步数据
  syncData() {
    const _process = item => `data:image/svg+xml;base64,${Base64.encode(item)}`
    // 从gloablData中同步过来
    const app = getApp()
    app.getGlobalStrokeOrder().then(resp => {
      this.setData({
        hasTraditional: resp.hasTraditional,
        character: resp.inputChar,
        simpleSvg: _process(resp.simple.svgCodes),
        traditionalSvg: resp.hasTraditional ? _process(resp.traditional.svgCodes) : ''
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