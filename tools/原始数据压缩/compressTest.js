/**
 * 微信小程序本地存储上限为10MB，而所有数据原始大小为30MB+，故需要魔改压缩 + 常用字选择。
 * 压缩比例：30MB -> 16MB, 接近 50%。
 * 字数选择：
 * 
 */
const fs = require('fs')
const path = require('path')
const compress = require('./compress')

const max = (a, b) => a > b ? a : b
const min = (a, b) => a > b ? b : a
// 类似 C 的整除
const div = (a, b) => Math.floor(a / b)
// buffer to ArrayBuffer。文件读写都是以 NodeJS 中的 buffer 为基础。而我的操作是以 ES6 中的ArrayBuffer 为基础。
const bufferToArrayBuffer = (buf, offset, length) => {
  let ab = new ArrayBuffer(length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < length; ++i) {
    view[i] = buf[offset + i]
  }
  return ab
}

/**
 * 读取原始数据，用以分析、压缩。
 * @param {*} filename 文件相对路径
 * @return json数组，没行为一条数据
 */
function readRawData(filename = '../graphics-618dbab.txt') {
  const res = []
  const filePath = path.join(__dirname, filename)
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    try {
      res.push(JSON.parse(line))
    } catch (e) {
      console.log(`json parse error: ${line}`)
    }
  }
  return res
}

/**
 * 原始数据分析。分析结果如下：

count: 9574
OPS: {"M":112617,"Q":1073384,"Z":112617,"L":123761,"C":78345}
Max line op cnt: 45
maxNum: 1023
minNum: -119

 */
function rawAnalysis() {
  const rawJson = readRawData()
  let cnt = 0
  let max_num = 0
  let min_num = 10000
  let hash_table = {}
  let max_line_op_cnt = 0
  for (const line of rawJson) {
    ++cnt
    for (const s of line.strokes) {
      let line_op_cnt = 0
      for (const block of s.split(' ')) {
        // 判断是否为操作
        if (block.length == 1 && block[0] >= 'A' && block[0] <= 'Z') {
          if (hash_table[block]) {
            hash_table[block] += 1
          } else {
            hash_table[block] = 1
          }
          line_op_cnt += 1
        } else {
          num = parseInt(block)
          max_num = max(max_num, num)
          min_num = min(min_num, num)
        }
      }
      max_line_op_cnt = max(max_line_op_cnt, line_op_cnt)
    }

    for (const m of line.medians) {
      for (const pair of m) {
        max_num = max(max_num, pair[0])
        max_num = max(max_num, pair[1])
        min_num = min(min_num, pair[0])
        min_num = min(min_num, pair[1])
      }
    }
  }
  console.log(`count: ${cnt}`)
  console.log(`OPS: ${JSON.stringify(hash_table)}`)
  console.log(`Max line op cnt: ${max_line_op_cnt}`)
  console.log(`maxNum: ${max_num}`)
  console.log(`minNum: ${min_num}`)
}

/**
 * 文件压缩。1. 对所有数据进行 encode 编码。2.进行文件分块，方便查找时不至于加载整个文件，而是包含目标的块，从而减少时间和空间开销。3. index.json 索引文件。每条索引由四部分组成：字符编码、位于哪个文件块、起始位置偏移、记录长度。
 * @param {*} chunkNum 文件分块个数
 */
function zip(chunkNum = 16) {
  const rawDataArray = readRawData()
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
    let fd = fs.openSync(path.join(__dirname, filename), 'w')
    for (let j = 0; j < chunkCaps[i]; ++j) {
      // 将 Uint16 转为 Uint8 来写入文件
      const characterCode = compress.encode_character(rawDataArray[cnt].character)
      const uint16 = compress.encode(rawDataArray[cnt])
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
  fs.writeFile(path.join(__dirname, './index.json'), index_str, err => { if (err) { console.log(err) } })
}

const INDEXFILENAME = 'index.json'

/**
 * 给定一个汉字，返回其索引信息，没有找到返回 null。注意 offset 和 length 都是以 16bit(2 byte) 为单位。
 * @param {*} character 目标汉字
 * @return 索引信息：{characterCode, chunkId, offset, length}
 */
function findIndex(character) {
  const characterCode = compress.encode_character(character)
  // read index
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, INDEXFILENAME), 'utf8')).index
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
  const buf = fs.readFileSync(path.join(__dirname, `${chunkId}.bin`))
  // 注意基本单位
  const arraybuf = bufferToArrayBuffer(buf, offset * 2, length * 2)
  return new Uint16Array(arraybuf)
}

/**
 * 给定汉字返回其json格式的笔画信息
 * @param {*} character 
 */
function find(character) {
  const index = findIndex(character)
  if (index === null) {
    return null
  }
  return compress.decode(readEncodeData(index), character)
}


console.log(JSON.stringify(find('符')))
// zip()
// rawAnalysis()