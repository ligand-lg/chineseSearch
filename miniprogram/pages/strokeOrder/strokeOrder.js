// pages/strokeOrder/strokeOrder.js

import { Base64 } from '../../tools/tools'
Page({
  data: {
    // 是否为简体模式，不是简体模式就是繁体模式。
    isSimple: true,
    // 是否在加载字。
    isLoading: false,
    // 当前展示的汉字
    character: '',
    // 当前汉字的简体svg的base64编码
    simpleSvg: '',
    // 当前汉字的繁体svg的base64编码
    traditionalSvg: ''
  },
  //  显示简体字
  switchToSimple() {
    if (!this.data.isSimple) {
      this.setData({
        isSimple: true,
      })
    }
  },
  // 显示繁体字
  switchToTraditional() {
    if (this.data.isSimple) {
      this.setData({
        isSimple: false
      })
    }
  },
  // 手动滑动滑块回调
  swiperChange(event) {
    if (event.detail.source === 'touch') {
      return event.detail.currentItemId === 'simple' ? this.switchToSimple() : this.switchToTraditional()
    }
  },
  search() {
    wx.navigateTo({
      url: '/pages/search/search'
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
    // 从gloablData中同步过来
    const app = getApp()
    app.getGlobalStrokeOrder().then(resp => {
      console.log(resp)
      this.setData({
        character: resp.simple.chart,
        simpleSvg: `data:image/svg+xml;base64,${Base64.encode(resp.simple.svgCode)}`,
        traditionalSvg: `data:image/svg+xml;base64,${Base64.encode(resp.traditional.svgCode)}`
      })
    })
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