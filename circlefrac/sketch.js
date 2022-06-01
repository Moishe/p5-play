let RECURSION_DEPTH = 9
let POINT_COUNT = 2 ** RECURSION_DEPTH
let BORDER = 40
let LAYERS = 200
let MAX_DEPTH = RECURSION_DEPTH
let RANDOM_RADIUS_DIVISOR = 8
let SHOULD_LOOP = false
let SHOULD_EXPAND = true
let SHOULD_INTERPOLATE = true
let INTERPOLATE_DIVISOR = 1

let DEBUG_OUTPUT = false

let SVG_OUTPUT = true

let SVG_MM = 3.543307

let SVG_WIDTH = 210
let SVG_HEIGHT = 290

let SVG_HEADER = `<svg width="${SVG_WIDTH}mm" height="${SVG_HEIGHT}mm" xmlns="http://www.w3.org/2000/svg">\n`
let SVG_FOOTER = '</svg>\n'

let SVG_OUTPUT_STRING = ''

let CURRENT_SVG_PATH = ''

let radii = []
var radius = 256

var svg_xlat

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
  //save([SVG_OUTPUT_STRING], 'p5-svg.svg')
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  radius = (Math.min(windowWidth, windowHeight) - BORDER * 2) / 2
  for (let i = 0; i < POINT_COUNT; i++) {
    if (DEBUG_OUTPUT) {
      radii[i] = radius
    } else {
      radii[i] = 1
    }
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
    let xybefore = getPoint(idx)

    let fraction = ((abs_count - i) / abs_count)

    radii[idx] = lerp(current, goal_r, fraction)
    let xyafter = getPoint(idx)

    if (DEBUG_OUTPUT) {
      stroke(0)
      strokeWeight(0.1)
      line(xybefore[0], xybefore[1], xyafter[0], xyafter[1])
    }
  }
}

function getPoint(i, multiplier=1) {
  let t = i / POINT_COUNT * Math.PI * 2 + Math.PI / 2
  let r = radii[i]
  let offset = radius + BORDER
  let x = cos(t) * r * multiplier + offset
  let y = sin(t) * r * multiplier + offset

  return [x,y]
}

function getIndexWithOffset(start, offset) {
  let idx = start + offset

  if (idx < 0) {
    idx = POINT_COUNT + idx
  } else {
    idx = idx % POINT_COUNT
  }

  return idx
}

var max_r = 0

function breakCircle(start, count, depth=0) {
  start = start % POINT_COUNT
  let new_count = Math.floor(count / 2) + 1

  //let midpoint = getIndexWithOffset(start, Math.floor(Math.random() * count / 2))
  let midpoint = getIndexWithOffset(start, Math.floor(count / 2))

  //var delta = 1 / point_count * radii[midpoint] / RANDOM_RADIUS_DIVISOR
  var start_radius = (radii[getIndexWithOffset(start, 0)] + radii[getIndexWithOffset(start, count * 2)]) / 2
  var delta = (start_radius / RANDOM_RADIUS_DIVISOR)// / (depth + 1) * ((depth % 2) * 2 - 1)
  delta = Math.random() * 10
  radii[midpoint] = radii[midpoint] + delta - delta * 0.5

  max_r = Math.max(Math.abs(radii[midpoint]), max_r)

  if (DEBUG_OUTPUT && depth == MAX_DEPTH) {
    strokeWeight(5)

    var xy = getPoint(midpoint)
    stroke('red')
    point(xy[0], xy[1])

    xy = getPoint(start)
    stroke('green')
    //point(xy[0], xy[1])

    xy = getPoint(getIndexWithOffset(midpoint, new_count))
    stroke('blue')
    point(xy[0], xy[1])

    xy = getPoint(getIndexWithOffset(midpoint, -new_count))
    stroke('blue')
    point(xy[0], xy[1])
  }

  if (SHOULD_INTERPOLATE) {
    interpolateNewRadius(midpoint, new_count / INTERPOLATE_DIVISOR)
    interpolateNewRadius(midpoint, -new_count / INTERPOLATE_DIVISOR)
  }

  if (depth < MAX_DEPTH) {
    breakCircle(midpoint, new_count, depth + 1)
    breakCircle(midpoint, -new_count, depth + 1)
  }
}

function randomizeCircle() {
}

var start_point = 0
var max_depth = 0
function draw() {
  beginSvg()
  fill(255, 255, 255, 32)
  rect(0, 0, windowWidth, windowHeight)

  noFill()
  start_point = (start_point + 1) % POINT_COUNT
  for (let m = 0; m < LAYERS; m++) {
    //start_point = Math.floor(Math.random() * point_count)
    max_r = 0
    prev_radii = [...radii]
    breakCircle(0, POINT_COUNT)

    stroke(0)
    strokeWeight(0.1)
    beginShape()
    beginSvgPath()
    for (let i = 0; i < POINT_COUNT; i++) {
      var factor = 1
      if (SHOULD_EXPAND) {
        factor = (m + 1) / LAYERS
      }
      var xy
      if (DEBUG_OUTPUT) {
        xy = getPoint(i, factor)
      } else {
        xy = getPoint(i, factor * radius / max_r)
      }
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