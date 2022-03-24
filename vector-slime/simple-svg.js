let SVG_MM = 3.543307

let SVG_WIDTH = 210
let SVG_HEIGHT = 290

let SVG_HEADER = `<svg width="${SVG_WIDTH}mm" height="${SVG_HEIGHT}mm" xmlns="http://www.w3.org/2000/svg">\n`
let SVG_FOOTER = '</svg>\n'

let SVG_OUTPUT_STRING = ''

let CURRENT_SVG_PATH = ''

function beginSvg() {
  SVG_OUTPUT_STRING = SVG_HEADER
}

function beginSvgPath() {
  CURRENT_SVG_PATH = ''
}

function svgMove(x, y) {
  CURRENT_SVG_PATH += ` M ${x} ${y}`
}

function svgLine(x, y) {
  CURRENT_SVG_PATH += ` L ${x} ${y}`
}

function endSvgPath() {
  SVG_OUTPUT_STRING += `<path d="${CURRENT_SVG_PATH}" stroke="black" fill-opacity="0" stroke-width="0.2"/>\n`
  CURRENT_SVG_PATH = ''
}

function endSvg() {
  SVG_OUTPUT_STRING += SVG_FOOTER
  //save([SVG_OUTPUT_STRING], 'vector-slime-svg.svg')
}
