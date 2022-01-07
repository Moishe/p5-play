let save_animation = false
let animation_frames = 240

let fade_speed = 0

let c
let capturer

let grid = []
let brightness_map = []
let field_width = 512
let field_height = 512

let draw_random = false
let draw_force_lines = false
let draw_progressive = false
let draw_grid = false
let draw_rectangle = true

function set_grid(x, y, direction) {
  var idx = x + y * field_width
  grid[idx] = direction
}

function get_grid(x, y) {
  var idx = x + y * field_width
  return grid[idx]
}

function fill_grid() {
  for (var x = 0; x < field_width; x++) {
    for (var y = 0; y < field_height; y++) {
      let normal_x = (x / field_width) - 0.25
      let normal_y = (y / field_height) - 0.25
      let direction = sin(sqrt(normal_x * normal_x + normal_y * normal_y) * PI * 2 * 3)


      let screen_x = x * (width / field_width)
      let screen_y = y * (height / field_height)
      let clr = img.get(screen_x, screen_y)
      let clr_vector = createVector(clr[0], clr[1], clr[2])
      let float_mag = clr_vector.mag() / createVector(255, 255, 255).mag()
      direction = float_mag * PI * 2 + PI
      let direction_noise = (noise(x, y) - 0.5) * PI * 2

      // the brighter the position, the less the noise matters
      let noise_contribution = 0 //(1 - float_mag) * 0.2
      direction = direction * float_mag + direction_noise * noise_contribution

      set_grid(x, y, direction)

      color_magnitude = clr_vector.mag()
      brightness_map[x + y * field_width] = [color_magnitude, screen_x, screen_y]      
    }
  }
  brightness_map.sort(function(a, b) {
    return b[0] - a[0]
  })
}

let img;
function preload() {
  img = loadImage('../assets/sawhill-storm.png');
}

let red
let green
let blue
let yellow
let cyan
let magenta
let black
let rgby = []

function setup() {
  c = createCanvas(img.width, img.height)

  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }

  // set the grid directions all to zero
  for (var i = 0; i < field_width * field_height; i++) {
    grid.push(0)
  }

  // then let's do something a little more interesting
  fill_grid()

  red = createVector(255, 0, 0)
  green = createVector(0, 255, 0)
  blue = createVector(0, 0, 255)
  yellow = createVector(255, 255, 0)
  cyan = createVector(0, 255, 255)
  magenta = createVector(255, 0, 255)
  black = createVector(0, 0, 0)

  let rgby_local = [red, green, blue, yellow, cyan, magenta/*, black*/]
  for (i = 0; i < rgby_local.length; i++) {
    rgby.push([rgby_local[i], [rgby_local[i].x, rgby_local[i].y, rgby_local[i].z]])
  }
}

function screen_xy_to_grid_xy(x, y) {
  x_ratio = (width / field_width)
  y_ratio = (height / field_height)

  grid_x = Math.floor(x / x_ratio)
  grid_y = Math.floor(y / y_ratio)
  
  return {
    x: grid_x,
    y: grid_y
  }
}

function screen_xy_to_grid_direction(x, y) {
  let gxy = screen_xy_to_grid_xy(x, y)
  let grid_x = gxy.x
  let grid_y = gxy.y

  if (grid_x >= 0 && grid_y >= 0 && grid_x < field_width && grid_y < field_height) {
    return get_grid(grid_x, grid_y)
  } else {
    return 0
  }
}
function color_to_palette(r, g, b) {
  return [r, g, b]
  let color_vector = createVector(r, g, b)

  let smallest_distance = 32768
  color = false
  for (var i = 0; i < rgby.length; i++) {
    var distance = color_vector.dist(rgby[i][0])
    if (distance < smallest_distance) {
      smallest_distance = distance
      color = rgby[i][1]
    }
  }

  return color
}

function draw_line(x, y, step_length, steps, c, s) {
  //direction = screen_xy_to_grid_direction(x, y)
  let new_c = color_to_palette(c[0], c[1], c[2])
  if (!new_c) {
    return
  }

  for (var i = 0; i < steps; i++) {
    let direction = screen_xy_to_grid_direction(x, y)
    //direction = (direction * 9 + screen_xy_to_grid_direction(x, y)) / 10
    let x2 = x + cos(direction) * step_length
    let y2 = y + sin(direction) * step_length

    stroke(new_c[0], new_c[1], new_c[2], c[3])
    /*
    c[3] -= 0.25
    if (c[3] <= 0) {
      return
    }
    */
    strokeWeight(s)

    line(x, y, x2, y2)

    x = x2
    y = y2
  }
}

let frame = 0

function draw() {
  if (frame == 0 && save_animation) {
    capturer.start()      
  }

  if (fade_speed) {
    fill(255, 255, 255, fade_speed)
    rect(0, 0, width, height)  
  }

  if (draw_force_lines) {
    stroke(230)
    for (var x = 0; x < field_width; x++) {
      for (var y = 0; y < field_height; y++) {
        x1 = x * (width / field_width)
        y1 = y * (height / field_height)
        direction = get_grid(x, y)
        x2 = x1 + cos(direction) * 15
        y2 = y1 + sin(direction) * 15
  
        let clr = img.get(x1, y1)
        stroke(clr[0], clr[1], clr[2], 16)
  
        line(x1, y1, x2, y2)
      }
    }  
  }

  if (draw_progressive) {
    for (var i = 0; i < 1000; i++) {
      let idx = (frame * 1000 + i)
      let screen_x = (idx + frame) % width
      let screen_y = Math.floor(idx / width)
      let clr = img.get(screen_x, screen_y)
      draw_line(screen_x, screen_y, 1, 25, [clr[0], clr[1], clr[2], 16], 1)
    }  
  }

  if (draw_grid) {
    x_res = 100
    y_res = 100
    for (x = 0; x < x_res; x++) {
      for (y = 0; y < y_res; y++) {
        let screen_x = Math.floor(x * width / x_res)
        let screen_y = Math.floor(y * height / y_res)
        let clr = img.get(screen_x, screen_y)
        let color_vector = createVector(clr[0], clr[1], clr[2])
        draw_line(screen_x, screen_y, 1, 15, [clr[0], clr[1], clr[2], color_vector.mag() / 4], 1)
      }
    }  
  }

  if (draw_random) {
    for (var i = 0; i < 1000; i++) {
      let idx = Math.floor(Math.random() * brightness_map.length) //(i + frame * 1000) % brightness_map.length
      let screen_x = brightness_map[idx][1]
      let screen_y = brightness_map[idx][2]
      let clr = img.get(screen_x, screen_y)
      let clr_vector = createVector(clr[0], clr[1], clr[2])
      draw_line(screen_x, screen_y, 1, clr_vector.mag() * 5, [clr[0], clr[1], clr[2], clr_vector.mag()], 1)
    }  
  }

  if (draw_rectangle) {
    let x = frame
    let clr = img.get(x, 0)
    let color_vector = createVector(clr[0], clr[1], clr[2])
    draw_line(x, 0, 1, height, [clr[0], clr[1], clr[2], color_vector.mag() / 4], 1)

    let y = frame
    clr = img.get(0, y)
    color_vector = createVector(clr[0], clr[1], clr[2])
    draw_line(0, y, 1, width, [clr[0], clr[1], clr[2], color_vector.mag() / 4], 1)
  }

  if (frame == animation_frames && save_animation) {
    noLoop()
    capturer.stop()
    capturer.save()
  }

  if (save_animation) {
    capturer.capture(document.getElementById('defaultCanvas0'));    
  }
  
  frame += 1
}