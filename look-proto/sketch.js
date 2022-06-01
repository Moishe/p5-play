var direction = 0
var distance = 50
var speed = 1

var x
var y

var look_filter

var slice_width
var slice_count
var perception_angle

const sigmoid = (x) => {
  return Math.exp(x) / (Math.exp(x) + 1)
};

function environment(x,y) {
  //return noise(x/100,y/100)
  return (cos(sqrt(x * x + y * y) / 5) + 1) / 2
}

function sliceIdxToDirection(idx) {
  let absdirection = floor(idx / 2) * slice_width
  if ((idx % 2) == 1) {
    return -absdirection
  } else {
    return absdirection
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  x = 0
  y = 0

  slice_width = PI / 16
  slice_count = (PI * 2) / slice_width
  perception_angle = PI / 4

  look_filter = []

  let debug_output = []
  for (let lx = -distance; lx <= distance; lx++) {
    let cur_debug_str = ''
    for (let ly = -distance; ly <= distance; ly++) {
      let r = sqrt(lx * lx + ly * ly)
      if (r < distance) {
        let t = atan2(ly, lx)
        let delta = abs(t)
        let slice = 0
        if (delta < perception_angle) {
          slice = floor(delta / slice_width) * 2
          if (t < 0) {
            slice += 1
          }

          let angle_weight = 1 //pow(1 - (delta / PI), 1.01)
          let radius_weight = 1 //pow(1 - r / distance, 1.1)
          look_filter.push(
            {
              'slice': slice,
              'x': lx,
              'y': ly,
              't': t,
              'r': r,
              'angle_weight': angle_weight,
              'radius_weight': radius_weight
            }
          )
          cur_debug_str += ' ' + t.toFixed(2) + ',' + slice
        } else {
          cur_debug_str += ' ' + t.toFixed(2) + ',-'
        }

      } else {
        cur_debug_str += ' ----,-'
      }
    }
    debug_output.push(cur_debug_str)
  }
  //console.log(debug_output)
}

function draw() {
  background(255);
  strokeWeight(2)

  let slice_values = []
  for (let i = 0; i < slice_count; i++) {
    slice_values[i] = [0, i]
  }

  look_filter.forEach(el => {
    let c = (el.slice / slice_count) * 255
    stroke(c)

    let newx = el.x * cos(direction) - el.y * sin(direction)
    let newy = el.x * sin(direction) + el.y * cos(direction)

    let cx = window.width / 4 + newx
    let cy = window.height / 4 + newy

    let environmentx = x + newx
    let environmenty = y + newy
    let env_value = environment(environmentx, environmenty)

    point(cx, cy)

    let weighted_value = el.angle_weight * el.radius_weight * env_value * 255
    stroke(weighted_value)
    point(cx + distance * 3, cy)

    slice_values[el.slice][0] += weighted_value

    stroke(env_value * 255)
    point(cx, cy + distance * 3)

    stroke(weighted_value)
    point(el.x + window.width / 4 + distance * 3, el.y + window.height / 4 + distance * 3)
  })

  stroke('red')
  let direction_line_x = windowWidth / 4 + cos(direction) * distance
  let direction_line_y = windowHeight / 4 + sin(direction) * distance
  line(windowWidth / 4, windowHeight / 4,
       direction_line_x, direction_line_y)

  x += cos(direction) * speed
  y += sin(direction) * speed

  let max_slice_value = 0
  let slice_direction = 0
  let max_slice_direction = 0
  slice_values.sort((a, b) => (a[0] - b[0]))

  max_slice_direction = sliceIdxToDirection(slice_values[slice_values.length - 1][1])
  if (abs(max_slice_direction) > 0) {
    //debugger
  }
  stroke('green')
  let bright_line_x = windowWidth / 4 + cos(direction + max_slice_direction) * distance + distance * 3
  let bright_line_y = windowHeight / 4 + sin(direction + max_slice_direction) * distance
  line(windowWidth / 4 + distance * 3, windowHeight / 4,
       bright_line_x, bright_line_y)

  let s = direction + "\n" + max_slice_direction + "\n"

  direction += max_slice_direction / 5
  direction = direction % (PI * 2)

  text(s, width / 4, height / 8)

  //noLoop()
}