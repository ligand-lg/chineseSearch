/**
 * 本文件负责编码、解码
 * 压缩算法描述：
 *  每条数据称为一个单元，每个单元由三个部分组成：汉字本身（character），汉字笔画（strokes），汉字笔画大致走势（medians)。具体每个部分作用见这里（）。通过优化数学和去除json多余符号，来优化大小。规则如下：
 *  [汉字utf-16编码][OP1][][][OP2][][][comma][newline][个数][0][1][2][3][comma][个数][0][1][2][3][end]
 * 压缩后能去掉 key、标点符号（括号、引号、逗号、空格），优化数字
 */

// 数据中：maxNum: 1023  minNum: -119
const NUM = {
  // 因为有负数的存在（最小-119），使用 base 来统一为正数。编码后数字 = 原始数字 + base
  base: 255,
  // 使用两byte来表示一位数，高为不能超过'\n'，所以最大为 0000 1010 0000 0000 - 1
  max: 2560 - 1,
  min: 100
}

// 编码、解码中控制符
const CONTROLS = {
  M: Symbol('M'),
  Q: Symbol('Q'),
  Z: Symbol('Z'),
  L: Symbol('L'),
  C: Symbol('C'),
  comma: Symbol('comma'),
  newLine: Symbol('newLine'),
  end: Symbol('end')
}
const CTRLS = {
  follow: {
    [CONTROLS.M]: 2,
    [CONTROLS.Q]: 4,
    [CONTROLS.Z]: 0,
    [CONTROLS.L]: 2,
    [CONTROLS.C]: 6,
    [CONTROLS.comma]: 0,
    [CONTROLS.newLine]: 0,
    [CONTROLS.end]: 0
  },
  toStr: {
    [CONTROLS.M]: 'M',
    [CONTROLS.Q]: 'Q',
    [CONTROLS.Z]: 'Z',
    [CONTROLS.L]: 'L',
    [CONTROLS.C]: 'C',
    [CONTROLS.comma]: '',
    [CONTROLS.newLine]: '',
    [CONTROLS.end]: ''
  },
  encode: {
    [CONTROLS.M]: 0x4D00,
    [CONTROLS.Q]: 0x5100,
    [CONTROLS.Z]: 0x5A00,
    [CONTROLS.L]: 0x4C00,
    [CONTROLS.C]: 0x4300,
    [CONTROLS.comma]: 0x2c00,
    [CONTROLS.newLine]: 0x0A00,
    [CONTROLS.end]: 0x0000
  },
  decode: {
    0x4D00: CONTROLS.M,
    0x5100: CONTROLS.Q,
    0x5A00: CONTROLS.Z,
    0x4C00: CONTROLS.L,
    0x4300: CONTROLS.C,
    0x2c00: CONTROLS.comma,
    0x0A00: CONTROLS.newLine,
    0x0000: CONTROLS.end
  }
}

/**
 * str -> int。编码汉字
 * @param {*} character 汉字字符
 * @return 汉字编码
 */
function encode_character(character) {
  return character.charCodeAt(0);
}

/**
 * int -> str。解码汉字
 * @param {*} code 汉字编码
 * @return 解码后的汉字
 */
function decode_character(code) {
  return String.fromCharCode(code)
}

/**
 * symbol -> int. 编码控制符，symbol 为 CONTROLS 中定义的有效 Symbol
 * @param {*} ctrl_symbol 控制符
 * @return 控制符对应的编码
 */
function encode_control(ctrl_symbol) {
  if (CTRLS.encode[ctrl_symbol] === undefined) {
    throw `control ${ctrl} not define`
  }
  return CTRLS.encode[ctrl_symbol]
}

/**
 * int -> symbol. 解码控制符
 * @param {*} code 控制符编码
 * @return 控制符对应的Symbol
 */
function decode_control(code) {
  if (CTRLS.decode[code] === undefined) {
    thow`error control code ${code}`
  }
  return CTRLS.decode[code]
}

/**
 * int -> int. 编码尾随数，尾随数就是后面多少数一组，主要用在Medians中
 * @param {*} num 尾随数个数
 * @return 编码后的尾随数
 */
function encode_follow(num) {
  if (num < 0) {
    throw "follow must be positive"
  }
  return num;
}

/**
 * int -> int. 解码尾随数。
 * @param {*} code 尾随数编码
 * @return 尾随数
 */
function decode_follow(code) {
  return code;
}

/**
 * int -> int. 编码数据中的数字，因为数字可能为负数，所以编码前需要加个base，保证为正数。
 * @param {*} num 数字
 * @return 编码后的数字
 */
function encode_num(num) {
  num += NUM.base
  if (num > NUM.max || num < NUM.min) {
    throw `num: ${num} must below ${NUM.max} and up ${NUM.min}`
  }
  return num
}

/**
 * int -> int. 解码数字
 * @param {*} code 编码后数字
 * @return 数字
 */
function decode_num(code) {
  return code - NUM.base
}

/**
 * 编码一条数据。
 * @param {*} character 汉字字符
 * @param {*} strokers 笔画数组
 * @param {*} medians 笔画走势数组
 * @return 编码后二进制数据
 */
function encode({ character, strokes, medians }) {
  /* step1 计算编码后空间大小(两字节为一个单位) */
  let encodeSize = 0

  // character 固定大小一个单位
  encodeSize += 1
  // storks
  for (const line of strokes) {
    // 无论是操作符还是数字都是一个单位
    encodeSize += line.split(' ').length
    // 每行结束，加个逗号
    encodeSize += 1
  }
  // strokes 结束，加个换行
  encodeSize += 1
  //medians
  for (const line of medians) {
    // 第一个控制符：记录数组长度
    encodeSize += 1
    // median是成对出现
    encodeSize += line.length * 2
    // 每行结束，加个逗号
    encodeSize += 1
  }
  // 结束符,结束符替代最后一行逗号
  // encodeSize += 1

  /* step2 开始编码 */
  let bufView = new Uint16Array(new ArrayBuffer(encodeSize * 2))
  let i = 0
  // encode character
  bufView[i++] = encode_character(character)
  // encode strokers
  for (const line of strokes) {
    for (const block of line.split(' ')) {
      // block 为操作
      if (block.length === 1 && CONTROLS[block] !== undefined) {
        bufView[i++] = encode_control(CONTROLS[block])
      } else {
        // block 为操作数
        bufView[i++] = encode_num(parseInt(block))
      }
    }
    bufView[i++] = encode_control(CONTROLS.comma)
  }
  bufView[i++] = encode_control(CONTROLS.newLine)

  // encode medians
  for (const line of medians) {
    // 这里记录了数组的长度
    bufView[i++] = encode_follow(line.length)
    for (const pair of line) {
      bufView[i++] = encode_num(pair[0])
      bufView[i++] = encode_num(pair[1])
    }
    bufView[i++] = encode_control(CONTROLS.comma)
  }
  // 这里注意！最后一行结尾不是comma，而是end
  bufView[i - 1] = encode_control(CONTROLS.end)
  // 校验使用的长度是否与第一步统计长度一致
  if (i != encodeSize) {
    throw `different value between use_size: ${i} and real size ${encodeSize} `
  }
  return bufView
}

/**
 * 解码一条数据，带有头尾校验操纵
 * @param {*} uint16_buf 二进制数据
 * @param {*} character 汉字字符，用于校验
 * @return 原始json数据
 */
function decode(uint16_buf, character) {
  /* 1. 首尾校验。二进制数据以 characterCode 开头，以 CONTORLS.end 结尾 */
  if (decode_character(uint16_buf[0]) !== character) {
    throw `解码校验失败: buf 应该以字符：'${character}' 开头`
  }
  if (decode_control(uint16_buf[uint16_buf.length - 1]) !== CONTROLS.end) {
    throw `解码校验失败：buf 应该为 '${CTRLS.decode[CONTROLS.end]}' 结尾`
  }

  /* 2. 开始解码。三步：1.解码character 2.解码strokes 3.解码medians */
  const res = {
    character: '',
    storks: [],
    medians: []
  }
  let i = 0

  /* step 1, decode character */
  res.character = decode_character(uint16_buf[i++])

  /* step 2, decode strokes */
  let ctrl = null
  while (ctrl !== CONTROLS.newLine) {
    let line = []
    while (ctrl !== CONTROLS.comma) {
      // 解码操作符
      ctrl = decode_control(uint16_buf[i++])
      line.push(CTRLS.toStr[ctrl])
      // 解码操作数
      const followNums = CTRLS.follow[ctrl]
      for (let j = 0; j < followNums; ++j) {
        line.push(String(decode_num(uint16_buf[i++])))
      }
    }
    res.storks.push(line.join(' '))
    // 更新到下一个op，注意不改变 i
    ctrl = decode_control(uint16_buf[i])
  }
  // 注意改变 i 到下一个字符
  i++
  /* step 3, decode medians */
  ctrl = null
  while (ctrl !== CONTROLS.end) {
    let line = []
    let follow = decode_follow(uint16_buf[i++])
    while (follow > 0) {
      let pair = []
      pair.push(decode_num(uint16_buf[i++]))
      pair.push(decode_num(uint16_buf[i++]))
      line.push(pair)
      follow--
    }
    res.medians.push(line)
    ctrl = decode_control(uint16_buf[i++])
  }

  return res
}

// node export 
exports.encode_character = encode_character;
exports.decode_character = decode_character;
exports.encode = encode
exports.decode = decode