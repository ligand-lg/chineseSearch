// pages/strokeOrder/strokeOrder.js

import {generationSVG, Base64, ChartTranslate} from '../tools/tools'
Page({
  data: {
    // 是否为简体模式，不是简体模式就是繁体模式
    isSimple: true,
    // 是否显示搜索层
    showSearch: false,
    searchInputFocus: false,
    // 当前展示的汉字
    character: '',
    // 当前汉字的简体svg的base64编码
    simpleSvg: '',
    // 当前汉字的繁体svg的base64编码
    traditionalSvg: ''
  },
  
  // 改变当前到字
  changeCharacter(newChar) {
    const {simple, traditional} = ChartTranslate.translate(newChar)
    if (!(simple && traditional)) {
      console.error(`简繁转换库中没有${newChar}`)
    }
    newChar = simple || newChar
    const collection = wx.cloud.database().collection('chineseSearch')
    collection.where({
      character: newChar
    }).get().then(res => {
      // 查找成功
      if (res.data.length > 0) {
        const svgCode = `data:image/svg+xml;base64,${Base64.encode(generationSVG(res.data[0]))}`
        this.setData({
          simpleSvg: svgCode,
          character: newChar
        })
      } else {
        console.log(`没有找到${newChar}`)
      }
    })
    if (traditional) {
      collection.where({
        character: traditional
      }).get().then(res => {
        //查重成功
        if (res.data.length > 0) {
          const svgCode = `data:image/svg+xml;base64,${Base64.encode(generationSVG(res.data[0]))}`
          this.setData({
            traditionalSvg: svgCode
          })
        } else {
          console.log(`没有找到${newChar}`)
        }
      })
    }
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
  // 搜索按钮点击回调
  search() {
    this.setData({
      showSearch: true,
      searchInputFocus: true
    })
  },
  // 开始搜索
  startSearch(e) {
    this.setData({
      showSearch: false
    })
    this.changeCharacter(e.detail.value)
  },
  // 取消搜索
  cancelSearch() {
    this.setData({
      showSearch: false
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
    this.changeCharacter('刚')
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