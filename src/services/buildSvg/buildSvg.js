import { svgConf as buildSVGDefault } from './svgConf'

const double = x => x * x;
const distance = (x1, y1, x2, y2) => Math.sqrt(double(x1 - x2) + double(y1 - y2))

/**
 * 输入笔画的大致走势，返回其长度。笔画的长度是很难精确计算的，数据中 medians 是每个笔画的大致走势，可以预估出笔画的长度。
 * @param {*} path 笔画大致走势
 */
function getStrokeLen(path) {
    let len = 0
    for (let i = 1; i < path.length; ++i) {
        len += distance(path[i][0], path[i][1], path[i - 1][0], path[i - 1][1])
    }
    // 加上一个数，防止溢出
    return len + 0.1
}

/**
 * 输入笔画长度，返回其书写需要的时长。基本策略是：笔画长度越长，书写时间也就越久，但这个时间增长速率（导数）是越来越慢的。
 * 速度以永字为标准：
 *  慢：14s
 *  中：9s
 *  快：5s
 *  超快：2.25s
 * 
 * @param {*} strokeLen 笔画长度
 * @param {*} speed 动画的速度，0-慢，1-普通，2-快，3-超快
 */
function getStrokeDrawTime(strokeLen, speed = 1) {
    let a = 0.07; // 系数
    let b = 0.1; // 常数基础时间
    if (0 == speed) {
        a = 0.12
        b = 0.15
    } else if (2 == speed) {
        a = 0.04
        b = 0.05
    }else if (3 == speed) {
        a = 0.02
        b = 0.02
    }
    return Math.sqrt(strokeLen) * a + b;
}

/**
 * 生成 SVG。字符串构建有点复杂，可以同时打开文件 Template.svg 进行对比。
 * @param {*} 原始数据
 * @param {*} 配置信息
 */
function buildSvg({ medians, strokes }, {
    background = buildSVGDefault.background,
    withAnimation = buildSVGDefault.widthAnimaiton,
    beforeDrawColor = buildSVGDefault.beforeDrawColor,
    penColor = buildSVGDefault.penColor,
    strokeWidth = buildSVGDefault.strokeWidth,
    speed = buildSVGDefault.speed
} = buildSVGDefault
) {
    /** 这里字符串构建的缩进不要轻易调整！！ */
    const svgCode = []
    svgCode.push(`<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">`)
    // 背景田字格
    if (background) {
        svgCode.push(`  <g stroke="lightgray" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
    <line x1="0" y1="0" x2="256" y2="256"></line>
    <line x1="256" y1="0" x2="0" y2="256"></line>
    <line x1="128" y1="0" x2="128" y2="256"></line>
    <line x1="0" y1="128" x2="256" y2="128"></line>
  </g>`)
    }
    svgCode.push(`  <g transform="scale(1, -1) translate(0, -900)">`)
    // 笔画轮廓
    for (let i = 0; i < strokes.length; ++i) {
        svgCode.push(`    <path d="${strokes[i]}" fill="${beforeDrawColor}"></path>`)
    }
    // 动画路径与animation的使用
    if (withAnimation) {
        // animation 的定义
        svgCode.push(`    <style type="text/css">`)
        const strokeLens = []
        for (const path of medians) {
            strokeLens.push(getStrokeLen(path))
        }
        // 第 n 笔动画的开始时间 = 第 n-1 笔动画开始时间 + 第 n-1 笔动动画持续时间
        let animationDelay = 0
        for (let i = 0; i < strokes.length; ++i) {
            const animationDuration = getStrokeDrawTime(strokeLens[i], speed)
            svgCode.push(`
      @keyframes keyframes${i} {
        from { stroke-width: ${strokeWidth}; stroke-dashoffset: ${strokeLens[i]}; }
        99% { stroke-width: ${strokeWidth}; stroke-dashoffset: 40; }
        to {stroke-width: 1024;}
      }
      #animation-${i} {
        animation: keyframes${i} ${animationDuration}s both;
        animation-delay: ${animationDelay}s;
        animation-timing-function: ease;
      }`)
            animationDelay += animationDuration
        }
        svgCode.push(`    </style>`)

        // 动画路径与animation的使用
        for (let i = 0; i < strokes.length; ++i) {
            let medianPath = []
            medianPath.push(`M ${medians[i][0][0]} ${medians[i][0][1]} `)
            for (let j = 1; j < medians[i].length; j++) {
                medianPath.push(`L ${medians[i][j][0]} ${medians[i][j][1]} `)
            }
            medianPath = medianPath.join('')
            svgCode.push(`
    <clipPath id="clip-${i}">
      <path d="${strokes[i]}"></path>
    </clipPath>
    <path clip-path="url(#clip-${i})" d="${medianPath}" fill="none" id="animation-${i}" stroke-dasharray="${strokeLens[i]}" stroke-linecap="round" stroke='${penColor}'></path>`)
        }
    }
    svgCode.push(`  </g>\n</svg>`)
    return svgCode.join('\n')
}

export default buildSvg