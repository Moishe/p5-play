let PS = 20
let BORDER = 0
let ARROW_TIP = 3

let pheromone = []
let HEIGHT = 25
let WIDTH = 25

let DEPOSIT_AMT = 16
let GEN_DELAY = 10

let MAX_ACTORS = 1

let BLUR_SHARPNESS = 1

let DIRECTIONS = [
  'left',
  'ahead',
  'right'
]

let STATE_STRING = [
  "Preparing to look around",
  "Looking left",
  "Looking ahead",
  "Looking right",
  "Depositing pheromone",
  "Moving in my new direction"
]

let actors = []

// states
START_LOOK = 0
LOOK_LEFT = 1
LOOK_AHEAD = 2
LOOK_RIGHT = 3
DEPOSIT = 4
MOVE = 5

let status_text

function setup() {
  c = createCanvas((PS + BORDER) * HEIGHT, (PS + BORDER) * WIDTH);
  c.parent("board-holder")
  for (let i = 0; i < HEIGHT * WIDTH; i++) {
    pheromone.push(0)
  }

  status_text = createElement("text", "Status")
  status_text.parent("status")
  status_text.html("Hello world.")

  background(255)

  actors.push(new actor(Math.floor(HEIGHT / 2), Math.floor(WIDTH / 2), Math.PI))
  //actors.push(new actor(Math.floor(HEIGHT / 2), Math.floor(WIDTH / 2), 0))
}

function drawPixel(x, y, highlight) {
  if (highlight) {
    strokeWeight(1)
    stroke("green")
  } else {
    strokeWeight(0.1)
    stroke("black")
  }
  fill(pheromone[x + y * WIDTH])
  rect(x * PS + BORDER, y * PS + BORDER, PS - BORDER * 2, PS - BORDER * 2)
}

function drawArrow(x, y, heading) {
  let center = createVector(x * PS + PS / 2, y * PS + PS / 2) // center point
  let v1 = createVector(0, (PS - BORDER) / 2)
  let v2 = createVector(0, (PS - BORDER) / 2)
  v1.setHeading(heading)
  v2.setHeading(heading + Math.PI)
  v1.add(center)
  v2.add(center)

  let a1 = createVector(0, ARROW_TIP)
  let a2 = createVector(0, ARROW_TIP)

  a1.setHeading(heading + Math.PI + Math.PI / 6)
  a2.setHeading(heading + Math.PI - Math.PI / 6)
  a1.add(v1)
  a2.add(v1)

  for (let i = 0; i < 2; i++) {
    if (i == 0) {
      stroke("white")
      strokeWeight(2)
    } else {
      stroke("black")
      strokeWeight(0.5)
    }
    line(v1.x, v1.y, v2.x, v2.y)
    line(v1.x, v1.y, a1.x, a1.y)
    line(v1.x, v1.y, a2.x, a2.y)
    }

}

function blur() {
  if (BLUR_SHARPNESS == 1) {
    return
  }
  new_pheromone = []
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    let x = i % WIDTH
    let y = Math.floor(i / WIDTH)

    let total = pheromone[i] * BLUR_SHARPNESS
    for (let x1 = max(0, x - 1); x1 <= min(WIDTH - 1, x + 1); x1++) {
      for (let y1 = max(0, y - 1); y1 <= min(HEIGHT - 1, y + 1); y1++) {
        total += pheromone[x1 + y1 * WIDTH]
      }
    }
    new_pheromone[i] = total / (BLUR_SHARPNESS + 9 - 0.01)
  }
  pheromone = new_pheromone
}

class actor {
  constructor(x, y, heading) {
    this.x = x
    this.y = y
    this.heading = heading
    this.state = START_LOOK

    this.state_funcs = [
      this.startLook.bind(this),
      this.lookLeft.bind(this),
      this.lookAhead.bind(this),
      this.lookRight.bind(this),
      this.deposit.bind(this),
      this.move.bind(this)
    ]
  }

  getOffsets(distance) {
    let offsets = []
    for (let i = 0; i < 3; i++) {
      let subheading = (i - 1) * Math.PI / 4 + this.heading

      let subx = this.x + Math.round(Math.cos(subheading) * distance) / 2
      let suby = this.y + Math.round(Math.sin(subheading) * distance) / 2

      offsets.push([subx, suby, subheading])
    }
    return offsets
  }

  startLook() {
    this.offsets = this.getOffsets(2.2)
    this.max_value = 0
    let random_heading_idx = Math.floor(random(0, 3))

    this.new_x = Math.max(Math.min(this.offsets[random_heading_idx][0], WIDTH - 1), 0)
    this.new_y = Math.max(Math.min(this.offsets[random_heading_idx][1], HEIGHT - 1), 0)
    this.new_heading = this.offsets[random_heading_idx][2]
    this.max_idx = random_heading_idx

    if (Math.random() < 0.01) {
      this.log("I've decided to go in a random direction.")
      this.state = DEPOSIT
    }

    if (this.new_x > WIDTH - 1 || this.new_y > HEIGHT - 1 || this.new_x < 0 || this.new_y < 0) {
      this.heading += Math.PI / 4
      this.log("I fell off the edge of the screen, rotating but not depositing or moving.")
      this.state = START_LOOK
    }
    this.state += 1
  }

  look(idx) {
    let x = this.offsets[idx][0]
    let y = this.offsets[idx][1]

    if (x > WIDTH - 1 || y > HEIGHT - 1 || x < 0 || y < 0) {
      return false
    }

    drawArrow(this.offsets[idx][0], this.offsets[idx][1], this.offsets[idx][2])

    let value = pheromone[x + y * WIDTH]
    if (value > this.max_value) {
      this.max_value = value
      this.new_heading = this.offsets[idx][2]
      this.new_x = x
      this.new_y = y
      this.max_idx = idx
      return true
    }

    return false
  }

  lookLeft() {
    this.look(0)
    this.state += 1
  }

  lookAhead() {
    this.look(1)
    this.state += 1
  }

  lookRight() {
    this.look(2)
    this.state += 1
  }

  deposit() {
    pheromone[this.y * WIDTH + this.x] = min(pheromone[this.y * WIDTH + this.x] + DEPOSIT_AMT, 255)
    this.state += 1
  }

  move() {
    this.log("Moving " + DIRECTIONS[this.max_idx])
    this.x = this.new_x
    this.y = this.new_y
    this.heading = this.new_heading
    this.state = 0
  }

  draw() {
    drawPixel(this.x, this.y, true)
  }

  log(msg) {
    status_text.html(msg)
  }

  step() {
    this.log(STATE_STRING[this.state])
    this.state_funcs[this.state]()
  }
}

let should_advance = true
function keyPressed() {
  should_advance = true
}

let gen = 0
let genheading = 0
let cur_actor = 0
function draw() {
  if (!should_advance) {
    return
  }
  should_advance = false
  background(255)
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    drawPixel(i % WIDTH, Math.floor(i / WIDTH), false)
  }

  if (cur_actor >= actors.length) {
    cur_actor = 0
    blur()
  }
  let a = actors[cur_actor]
  a.draw()
  //a.displayStats()

  a.step()

  if (a.state == 0) {
    cur_actor += 1
  }
}