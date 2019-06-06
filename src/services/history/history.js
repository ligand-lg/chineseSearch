/**
 * 管理搜索历史的持久化
 */

const history = []
const historyMax = 20
const historyKey = 'historyKey'

// 初始化，从缓存中读搜索历史
function init() {
  wx.getStorage({
    key: historyKey,
    success(res) {
      history.splice(0, history.length)
      for (const item of res.data) {
        history.push(item)
      }
    }
  })
}

function getHistory() {
  return history
}

function appendHistory(char) {
  const oldIndex = history.indexOf(char)
  if (oldIndex > -1) {
    history.splice(oldIndex, 1)
  }
  if (history.length >= historyMax) {
    this.data.history.pop()
  }
  history.unshift(char)
}

// 持久化，将搜索历史写入缓存
function persist() {
  wx.setStorage({
    key: historyKey,
    data: history
  })
}

export {
  init,
  persist,
  getHistory,
  appendHistory
}