// pages/search/search.js
Page({

  /**
   * Page initial data
   */
  data: {
    placehoder: '目标汉字',
    // 0 - normal , 1 - searching, 2 - succeed, 3 - error
    status: 0,
    historyStorageKey: 'history',
    history: [],
    inputValue: '',
    statusMapCssClass: ['.search-input-search', '.search-input-loading', '.search-input-succeed', '.search-input-error']
  },
  onSearch(e) {
    this.search(e.detail.value)
  },
  search(newCha) {
    if (newCha) {
      this.setData({
        status: 1
      })
      const app = getApp()
      app.strokeOrderApi(newCha).then(ans => {
        this.setData({
          status: 2
        })
        this.appendHistory(newCha)
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
  //  点击搜索历史
  tapHistory(e) {
    this.setData({
      inputValue: e.target.id
    })
    this.search(e.target.id)
  },
  appendHistory(cha) {
    // 如果该条历史记录已经存在，先删除
    const oldIndex = this.data.history.indexOf(cha)
    if (oldIndex > -1) {
      this.data.history.splice(oldIndex, 1)
    }
    this.data.history.unshift(cha)
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const that = this
    wx.getStorage({
      key: this.data.historyStorageKey,
      success(res) {
        that.setData({
          history: res.data
        })
      }
    })
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
    wx.setStorage({
      key: this.data.historyStorageKey,
      data: this.data.history
    })
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