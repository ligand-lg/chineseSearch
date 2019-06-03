const double = x => x * x;
const distance = (x1, y1, x2, y2) => Math.sqrt(double(x1 - x2) + double(y1 - y2))

// 传入路径数组，输出路径长度。路径数组表示简单的多个线段，不涉及到复杂到曲线。
function getPathsLength(paths) {
    const ans = []
    for (const p of paths) {
        let len = 0
        for (let i = 1; i < p.length; i++) {
            len += distance(p[i][0], p[i][1], p[i - 1][0], p[i - 1][1])
        }
        // 加上一个数，防止溢出。
        ans.push(len + 0.1)
    }
    return ans
}
// 根据笔画的长度来计算对应动画到持续时间。
// 基础时间 + 系数 * sqrt（笔画长度）
function getAnimationDuration(pathLen) {
    return Math.sqrt(pathLen) * 0.04 + 0.3
}
// 基础配置
import generationSVGDefaults from './svgConf'

// 手动构建svg 带动画的。
function generationSVG({ medians, strokes }, {
    withAnimation = generationSVGDefaults.widthAnimaiton,
    beforeDrawColor = generationSVGDefaults.beforeDrawColor,
    penColor = generationSVGDefaults.penColor
} = generationSVGDefaults
) {
    const svgCode = []
    svgCode.push(`<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">`)
    // 背景田字格
    svgCode.push(`<g stroke="lightgray" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
      <line x1="0" y1="0" x2="256" y2="256"></line>
      <line x1="256" y1="0" x2="0" y2="256"></line>
      <line x1="128" y1="0" x2="128" y2="256"></line>
      <line x1="0" y1="128" x2="256" y2="128"></line>
    </g>
    <g transform="scale(1, -1) translate(0, -900)">`)
    // 底色
    for (let i = 0; i < strokes.length; i++) {
        svgCode.push(`<path d="${strokes[i]}" fill="${beforeDrawColor}"></path>`)
    }

    // 动画路径与animation的使用
    if (withAnimation) {
        // animation 的定义
        svgCode.push(`<style type="text/css">`)
        const pathLens = getPathsLength(medians)
        let animationDelay = 0
        for (let i = 0; i < strokes.length; i++) {
            const animationDuration = getAnimationDuration(pathLens[i])
            svgCode.push(`
        @keyframes keyframes${i} {
            from { stroke-dashoffset: ${pathLens[i]}; }
            to { stroke-dashoffset: 0; }
          }
          #animation-${i} {
            animation: keyframes${i} ${animationDuration}s both;
            animation-delay: ${animationDelay}s;
            animation-timing-function: linear;
          }`)
            animationDelay += animationDuration
        }
        svgCode.push(`</style>`)

        // 动画路径与animation的使用
        for (let i = 0; i < strokes.length; i++) {
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
        <path clip-path="url(#clip-${i})" d="${medianPath}" fill="none" id="animation-${i}" stroke-dasharray="${pathLens[i]}" stroke-linecap="round" stroke-width='128' stroke='${penColor}'></path>
        `)}
    }
    svgCode.push(`\t</g>\n</svg>`)
    return svgCode.join('\n')
}

export default generationSVG