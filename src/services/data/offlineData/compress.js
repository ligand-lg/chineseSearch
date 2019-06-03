/**
 *  这个文件是 tools/compress.js 的子集
 */

const DATADIRNAME = 'compressData'

//  ---------------- NodeJS -------------
// const fs = require('fs')
// const Coder = require('./coder')
// const selectedData = require('./selected')
// const ROOTDIRPATH = __dirname

// ---------------- MiniPorgrame -------------
const fs = wx.getFileSystemManager()
const ROOTDIRPATH = wx.env.USER_DATA_PATH
import Coder from './coder'


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
const DATADIRPATH = `${ROOTDIRPATH}/${DATADIRNAME}`
const filePath = filename => {
  return `${DATADIRPATH}/${filename}`
}

// 使用单例模式来实现 索引信息 内存常驻，优化查询时间。
let _index = null
const getIndex = () => {
  if (_index === null) {
    // 初始化索引，注意：这里没有进行文件存在检查
    _index = JSON.parse(fs.readFileSync(filePath('index.json'), 'utf8'))
  }
  return _index
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
  const index = getIndex().index
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
  return new Promise((resolve, reject) => {
    try {
      const buf = fs.readFileSync(filePath(`${chunkId}.bin`))
      // 注意基本单位
      const arraybuf = toArrayBuffer(buf, offset * 2, length * 2)
      resolve(new Uint16Array(arraybuf))
    } catch (error) { reject(error) }
  })
}

/**
 * 给定汉字返回其json格式的笔画信息，没有找到返回null。
 * @param {*} character 
 */
function findLocal(character) {
  return new Promise((resolve, reject) => {
    // 1. 找索引信息
    const index = findIndex(character)
    // 没有找到索引，表示数据库中不存在该字
    if (index === null) {
      reject(`这么生僻的字(${character})，还是联网查好!(本地查无此字)`)
    }
    // 2. 通过索引找编码数据
    readEncodeData(index)
      .then(encodeData => {
        // 3. 解码数据
        const data = Coder.decode(encodeData, character)
        resolve(data)
      })
      .catch(reject)
  })
}

function getChunkNum() {
  const index = getIndex()
  return index.meta.chunkNum
}

// NodeJS
// exports.findLocal = findLocal
// exports.selected_zip = selected_zip
// exports.getChunkNum = getChunkNum

// es6
export {
  findLocal,
  getChunkNum
}