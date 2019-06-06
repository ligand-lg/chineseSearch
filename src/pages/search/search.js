// pages/search/search.js
import { getHistory, appendHistory, persist as historyPersist } from '../../services/history/history'
Page({
  /**
   * Page initial data
   */
  data: {
    placehoder: '目标汉字',
    // 0 - normal , 1 - searching, 2 - succeed, 3 - error
    status: 0,
    backDelay: 150,
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
        inputValue: newCha,
        status: 1
      })
      const app = getApp()
      app.strokeOrderApi(newCha)
        .then(ans => {
          this.setData({
            status: 2
          })
          appendHistory(newCha)
          setTimeout(wx.navigateBack, this.data.backDelay)
        })
        .catch(error => {
          console.error(error)
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
    this.search(e.target.id)
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const history = getHistory()
    if (history.length > 0) {
      this.setData({
        history: history
      })
    }
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
    historyPersist()
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