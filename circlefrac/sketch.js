let radii = []
let recursion_depth = 10
let point_count = 2 ** recursion_depth
var radius = 256

var svg_xlat

let BORDER = 40
let LAYERS = 300
let MAX_DEPTH = 9
let RANDOM_RADIUS_DIVISOR = 0.1
let SHOULD_LOOP = false
let SHOULD_EXPAND = true

let DEBUG_OUTPUT = false

let SVG_OUTPUT = true

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
  x *= svg_xlat
  y *= svg_xlat
  CURRENT_SVG_PATH += ` M ${x} ${y}`
}

function svgLine(x, y) {
  x *= svg_xlat
  y *= svg_xlat
  CURRENT_SVG_PATH += ` L ${x} ${y}`
}

function endSvgPath() {
  SVG_OUTPUT_STRING += `<path d="${CURRENT_SVG_PATH}" stroke="black" fill-opacity="0" stroke-width="0.2"/>\n`
  CURRENT_SVG_PATH = ''
}

function endSvg() {
  SVG_OUTPUT_STRING += SVG_FOOTER
  save([SVG_OUTPUT_STRING], 'p5-svg.svg')
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  radius = (Math.min(windowWidth, windowHeight) - BORDER * 2) / 2
  for (let i = 0; i < point_count; i++) {
    radii[i] = 1 // radius * (i / point_count)
  }
  //frameRate(1)

  svg_xlat = (Math.min(SVG_WIDTH, SVG_HEIGHT) * SVG_MM) / Math.min(windowWidth, windowHeight)
}

function interpolateNewRadius(start, count) {
  let goal_r = radii[start]

  let abs_count = abs(count)

  for (let i = 0; i < abs_count; i++) {
    var idx
    if (count < 0) {
      idx = getIndexWithOffset(start, -i)
    } else {
      idx = getIndexWithOffset(start, i)
    }
    let current = radii[idx]
    xybefore = getPoint(idx)

    let fraction = ((abs_count - i) / abs_count)

    radii[idx] = lerp(current, goal_r, fraction)
    xyafter = getPoint(idx)

    if (DEBUG_OUTPUT) {
      stroke(0)
      strokeWeight(0.1)
      line(xybefore[0], xybefore[1], xyafter[0], xyafter[1])
    }
  }
}

function getPoint(i, multiplier=1) {
  let t = i / point_count * Math.PI * 2 + Math.PI / 2
  let r = radii[i]
  let offset = radius + BORDER
  let x = cos(t) * r * multiplier + offset
  let y = sin(t) * r * multiplier + offset

  return [x,y]
}

function getIndexWithOffset(start, offset) {
  let idx = start + offset

  if (idx < 0) {
    idx = point_count + idx
  } else {
    idx = idx % point_count
  }

  return idx
}

var max_r = 0

function breakCircle(start, count, depth=0) {
  start = start % point_count

  //let midpoint = getIndexWithOffset(start, Math.floor(Math.random() * count / 2))
  let midpoint = getIndexWithOffset(start, Math.floor(count / 2))

  var delta = 1 / point_count * radii[midpoint] / RANDOM_RADIUS_DIVISOR
  radii[midpoint] += Math.random() * delta - delta * 2/3

  max_r = Math.max(Math.abs(radii[midpoint]), max_r)

  if (DEBUG_OUTPUT && depth == MAX_DEPTH) {
    var xy = getPoint(midpoint)
    strokeWeight(5)
    stroke('red')
    point(xy[0], xy[1])

    xy = getPoint(start)
    strokeWeight(5)
    stroke('green')
    point(xy[0], xy[1])
  }

  let new_count = Math.floor(count / 2)
  interpolateNewRadius(midpoint, 2)
  interpolateNewRadius(midpoint, -2)
  //interpolateNewRadius(midpoint, point_count / 32)
  //interpolateNewRadius(midpoint, -point_count / 32)

  if (depth < MAX_DEPTH) {
    breakCircle(midpoint, new_count, depth + 1)
    breakCircle(midpoint, -new_count, depth + 1)
  }
}

let start_point = 0
function draw() {
  beginSvg()
  fill(255, 255, 255, 32)
  rect(0, 0, windowWidth, windowHeight)

  noFill()
  start_point = (start_point + 1) % point_count
  for (let m = 0; m < LAYERS; m++) {
    //start_point = Math.floor(Math.random() * point_count)
    max_r = 0
    breakCircle(start_point, point_count)
    stroke(0)
    strokeWeight(0.1)
    beginShape()
    beginSvgPath()
    for (let i = 0; i < point_count; i++) {
      var factor = 1
      if (SHOULD_EXPAND) {
        factor = (m + 1) / LAYERS
      }
      let xy = getPoint(i, factor * radius / max_r)
      let x = xy[0]
      let y = xy[1]
      if (i == 0) {
        svgMove(x, y)
      } else {
        svgLine(x, y)
      }
      vertex(x,y)
    }
    endSvgPath()
    endShape(CLOSE)
  }
  if (!SHOULD_LOOP)
    noLoop()
  endSvg()
}