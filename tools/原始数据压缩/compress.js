const fs = require('fs')
const path = require('path')

const max = (a, b) => a > b ? a : b
const min = (a, b) => a > b ? b : a

const OFFSET = 255 // 因为有负数的存在（最小-119），使用OFFSET同一为正数。编码后数字 = 原始数字 + OFFSET
const MAX_NUM = 2560 - 1 // 使用两byte来表示一位数，高为不能超过'\n'，所以最大为 0000 1010 0000 0000 - 1
const OPS = { M: 2, Q: 4, Z: 0, L: 2, C: 6 }

function encode() {
  str = "M 249 651 Q 277 675 354 752 Q 369 770 390 783 Q 408 796 395 810 Q 380 823 354 833 Q 329 842 318 838 Q 306 834 313 822 Q 320 800 239 663 Q 238 662 236 658 C 221 632 226 631 249 651 Z"


}

function decode(str) {

}

function readFile(filename = '../graphics-618dbab.txt') {
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

function saveFile(content, filename = '../graphics-618dbab-cmp.txt') {
  const filePath = path.join(__dirname, filename)
  const str = content.join('\n')
  fs.writeFile(filePath, str, () => console.log(`saveFile ${filename} done`))
}

/**
 * 原始数据分析。包括svg 的操作种类，坐标最值
 */
function rawAnalysis() {
  const rawJson = readFile()
  cnt = 0
  max_num = 0
  min_num = 10000
  hash_table = {}
  for (const line of rawJson) {
    ++cnt
    for (const s of line.strokes) {
      for (const block of s.split(' ')) {
        // 判断是否为操作
        if (block.length == 1 && block[0] >= 'A' && block[0] <= 'Z') {
          if (hash_table[block]) {
            hash_table[block] += 1
          } else {
            hash_table[block] = 1
          }
        } else {
          num = parseInt(block)
          max_num = max(max_num, num)
          min_num = min(min_num, num)
        }
      }
    }
  }
  console.log(`count: ${cnt}`)
  console.log(`OPS: ${JSON.stringify(hash_table)}`)
  console.log(`maxNum: ${max_num}`)
  console.log(`minNum: ${min_num}`)
}

function main() {
  const content = readFile()
  const res = []
  let cnt = 0;
  for (const line of content) {
    res.push(JSON.stringify(encode(line)))
    ++cnt;
  }
  console.log(cnt)
  saveFile(res)
}

encode()

