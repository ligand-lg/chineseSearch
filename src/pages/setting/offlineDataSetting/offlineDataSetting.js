// src/pages/setting/offlineData.js

import { download as downloadApi, cleanup as cleanupApi, hasLocalData } from '../../../services/data/offlineData/fileManager'

Page({
  /**
   * Page initial data
   */
  data: {
    hasOfflineData: false,
    isLoading: false,
  },
  __download() {
    wx.showLoading({
      title: '下载缓存中...',
      mask: true
    })
    downloadApi()
      .then(resp => {
        wx.hideLoading()
        wx.showToast({
          title: '缓存成功'
        })
        this.setData({
          hasOfflineData: hasLocalData(),
        })
      })
      .catch(err => {
        wx.hideLoading()
        wx.showModal({
          title: '缓存失败',
          content: err,
          showCancel: false
        })
      })
  },
  download() {
    const that = this
    wx.getNetworkType({
      success(res) {
        switch (res.networkType) {
          case 'wifi':
          case '2g':
          case '3g':
          case '4g':
            // 有网络
            that.__download()
            break
          default:
            // 无网络
            wx.showModal({
              title: '无网络',
              content: '请确保网络链接，再进行缓存操作',
              showCancel: false
            })
        }
      }
    })
  },
  cleanup() {
    this.setData({
      isLoading: true
    })
    cleanupApi()
      .then(resp => {
        this.setData({
          hasOfflineData: hasLocalData(),
          isLoading: false
        })
      })
      .catch(console.error)
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      hasOfflineData: hasLocalData()
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