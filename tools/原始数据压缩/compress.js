/**
 * 微信小程序本地存储上限为10MB，而所有数据原始大小为30MB+，故需要魔改压缩 + 常用字选择。
 * 压缩比例：30MB -> 16MB, 接近 50%。
 * 字数选择：
 * 
 */

//  ---------------- NodeJS -------------
const fs = require('fs')
const _dirname = __dirname
const Coder = require('./coder')
const selectedData = require('./selected')

// ---------------- MiniPorgrame -------------
// const fs = wx.getFileSystemManager()
// const _dirname = wx.env.USER_DATA_PATH
// import Coder from './coder'


// 类似 C 的整除
const div = (a, b) => Math.floor(a / b)

// Buffer/ArrayBuffer -> ArrayBuffer。
// NodeJS读文件读返回Buffer，而微信小程序返回 ArrayBuffer，这里做兼容处理。
const toArrayBuffer = (buf, offset, length) => {
  if (buf instanceof ArrayBuffer) {
    // arraB
    return buf.slice(offset, offset + length)
  } else if (buf instanceof Buffer) {
    let ab = new ArrayBuffer(length)
    const view = new Uint8Array(ab)
    for (let i = 0; i < length; ++i) {
      view[i] = buf[offset + i]
    }
    return ab
  }
  throw '不支持的buff类型'
}

// 文件名 -> 文件绝对路径。NodeJS 和 微信小程序兼容处理。
const _myPrefix = 'compressData'
const absPath = filename => {
  return `${_dirname}/${_myPrefix}/${filename}`
}

// 使用单例模式来实现 索引信息 内存常驻，优化查询时间。
let _index = null
const getIndex = () => {
  if (_index === null) {
    // 初始化索引，注意：这里没有进行文件存在检查
    _index = JSON.parse(fs.readFileSync(absPath('index.json'), 'utf8')).index
  }
  return _index
}

// --------------------------- 文件压缩 ------------------------------
/**
 * 文件压缩。1. 对所有数据进行 encode 编码。2.进行文件分块，方便查找时不至于加载整个文件，而是包含目标的块，从而减少时间和空间开销。3. index.json 索引文件。每条索引由四部分组成：字符编码、位于哪个文件块、起始位置偏移、记录长度。
 * @param {*} chunkNum 文件分块个数
 */
function zip(rawDataArray, chunkNum = 16) {
  // 1. 计算每个数据块中数据条数
  const chunkCaps = []
  // 首先平均下
  for (let i = 0; i < chunkNum; ++i) {
    chunkCaps.push(div(rawDataArray.length, chunkNum))
  }
  // 在均分余数
  for (let i = 0; i < rawDataArray.length % chunkNum; ++i) {
    chunkCaps[i] += 1
  }

  // 索引
  const index = []

  // 2. 写入压缩文件
  let cnt = 0
  for (let i = 0; i < chunkNum; ++i) {
    let chunkId = i + 1
    let filename = `${chunkId}.bin`
    let offset = 0
    let fd = fs.openSync(absPath(filename), 'w')
    for (let j = 0; j < chunkCaps[i]; ++j) {
      // 将 Uint16 转为 Uint8 来写入文件
      const characterCode = Coder.encode_character(rawDataArray[cnt].character)
      const uint16 = Coder.encode(rawDataArray[cnt])
      const buf = new Uint8Array(uint16.buffer)
      fs.write(fd, buf, err => { if (err) { console.err(err) } })

      // 更新索引
      index.push([characterCode, chunkId, offset, uint16.length])
      offset += uint16.length
      cnt++
    }
    fs.close(fd, err => { if (err) { console.log(err) } })
  }
  // 3. 写入索引
  const describe = ['character', 'chunkId', 'offset', 'length']
  const index_str = JSON.stringify({ describe, index })
  fs.writeFile(absPath('./index.json'), index_str, err => { if (err) { console.log(err) } })
}

/**
 * 选择 selected.js 中的汉字进行压缩。
 */
function selected_zip(rawDataArray, chunkNum = 1) {
  let selectedDataArray = []
  for (const line of rawDataArray) {
    if (selectedData.selected.search(line.character) > 0) {
      selectedDataArray.push(line)
    }
  }
  zip(selectedDataArray, chunkNum)
}

// --------------------------- 字符查找 ------------------------------
/**
 * 给定一个汉字，返回其索引信息，没有找到返回 null。注意 offset 和 length 都是以 16bit(2 byte) 为单位。
 * @param {*} character 目标汉字
 * @return 索引信息：{characterCode, chunkId, offset, length}
 */
function findIndex(character) {
  const characterCode = Coder.encode_character(character)
  // read index
  const index = getIndex()
  // 二分查找index
  let begin = 0, end = index.length, mid
  while (begin < end) {
    mid = div(begin + end, 2)
    if (index[mid][0] === characterCode) {
      break;
    } else if (index[mid][0] < characterCode) {
      begin = mid + 1
    } else {
      end = mid
    }
  }
  // 没有找到
  if (begin >= end) { return null }
  return {
    characterCode: index[mid][0],
    chunkId: index[mid][1],
    offset: index[mid][2],
    length: index[mid][3]
  }
}

/**
 * 根据传入的索引信息来返回对应的数据。不做解码，不做校验。
 * @param {*} param0 索引信息
 */
function readEncodeData({ chunkId, offset, length }) {
  const buf = fs.readFileSync(absPath(`${chunkId}.bin`))
  // 注意基本单位
  const arraybuf = toArrayBuffer(buf, offset * 2, length * 2)
  return new Uint16Array(arraybuf)
}

/**
 * 给定汉字返回其json格式的笔画信息，没有找到返回null。
 * @param {*} character 
 */
function findLocal(character) {
  // 1. 找索引信息
  const index = findIndex(character)
  // 没有找到索引，表示数据库中不存在该字
  if (index === null) {
    return null
  }
  // 2. 通过索引找编码数据
  const encodeData = readEncodeData(index)
  // 3. 解码数据
  const data = Coder.decode(encodeData, character)
  return data
}

// NodeJS
exports.findLocal = findLocal
exports.selected_zip = selected_zip

// es6
export {
  findLocal
}