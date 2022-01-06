let save_animation = false
let animation_frames = 240

let fade_speed = 0

let c
let capturer

let grid = []
let field_width = 300
let field_height = 300

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
      var normal_x = (x / field_width) - 0.25
      var normal_y = (y / field_height) - 0.25
      var direction = sin(sqrt(normal_x * normal_x + normal_y * normal_y) * PI * 2 * 3)

      let screen_x = x * (width / field_width)
      let screen_y = y * (height / field_height)
      let clr = img.get(screen_x, screen_y)
      direction = createVector(clr[0] + clr[1] - 256, clr[1] + clr[2] - 256).heading()
      set_grid(x, y, direction)
    }
  }
}

let img;
function preload() {
  img = loadImage('../assets/flowers.jpg');
}

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
  offset = -0.5
  fill_grid()
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

function draw_line(x, y, step_length, steps, c, s) {
  for (var i = 0; i < steps; i++) {
    direction = screen_xy_to_grid_direction(x, y)
    let x2 = x + cos(direction) * step_length
    let y2 = y + sin(direction) * step_length

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

  //background(255)
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

      //set_grid(x, y, direction + 0.1)
    }
  }

  stroke(0)
  for (var i = 0; i < 1000; i++) {
    let idx = (frame * 1000 + i) * 10
    let screen_x = (idx + frame) % width
    let screen_y = Math.floor(idx / width)
    let clr = img.get(screen_x, screen_y)
    stroke(clr[0], clr[1], clr[2], 64)
    draw_line(screen_x, screen_y, 1, createVector(clr[0], clr[1], clr[2]).mag())  
  }
/*
  x_res = 10
  y_res = 10
  for (x = 0; x < x_res; x++) {
    for (y = 0; y < y_res; y++) {
      let screen_x = Math.floor(x * width / x_res)
      let screen_y = Math.floor(y * height / y_res)
      screen_x = Math.random() * width
      screen_y = Math.random() * height
      let clr = img.get(screen_x, screen_y)
      stroke(clr[0], clr[1], clr[2], 16)
      draw_line(screen_x, screen_y, 2, createVector(clr[0], clr[1], clr[2]).mag() / 4)
    }
  }
*/
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