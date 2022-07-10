const INITIAL_ACTOR_COUNT = 1
const ACTOR_LOCATIONS = [
  [0.5, 0.5]
]
const BOARD_SIZE = 512
const VISIBLE_BUFFER = 2
const MAX_ZOOM = 32
const MIN_FATBITS = 32

// globals which can be changed by the user

/* format of this is:
  * 'name': [
  *   current value
  *   key to modify
  *   function to call with current param value, will return new value
  * ]
  */

var parameters = {
  randomization_amt: [0.1, 'r', (param) => inc_param(param, 0.01, 0, 100, 100)],
  add_actor: [1, 'a', add_actor],
  visible_size: [MAX_ZOOM, 'i', (param) => exp_param(param, 1.5, MAX_ZOOM, BOARD_SIZE)],
  single_step: [true, 't', toggle_param],
  fast_mode: [false, 'f', (param) => { background(0); return toggle_param(param) }],
  look_distance: [3, 'd', (param) => inc_param(param, 1, 0, 25)],
  look_radians: [Math.PI / 2, 'v', (param) => inc_param(param, 0.1, 0, Math.PI * 2)],
  look_resolution: [3, 's', (param) => inc_param(param, 2, 3, 15)],
  trail_strength: [0.1, 'g', (param) => inc_param(param, 0.01, 0.01, 1)],
  clear_board: ['-', 'c', () => { background(0); initialize_board() }],
  reset_board: ['-', 'x', () => { create_initial_actors(); parameters['add_actor'][0] = 1; background(0); initialize_board() }],
  zoom_all_in: ['-', '0', () => { zoom_direction = 0.9 }],
  zoom_all_out: ['-', '1', () => { zoom_direction = 1.1 }],
  use_noise: [false, 'n', toggle_param, true],
}

// temporary to get things running
var focus_idx = 0
var zoom_amt = MAX_ZOOM

var zoom_direction = 0

// globals which are computed for each render
var scale
var x_offset
var y_offset

// globals representing the actors & field
var actors = []
var board = []

function inc_param(value, amt, min_val, max_val, round) {
  if (keyIsDown(SHIFT)) {
    amt = -amt
  }
  if (round) {
    value = floor((value + amt) * round) / round
  } else {
    value = value + amt
  }
  return max(min_val, min(max_val, value))
}

function exp_param(value, amt, min_val, max_val) {
  if (keyIsDown(SHIFT)) {
    amt = 1 / amt
  }
  return min(max_val, max(min_val, floor(value * amt)))
}

function toggle_param(value) {
  return !value
}

function get_parameter_value(name) {
  return parameters[name][0]
}

function set_parameter_value(name, value) {
  parameters[name][0] = value
}

function modify_parameter_value(name) {
  let param = parameters[name]
  new_value = param[2](param[0])
}

function xy_to_idx(x, y) {
  return floor(x) + floor(y) * BOARD_SIZE
}

function idx_to_xy(idx) {
  return [idx % BOARD_SIZE, Math.floor(y / BOARD_SIZE)]
}

function set_board_value(x, y, val) {
  if (val >= 255) {
    val = 0
  }
  var idx = xy_to_idx(x, y)
  board[idx] = val
}

function inc_board_value(x, y) {
  var idx = xy_to_idx(x, y)
  board[idx] = min(1, board[idx] + get_parameter_value('trail_strength'))
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

function add_parameter_ui() {
  let html = '<div>'
  for (const [label, param] of Object.entries(parameters)) {
    if (param[3] !== true) {
      html += `<div class="infofield">
                <div class="label">${label}</div>
                <div class="shortcut" id="sc_${label}"></div>
                <div class="data" id="${label}"></div>
              </div>`
    }
  }
  html += '</div>'
  select('#info').html(html)
}

function show_data() {
  for (const [label, param] of Object.entries(parameters)) {
    if (param[3] !== true) {
      select('#' + label).html(param[0])
      select('#sc_' + label).html(param[1])
    }
  }
}

function initialize_board() {
  board = []
  for (var x = 0; x < BOARD_SIZE; x++) {
    for (var y = 0; y < BOARD_SIZE; y++) {
      if (get_parameter_value('use_noise')) {
        board.push(noise(x / 10, y / 10) * 0.3)
      } else {
        board.push(0)
      }
    }
  }
}

function create_initial_actors() {
  actors = []
  for (var i = 0; i < INITIAL_ACTOR_COUNT; i++) {
    var actor_location = ACTOR_LOCATIONS[i % ACTOR_LOCATIONS.length]
    var actor = create_actor(actor_location)
    actors.push(actor)
  }
}

function setup() {
  let cnv = createCanvas(512, 512);
  cnv.parent('board')

  create_initial_actors()

  initialize_board()
  add_parameter_ui()
  show_data()
}

function rect_offset(x, y) {
  x -= x_offset
  y -= y_offset
  var size
  rect(floor(x) * scale, floor(y) * scale, scale, scale)
}

function draw_location(x, y) {
  if (x >= x_offset &&
    y >= y_offset) {
    var val = get_board_value(x, y)
    if (val > 0) {
      noStroke()
      if (val < 1) {
        fill(val * 255)
      } else {
        fill('yellow')
      }
      rect_offset(x, y)
    }
  }
}

function draw_outline(x, y, s, sw, c) {
  if (x >= x_offset &&
    y >= y_offset) {
  }
}

function draw_board() {
  for (var x = 0; x < get_parameter_value('visible_size'); x++) {
    for (var y = 0; y < get_parameter_value('visible_size'); y++) {
      draw_location(x + x_offset, y + y_offset)
    }
  }
}

function fade_board() {
  var new_board = []
  for (var i = 0; i < board.length; i++) {
    new_board[i] = max(0, board[i] - fade_amt)
  }

  board = new_board
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
    rect_offset(actor.x, actor.y)

    let v1 = createVector(
      (floor(actor.x) - x_offset) * scale + scale / 2,
      (floor(actor.y) - y_offset) * scale + scale / 2)
    let size = scale * get_parameter_value('look_distance') / sqrt(2)
    let v2 = createVector(
      size,
      0)
    v2.setHeading(actor.direction)
    draw_location(floor(actor.x), floor(actor.y))
    drawArrow(v1, v2, 'red')
  })
}

function process_actors(fast = false) {
  actors.forEach(actor => {
    inc_board_value(floor(actor.x), floor(actor.y))

    if (get_parameter_value('fast_mode')) {
      draw_location(floor(actor.x), floor(actor.y))
    }

    var x = actor.x
    var y = actor.y

    if (get_parameter_value('look_distance')) {
      var new_dir = actor.direction
      var brightest = 0

      for (var i = 0; i < get_parameter_value('look_resolution'); i++) {
        var look_offset = (i / (get_parameter_value('look_resolution') - 1)) * get_parameter_value('look_radians') - (get_parameter_value('look_radians') / 2)
        var look_d = actor.direction + look_offset
        var look_x = round(x + cos(look_d) * get_parameter_value('look_distance'))
        var look_y = round(y + sin(look_d) * get_parameter_value('look_distance'))

        if (look_x < 0 || look_x >= BOARD_SIZE ||
          look_y < 0 || look_y >= BOARD_SIZE) {
          continue
        }

        if (!fast) {
          stroke('green')
          strokeWeight(0.1 * scale)
          noFill()
          rect_offset(look_x, look_y)
        }

        var look_v = get_board_value(look_x, look_y)
        if (look_v > brightest && look_v < 1) {
          brightest = look_v
          new_dir = look_d
        }
      }

      actor.direction = new_dir
    }

    actor.x = max(0, min(BOARD_SIZE - 1, actor.x + cos(actor.direction)))
    actor.y = max(0, min(BOARD_SIZE - 1, actor.y + sin(actor.direction)))

    if (actor.x == 0 || actor.x == BOARD_SIZE - 1 || actor.y == 0 || actor.y == BOARD_SIZE - 1) {
      actor.direction += Math.PI
    }

    actor.direction += random(get_parameter_value('randomization_amt')) - get_parameter_value('randomization_amt') / 2
  })
}

function add_actor() {
  var c = 1
  if (keyIsDown(SHIFT)) {
    c = 10
  }
  for (let i = 0; i < c; i++) {
    var seed_actor = actors[actors.length - 1]
    var actor = {
      x: seed_actor.x,
      y: seed_actor.y,
      direction: random() * Math.PI,
      id: actors.length
    }
    actors.push(actor)
  }
  return actors.length
}

function calc_offset(center) {
    // visible_size should always be an even number (we increment / decrement by 2)
    var half_visible = floor(get_parameter_value('visible_size')) / 2
    var offset = floor(max(0, min(center - half_visible, BOARD_SIZE - get_parameter_value('visible_size'))))
    return offset
}

function calc_incremental_offset(cur_offset, new_center) {
  var buffer = max(VISIBLE_BUFFER, ceil(get_parameter_value('look_distance') * sqrt(2)))
  if (new_center < (cur_offset + buffer)) {
    cur_offset -= 1
  } else if (new_center >= (cur_offset + get_parameter_value('visible_size') - buffer)) {
    cur_offset += 1
  }

  return max(0, min(BOARD_SIZE - get_parameter_value('visible_size') - 1, cur_offset))
}

function draw() {
  if (get_parameter_value('fast_mode')) {
    for (var i = 0; i < 32; i++) {
      process_actors(true)
    }
  } else {
    // set globals
    if (zoom_direction) {
      set_parameter_value('visible_size', min(BOARD_SIZE, max(MAX_ZOOM, get_parameter_value('visible_size') * zoom_direction)))
    }

    scale = min(window.width, window.height) / get_parameter_value('visible_size')
    var focus_actor = actors[focus_idx]
    if (zoom_direction != 0 || !x_offset || !y_offset) {
      x_offset = calc_offset(focus_actor.x)
      y_offset = calc_offset(focus_actor.y)
    } else {
      x_offset = calc_incremental_offset(x_offset, focus_actor.x)
      y_offset = calc_incremental_offset(y_offset, focus_actor.y)
    }

    if (get_parameter_value('visible_size') == MAX_ZOOM || get_parameter_value('visible_size') == BOARD_SIZE) {
      zoom_direction = 0
    }

    background(0);
    draw_board()
    draw_actors()
    process_actors()

    if (get_parameter_value('single_step')) {
      noLoop()
    }

  }
}

function keyPressed() {
  for (const [label, param] of Object.entries(parameters)) {
    if (param[1].toUpperCase().charCodeAt() == keyCode) {
      let new_val = param[2](param[0])
      if (new_val !== undefined) {
        param[0] = new_val
      }
      break
    }
  }

  show_data()
  draw_board()
  loop()
}

