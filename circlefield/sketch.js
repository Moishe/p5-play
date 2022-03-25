
let POINT_COUNT = 128
let BORDER = 40
let LAYERS = 200
let SHOULD_LOOP = false
let MIN_GAP = 1

let SVG_OUTPUT = true

let SVG_MM = 3.543307

let SVG_WIDTH = 210
let SVG_HEIGHT = 290

let SVG_HEADER = `<svg width="${SVG_WIDTH}mm" height="${SVG_HEIGHT}mm" xmlns="http://www.w3.org/2000/svg">\n`
let SVG_FOOTER = '</svg>\n'

let SVG_OUTPUT_STRING = ''

let CURRENT_SVG_PATH = ''

let points = []

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

function initializeCircle() {
  // so we're gonna treat the slice as a 2d array. We mutate this
  // array of x,y points and then wrap it into a circle

  points = []
  for (let i = 0; i < LAYERS; i++) {
    points[i] = []
    for (let j = 0; j < POINT_COUNT; j++) {
      points[i][j] = i * radius / LAYERS
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  radius = (Math.min(windowWidth, windowHeight) - BORDER * 2) / 2

  svg_xlat = (Math.min(SVG_WIDTH, SVG_HEIGHT) * SVG_MM) / Math.min(windowWidth, windowHeight)

  initializeCircle()
}

function randomizeCircle() {
  console.log("Starting randomizeCircle")
  for (let x = 0; x < POINT_COUNT; x++) {
    for (let y = 0; y < LAYERS; y++) {
      let delta = radius / LAYERS * Math.random() * (y / LAYERS)

      for (let xx = -5; xx <= 5; xx++) {
        var dx
        if (x + xx < 0) {
          dx = POINT_COUNT + x + xx
        } else {
          dx = (x + xx) % POINT_COUNT
        }
        for (let dy = max(0, y - 5); dy <= min(LAYERS - 1, y + 6); dy++) {
          var amt = 1
          if (dx != x || dy != y) {
            amt = sqrt(xx ** 2 + (y - dy) ** 2)
          }

          let innerPoint = dy > 0 ? points[dy - 1][dx] : 1
          points[dy][dx] = max(points[dy][dx] + delta / amt, innerPoint + MIN_GAP)
        }
      }
    }
  }
  console.log("Done with randomizeCircle")
}

function draw() {
  beginSvg()
  fill(255, 255, 255, 32)
  rect(0, 0, windowWidth, windowHeight)

  noFill()

  randomizeCircle()

  for (let i = 0; i < LAYERS; i++) {
    beginShape()
    for (let j = 0; j < POINT_COUNT; j++) {
      let t = j / POINT_COUNT * Math.PI * 2
      let r = points[i][j]
      let offset = radius + BORDER
      let x = cos(t) * r + offset
      let y = sin(t) * r + offset

      vertex(x, y)
    }
    endShape(CLOSE)
  }

  if (!SHOULD_LOOP)
    noLoop()
}