let sparkles = []
let first_free = -1
let total_sparkles = 1000
let initial_sparkles = 250
let initial_speed = 5
let deceleration_rate = 0.98

let draw_force_lines = false

let save_animation = false
let animation_frames = 480

let field_width = 100
let field_height = 100

let capturer

let grid = []

function get_grid(x, y) {
  var idx = x + y * field_width
  return grid[idx]
}

function set_grid(x, y, direction) {
  var idx = x + y * field_width
  grid[idx] = direction
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

function init_flow_field() {
  for (var i = 0; i < field_width * field_height; i++) {
    grid.push(0)
  }

  for (var x = 0; x < field_width; x++) {
    for (var y = 0; y < field_height; y++) {
      let normal_x = (x / field_width) - 0.5
      let normal_y = (y / field_height) - 0.5
      let direction = sin(sqrt(normal_x * normal_x + normal_y * normal_y) * 3) * PI * 2
      direction = direction + noise(x,y) - 0.5
      set_grid(x, y, direction)
    }
  }
}

function create_sparkle(x, y, speed, intensity, direction, life) {
  s = {
    x: x,
    y: y,
    intensity: intensity,
    direction: direction,
    lifespan: life,
    life: 1,
    speed: speed,
    next_free: -1
  }
  sparkles.push(s)
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < total_sparkles; i++) {
    if (i < initial_sparkles) {
      create_sparkle(Math.random() * width, Math.random() * height, // x y
                     initial_speed, // speed
                     Math.random(),         // intensity
                     Math.random() * PI * 2, // direction
                     Math.random() * 255 // lifespan
                    )      
    } else {
      if (i == initial_sparkles) {
        next_free = -1
      } else {
        next_free = i - 1
      }
      sparkles[i] = {
        life: 0,
        next_free: next_free
      }
    }
  }
  
  init_flow_field()
      
  first_free = 999
  background(0)
  
  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }
}

function colorFromLifeAndIntensity(life, intensity) {
  // todo make this a sigmoid
  return [255, 255 - life, 0, Math.floor(intensity * 255)]
}

function draw_sparkle(sparkle) {
  strokeWeight(1)
  c = colorFromLifeAndIntensity(sparkle.life, sparkle.intensity)
  stroke(c[0], c[1], c[2], c[3])
  line(sparkle.prev_x, sparkle.prev_y, sparkle.x, sparkle.y)
}

function maybe_fork_sparkle(sparkle) {
  if (first_free != -1 && Math.random() < 0.2) {
    let free_holder = sparkles[first_free].next_free    
    new_direction = sparkle.direction + (Math.random() - 0.5)
    sparkles[first_free] = {
      x: sparkle.x,
      y: sparkle.y,
      speed: initial_speed,
      direction: new_direction,
      lifespan: Math.random() * 255,
      intensity: 1,
      life: 1,
      next_free: -1
    }
    first_free = free_holder
  }
}

function update_flow_field() {
  let max_distance = sqrt(windowWidth * windowWidth + windowHeight * windowHeight)
  for (let i = 0; i < field_width * field_height; i++) {
    let screen_x = i % field_width * (width / field_width)
    let screen_y = Math.floor(i / field_width) * (height / field_height)
    let screenVector = createVector(10, 0)

    let mouseVector = createVector(mouseX - screen_x, mouseY - screen_y)

    let distance = screenVector.dist(mouseVector)
    let influence = (1 - distance / max_distance)
    let angle_between = screenVector.angleBetween(mouseVector)
    
    let normal_x = screen_x - width / 2
    let normal_y = screen_y - height / 2
    let direction = sin(sqrt(normal_x * normal_x + normal_y * normal_y) / 300) * PI * 2
    direction += millis() / 100
    
    grid[i] = lerp(millis() / 1000, angle_between, influence)
  }    
}

let frame = 0
function draw() {  
  if (frame == 0 && save_animation) {
    capturer.start()      
  }

  fill([0, 0, 0, 32])
  rect(0, 0, width, height)
  
  if (draw_force_lines) {
    stroke(128)
    for (var x = 0; x < field_width; x++) {
      for (var y = 0; y < field_height; y++) {
        x1 = x * (width / field_width)
        y1 = y * (height / field_height)
        direction = get_grid(x, y)
        x2 = x1 + cos(direction) * 15
        y2 = y1 + sin(direction) * 15
  
        strokeWeight(0.5)
        line(x1, y1, x2, y2)
        
        strokeWeight(2)
        point(x1, y1)
      }
    }  
  }
  
  for (let i = 0; i < sparkles.length; i++) {
    if (sparkles[i].life > 0) {
      sparkles[i].prev_x = sparkles[i].x
      sparkles[i].prev_y = sparkles[i].y
      sparkles[i].x += cos(sparkles[i].direction) * sparkles[i].speed
      sparkles[i].y += sin(sparkles[i].direction) * sparkles[i].speed
      sparkles[i].life += 1
      sparkles[i].speed *= deceleration_rate

      draw_sparkle(sparkles[i])

      grid_direction = screen_xy_to_grid_direction(sparkles[i].x, sparkles[i].y)

      sparkles[i].direction = grid_direction //(sparkles[i].direction * 3 + grid_direction) / 4
      
      if (sparkles[i].x > width || sparkles[i].x < 0 || sparkles[i].y > height || sparkles[i].y < 0) {
        sparkles[i].x = Math.random() * width
        sparkles[i].y = Math.random() * height
      }
      
      let dead = sparkles[i].life > sparkles[i].lifespan || sparkles.speed <= 0
      if (dead) {
        sparkles[i].life = 0
        sparkles[i].next_free = first_free
        first_free = i
      } else {
        maybe_fork_sparkle(sparkles[i])        
      }
    }
  }
  
  update_flow_field()

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