// src/pages/setting/animationSetting/animationSetting.js

import {
  getSpeed,
  setSpeed,
  getPenColor,
  setPenColor
} from '../../../services/buildSvg/svgConf'

Page({

  /**
   * Page initial data
   */
  data: {
    speedSelected: 1,
    speedOpt: ['慢', '正常', '快', '超快'],
    penColorSelected: 0,
    penColorOpt: ['红色', '黑色', '蓝色'],
    truPenColors: ['#e23e3b', 'black', 'blue']
  },

  changeSpeed: function (e) {
    const newSpeed = e.detail.value
    this.setData({
      speedSelected: newSpeed
    })
    setSpeed(newSpeed)
  },
  changePenColor: function (e) {
    this.setData({
      penColorSelected: e.detail.value
    })
    setPenColor(this.data.truPenColors[e.detail.value])
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const penColor = getPenColor()
    let penColorIndex = 0
    for (; this.data.truPenColors[penColorIndex] != penColor; ++penColorIndex);
    if (penColorIndex >= this.data.truPenColors.length) {
      penColorIndex = 0
    }
    this.setData({
      speedSelected: getSpeed(),
      penColorSelected: penColorIndex
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