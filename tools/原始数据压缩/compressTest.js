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

// --------------------------- Runner ------------------------------
// 离线字挑选,常用简体3500个字 + 对应繁体1534 个字, 共5034个字
compress.selected_zip(readRawData(), 8)

// console.log(compress.getChunkNum())

// compress.findLocal('刚')
  // .then(data => {
    // console.log(JSON.stringify(data))
  // })
  // .catch(err => {
    // console.log(err)
  // })

// zip(readRawData())
// rawAnalysis()