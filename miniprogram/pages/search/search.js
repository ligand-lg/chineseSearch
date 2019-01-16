// pages/search/search.js
Page({

  /**
   * Page initial data
   */
  data: {
    placehoder: '目标汉字',
    history: ['李', '刚']
  },
  onSearch(e) {
    const newCha = e.detail.value
    console.log(newCha)
    const app = getApp()
    app.strokeOrderApi(newCha).then(ans => {
      wx.navigateBack()
    }).catch(cha => console.log(cha))
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