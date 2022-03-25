let LOOK_DISTANCE = 18
let RANDOM_WANDER = Math.PI / 12
let BLUR_OPACITY = 3
let BLUR_RADIUS = 10
let POINT_OPACITY = 32
let CENTER_ACTORS = true
let VISION_SWEEP = Math.PI / 3

let MAX_ACTORS = 200
let START_ACTORS = 10
let PUNCH_HOLE = true
let HOLE_RADIUS = 150

let SIMULATION_GENERATIONS = 500

let director

var old_paths = []

var anyCreated = false
class MoldDirector extends Director {
  create(parent, idx) {
    let actor = super.create(parent)
    actor.d = Math.random() * PI * 2
    actor.v = 1
    actor.lifetime = 2000
    actor.path = []
    if (PUNCH_HOLE) {
      let t = idx / START_ACTORS * Math.PI * 2
      actor.x = cos(t) * HOLE_RADIUS + windowWidth / 2
      actor.y = sin(t) * HOLE_RADIUS + windowHeight / 2
    } else if (CENTER_ACTORS) {
      actor.x = windowWidth / 2
      actor.y = windowHeight / 2
    } else {
      actor.x = random(0, windowWidth)
      actor.y = random(0, windowHeight)
    }
    return actor
  }

  update(actor) {
    let result = super.update(actor)
    if (result) {
      let dirs = [-VISION_SWEEP, 0, VISION_SWEEP]
      let max_c = 255
      let dir = actor.d
      for (let i = 0; i < dirs.length; i++) {
        var dirIdx
        if (Math.random() < 0.5) {
          dirIdx = i
        } else {
          dirIdx = dirs.length - (i + 1)
        }
        let look_x = actor.x + cos(dirs[dirIdx] + actor.d) * LOOK_DISTANCE
        let look_y = actor.y + sin(dirs[dirIdx] + actor.d) * LOOK_DISTANCE
        let c = get(look_x, look_y)[0]
        if (c < max_c) {
          c = max_c
          dir = dirs[dirIdx] + actor.d
        }
      }

      actor.d = lerp(actor.d, dir, 0.9)
      actor.d += (Math.random() - 0.5) * RANDOM_WANDER

      actor.path.push([actor.x, actor.y])

      let food_amt = get(actor.x, actor.y)[0]
      if (food_amt < 64) {
        result = false
      }

    }
    return result
  }

  default_lifetime() {
    return 1000
  }

  should_spawn(actor) {
    return Math.random() > actor.age / actor.lifetime
  }

  draw(actor) {
    stroke(0, 0, 0, POINT_OPACITY)
    strokeWeight(1.0)
    point(actor.x, actor.y)
    stroke(0, 0, 0, BLUR_OPACITY)
    for (let r = 0; r < BLUR_RADIUS; r++) {
      noFill()
      circle(actor.x, actor.y, r)
    }
  }

  spawn(actor) {
    let new_actor = super.spawn(actor)
    if (new_actor) {
      if (actor.path) {
        old_paths.push(actor.path)
      }
      new_actor.path = []
      new_actor.d = actor.d + (Math.random() - 0.5) * PI
      new_actor.v = actor.v
      new_actor.lifetime = get(new_actor.x, new_actor.y)[0]
    }
    return new_actor
  }
}

var SVG_TRANSLATE

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255)
  director = new MoldDirector(
    MAX_ACTORS,
    START_ACTORS
  )
  director.initialize()

  SVG_TRANSLATE = (210 * SVG_MM) / max(windowWidth, windowHeight)
  console.log(windowWidth, windowHeight)
  console.log(SVG_TRANSLATE)

  if (PUNCH_HOLE) {
    noStroke()
    fill(0, 0, 0, 4)
    for (let i = 0; i < HOLE_RADIUS * 2 - 40; i++) {
      circle(windowWidth / 2, windowHeight / 2, i)
    }
  }
}

function addActorPath(path) {
  beginSvgPath()
  for (let j = 0; j < path.length; j++) {
    let x = (path[j][0] - (windowWidth / 2)) * SVG_TRANSLATE + SVG_WIDTH / 2 * SVG_MM
    let y = (path[j][1] - (windowHeight / 2)) * SVG_TRANSLATE + SVG_HEIGHT / 2 * SVG_MM
    if (j == 0) {
      svgMove(x, y)
    } else {
      svgLine(x, y)
    }
  }
  endSvgPath()
}

var generation = 0
function draw() {
  director.process_and_draw()
  generation += 1
  if (generation > SIMULATION_GENERATIONS) {
    beginSvg()
    for (let i = 0; i < director.actors.length; i++) {
      let actor = director.actors[i]
      if (!actor || !actor.path) {
        continue
      }
      addActorPath(actor.path)
    }
    for (let i = 0; i < old_paths.length; i++) {
      addActorPath(old_paths[i])
    }
    endSvg()
    noLoop()
  }
}
