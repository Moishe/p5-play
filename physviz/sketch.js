let PS = 20
let BORDER = 0
let ARROW_TIP = 3

let pheromone = []
let HEIGHT = 50
let WIDTH = 50

let DEPOSIT_AMT = 16
let GEN_DELAY = 10

let MAX_ACTORS = 1

let actors = []

function setup() {
  c = createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < HEIGHT * WIDTH; i++) {
    pheromone.push(0)
  }

  background(255)

  actors.push(new actor(Math.floor(HEIGHT / 2), Math.floor(WIDTH / 2), 0))
}

function drawPixel(x, y, occupied) {
  strokeWeight(0.1)
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
  return
  new_pheromone = []
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    let x = i % WIDTH
    let y = Math.floor(i / WIDTH)

    let total = pheromone[i] * 15
    for (let x1 = max(0, x - 1); x1 <= min(WIDTH - 1, x + 1); x1++) {
      for (let y1 = max(0, y - 1); y1 <= min(HEIGHT - 1, y + 1); y1++) {
        total += pheromone[x1 + y1 * WIDTH]
      }
    }
    new_pheromone[i] = total / 23.99
  }
  pheromone = new_pheromone
}

class actor {
  constructor(x, y, heading) {
    this.x = x
    this.y = y
    this.heading = heading
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

  draw() {
    drawPixel(this.x, this.y, true)

    let offsets = this.getOffsets(1.2)
    for (let i = 0; i < offsets.length; i++) {
      drawArrow(offsets[i][0], offsets[i][1], offsets[i][2])
    }
  }

  process() {
    let offsets = this.getOffsets(2.2)
    let max_value = 0
    let random_heading_idx = Math.floor(random(0, 3))

    let new_x = Math.max(Math.min(offsets[random_heading_idx][0], WIDTH - 1), 0)
    let new_y = Math.max(Math.min(offsets[random_heading_idx][1], HEIGHT - 1), 0)
    let new_heading = offsets[random_heading_idx][2]

    if (Math.random() < 0.01) {
      this.x = new_x
      this.y = new_y
      this.heading = new_heading
      return
    }

    if (new_x > WIDTH - 1 || new_y > HEIGHT - 1 || new_x < 0 || new_y < 0) {
      this.heading += Math.PI / 4
      return
    }

  for (let i = 0; i < offsets.length; i++) {
      let x = offsets[i][0]
      let y = offsets[i][1]

      if (x > WIDTH - 1 || y > HEIGHT - 1 || x < 0 || y < 0) {
        continue
      }

      let value = pheromone[x + y * WIDTH]
      if (value > max_value) {
        max_value = value
        new_heading = offsets[i][2]
        new_x = x
        new_y = y
      }
    }

    pheromone[this.y * WIDTH + this.x] = min(pheromone[this.y * WIDTH + this.x] + DEPOSIT_AMT, 255)

    this.x = new_x
    this.y = new_y
    this.heading = new_heading
  }
}

let gen = 0
let genheading = 0
function draw() {
  background(255)
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    drawPixel(i % WIDTH, Math.floor(i / WIDTH), pheromone[i])
  }
  let new_actors = []
  for (let i = 0; i < actors.length; i++) {
    let a = actors[i]
    a.draw()

    if (gen % GEN_DELAY == 0) {
      a.process()
    }

    if (Math.random() < 0.01 && (actors.length + new_actors.length) < MAX_ACTORS ) {
      new_actors.push(new actor(a.x, a.y, a.heading))
    }
  }

  if (new_actors.length > 0) {
    actors = actors.concat(new_actors)
  }

  if (gen % GEN_DELAY == 0) {
    blur()
  }
  gen += 1
}