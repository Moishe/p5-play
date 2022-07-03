const MAX_ACTOR_COUNT = 1024
const INITIAL_ACTOR_COUNT = 1
const ACTOR_LOCATIONS = [
  [0.5, 0.5]
]
const DIRECTION_RESOLUTION = 8
const BOARD_SIZE = 128

// globals which can be changed by the user
var randomization_freq = 0.5
var visible_size = 16
var focus_idx = 0
var single_step = true

// globals which are computed for each render
var scale
var x_offset
var y_offset

// globals representing the actors & field
var actors = []
var board = []

function xy_to_idx(x, y) {
  return x + y * BOARD_SIZE
}

function idx_to_xy(idx) {
  return [idx % BOARD_SIZE, Math.floor(y / BOARD_SIZE)]
}

function set_board_value(x, y, val) {
  var idx = xy_to_idx(x, y)
  board[idx] = val
}

function inc_board_value(x, y) {
  var idx = xy_to_idx(x, y)
  board[idx] += 0.01
}

function get_board_value(x, y) {
  var idx = xy_to_idx(x, y)
  return board[idx]
}

function create_actor(loc) {
  actor = {
    x: Math.floor(BOARD_SIZE * loc[0]),
    y: Math.floor(BOARD_SIZE * loc[1]),
    direction: 0,
    id: actors.length
  }
  return actor
}

function setup() {
  createCanvas(800, 800);

  for (var i = 0; i < INITIAL_ACTOR_COUNT; i++) {
    var actor_location = ACTOR_LOCATIONS[i % ACTOR_LOCATIONS.length]
    var actor = create_actor(actor_location)
    actors.push(actor)
  }

  for (var x = 0; x < BOARD_SIZE; x++) {
    for (var y = 0; y < BOARD_SIZE; y++) {
      board.push(noise(x / 10, y / 10))
    }
  }
}

function draw_location(x, y) {
  stroke(0)
  strokeWeight(0)
  fill(get_board_value(x,y) * 255)
  rect(x * scale, y * scale, scale - 1, scale - 1)
}

function draw_board() {
  for (var x = 0; x < BOARD_SIZE; x++) {
    for (var y = 0; y < BOARD_SIZE; y++) {
      draw_location(x,y)
    }
  }
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 3;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

function draw_actors() {
  actors.forEach(actor => {
    stroke('red')
    strokeWeight(1)
    noFill()
    rect(actor.x * scale,
         actor.y * scale,
         scale - 1,
         scale - 1)

    let v1 = createVector(
      actor.x * scale + scale / 2,
      actor.y * scale + scale / 2)
    let size = Math.sqrt((scale / 2) * (scale / 2) * 2)
    let v2 = createVector(
      size,
      0)
    v2.setHeading(rad_from_dir(actor.direction))
    drawArrow(v1, v2, 'red')
  })
}

function rad_from_dir(dir) {
  return dir * ((Math.PI * 2) / DIRECTION_RESOLUTION)
}

function process_actors() {
  actors.forEach(actor => {
    var x = actor.x + 0.5
    var y = actor.y + 0.5

    var new_dir = actor.direction
    var new_x = actor.x
    var new_y = actor.y
    var brightest = 0
    for (var i = -1; i <= 1; i++) {
      var look_d = actor.direction + i
      var look_x = Math.floor(x + cos(rad_from_dir(look_d)) * sqrt(2))
      var look_y = Math.floor(y + sin(rad_from_dir(look_d)) * sqrt(2))

      if (look_x < 0 || look_x >= BOARD_SIZE ||
          look_y < 0 || look_y >= BOARD_SIZE) {
        continue
      }
      stroke('green')
      strokeWeight(1)
      noFill()
      rect(look_x * scale,
           look_y * scale,
           scale - 1,
           scale - 1)

      var look_v = get_board_value(look_x, look_y)
      if (look_v > brightest) {
        brightest = look_v
        new_dir = look_d
        new_x = look_x
        new_y = look_y
      }
    }

    if (actor.x == new_x && actor.y == new_y) {
      actor.direction += 1
    } else {
      actor.direction = new_dir
      actor.x = new_x
      actor.y = new_y

      if (random() < randomization_freq) {
        actor.direction = floor(random(0, DIRECTION_RESOLUTION))
      }
    }

    inc_board_value(actor.x, actor.y)
  })
}

function add_actor() {
  var seed_actor = actors[actors.length - 1]
  var actor = {
    x: seed_actor.x,
    y: seed_actor.y,
    direction: floor(random(0, DIRECTION_RESOLUTION)),
    id: actors.length
  }
  actors.push(actor)
}

function draw() {
  // set globals
  scale = min(window.width, window.height) / BOARD_SIZE
  var focus_actor = actors[focus_idx]
  x_offset = calc_offset(focus_actor.x)
  y_offset = calc_offset(focus_actor.y)
  y_offset = max(0, focus_actor.y - floor(visible_size / 2))

  background(220);
  draw_board()
  draw_actors()
  process_actors()

  if (single_step) {
    noLoop()
  }
}

function keyPressed() {
  console.log(keyCode)
  if (keyCode == 32) {
    loop()
  } else if (keyCode == 84) { // 't'
    single_step = !single_step
    loop()
  } else if (keyCode == 65) { // 'a'
    add_actor()
  } else if (keyCode == 82) { // 'r'

  } else if (keyCode == 78) { // 'n'

  } else if (keyCode == 73) { // 'i'
    // zoom in
    visible_size = max(5, visible_size - 1)
  } else if (keyCode == 79) { // 'o'
    visible_size = min(BOARD_SIZE, visible_size + 1)
  }
}

