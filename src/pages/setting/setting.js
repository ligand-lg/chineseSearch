// miniprogram/pages/setting.js
Page({

  /**
   * Page initial data
   */
  data: {
    settings: [
      {
        id: 'animation',
        name: '动画设置',
        page: 'animation/animation'
      }, {
        id: 'offlineData',
        name: '本地缓存',
        page: 'offlineDataSetting/offlineDataSetting'
      }, {
        id: 'about',
        name: '关于',
        page: 'about/about'
      }
    ]

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