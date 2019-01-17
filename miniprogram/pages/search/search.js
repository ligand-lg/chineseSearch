// pages/search/search.js
Page({

  /**
   * Page initial data
   */
  data: {
    placehoder: '目标汉字',
    // 0 - normal , 1 - searching, 2 - succeed, 3 - error
    status: 0,
    history: ['李', '刚'],
    statusMapCssClass: ['.search-input-search', '.search-input-loading', '.search-input-succeed', '.search-input-error']
  },
  onSearch(e) {
    const newCha = e.detail.value
    if (newCha) {
      this.setData({
        status: 1
      })
      const app = getApp()
      app.strokeOrderApi(newCha).then(ans => {
        this.setData({
          status: 2
        })
        setTimeout(wx.navigateBack, 350)
      }).catch(cha => {
        console.error(cha)
        this.setData({
          status: 3
        })
      })
    }
  },
  searchFocus() {
    this.setData({
      status: 0
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