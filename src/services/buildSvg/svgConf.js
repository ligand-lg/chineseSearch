/**
 * 生成 SVG 动画的基本配置
 */
const svgConf = {
  widthAnimaiton: true,
  beforeDrawColor: 'lightgray',
  penColor: '#e23e3b',
  strokeWidth: 120,
  speed: 1,
}

function getSpeed() {
 return svgConf.speed 
}

// TODO: 持久化
function setSpeed(speed) {
  svgConf.speed = speed
}

function getPenColor() {
  return svgConf.penColor

}

function setPenColor(penColor) {
  svgConf.penColor = penColor
}

export {
  svgConf,
  getSpeed,
  setSpeed,
  getPenColor,
  setPenColor
}