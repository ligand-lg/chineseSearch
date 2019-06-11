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

/**
 * 读取原始数据，用以分析、压缩。
 * @param {*} filename 文件相对路径
 * @return json数组，没行为一条数据
 */
let __readRawData = null
function readRawData(filename = '../graphics-618dbab.txt') {
  if (__readRawData === null) {
    const res = []
    const filePath = path.join(__dirname, filename)
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      try {
        res.push(JSON.parse(line))
      } catch (e) {
        console.log(`json parse error: ${line}`)
      }
    }
    __readRawData = res
  }
  return __readRawData
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

let __rawData = null
/**
 * 校验数据
 * @param {*} 待校验的数据
 */
function confirm({ character, strokes, medians }) {
  if (__rawData === null) {
    __rawData = {}
    const rawData = readRawData()
    for (const item of rawData) {
      __rawData[item.character] = item
    }
  }
  // 第一步获取原数据
  const correctData = __rawData[character]
  if (!correctData) {
    console.log(`${character}有问题：原始数据中没有这个字`)
    return false
  }
  // 校验 strokes
  let i = 0
  for (; i < strokes.length; ++i) {
    if (strokes[i].slice(0, strokes[i].length - 1) !== correctData.strokes[i]) {
      console.log(`${character}有问题：strokes[${i}]，原始：${correctData.strokes[i]}，给定：${strokes[i]}`)
      return flase
    }
  }
  // 校验 medians
  i = 0
  for (; i < medians.length; ++i) {
    for (let j = 0; j < medians[i].length; ++j) {
      const x1 = parseInt(medians[i][j][0]), y1 = parseInt(medians[i][j][1])
      const x2 = parseInt(correctData.medians[i][j][0])
      const y2 = parseInt(correctData.medians[i][j][1])
      if (x1 !== x2) {
        console.log(`${character}有问题：medians[${i}][${j}]，原始：${correctData.medians[i][j]}，给定：${medians[i][j]}`)
        return false
      }
      if (y1 !== y2) {
        console.log(`${character}有问题：medians[${i}][${j}]，原始：${correctData.medians[i][j]}，给定：${medians[i][j]}`)
        return false
      }
    }
  }
  return true
}

/**
 * 压缩完成后，测试所有的压缩字
 */
function zip_test() {
  const index = compress.getIndex()
  for (const item of index.index) {
    const char = String.fromCharCode(item[0])
    compress.findLocal(char)
      .then(data => {
        confirm(data)
      })
  }
}

// --------------------------- Runner ------------------------------
// 离线字挑选,常用简体3500个字 + 对应繁体1534 个字, 共5034个字
compress.selected_zip(readRawData(), 8)
zip_test()


// compress.findLocal('丁')
//   .then((data) => {
//     __confirm(data)
//   })

// rawAnalysis()