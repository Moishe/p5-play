export const name = 'contours'

let SAVE_SVG = false

let SVG_MM = 3.543307

let SVG_WIDTH = 210
let SVG_HEIGHT = 290

let SVG_HEADER = `<svg width="${SVG_WIDTH}mm" height="${SVG_HEIGHT}mm" xmlns="http://www.w3.org/2000/svg">\n`
let SVG_FOOTER = '</svg>\n'

let SVG_OUTPUT_STRING = ''

let CURRENT_SVG_PATH = ''

var svg_xlat

import {contours} from "https://cdn.skypack.dev/d3-contour@3";

const c = contours(values);

let map = []
let WIDTH = 100
let HEIGHT = 100

function setMap(x, y, val) {
  let idx = x + y * WIDTH
  map[idx] = val
}

function pullUp(x, y, d) {
  let r = 0
  do {
    d *= 1 / (r + 1)
    let points = Set()
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
      let xx = Math.round(cos(t) * r + x)
      let yy = Math.round(sin(t) * r + y)
      let idx = xx + yy * WIDTH
      points.add(idx)
    }

  } while d > 0
}

function initializeMap() {
  for (let idx = 0; idx < WIDTH * HEIGHT; idx++) {
    map.push(0)
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  radius = (Math.min(windowWidth, windowHeight) - BORDER * 2) / 2

  svg_xlat = (Math.min(SVG_WIDTH, SVG_HEIGHT) * SVG_MM) / Math.min(windowWidth, windowHeight)

  initializeMap()
}


function draw() {
  fill(255, 255, 255, 32)
  rect(0, 0, windowWidth, windowHeight)

  noFill()

  noLoop()
}