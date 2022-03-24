let director

class MoldDirector extends Director {
  create(parent) {
    let actor = super.create(parent)
    actor.d = Math.random() * PI * 2
    actor.v = 1
    actor.lifetime = 2000
    actor.path = []
    return actor
  }

  update(actor) {
    let result = super.update(actor)
    if (result) {
      let dirs = [-Math.PI / 4, 0, Math.PI / 4]
      let max_c = 255
      let dir = actor.d
      for (let i = 0; i < dirs.length; i++) {
        let look_x = actor.x + cos(dirs[i] + actor.d) * 5
        let look_y = actor.y + sin(dirs[i] + actor.d) * 5
        let c = get(look_x, look_y)[0]
        if (c < max_c) {
          c = max_c
          dir = dirs[i] + actor.d
        }
      }

      actor.d = lerp(actor.d, dir, Math.random())
      actor.d += (Math.random() - 0.5) * PI / 16

      actor.path.push([actor.x, actor.y])
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
    stroke(0, 0, 0, 128)
    strokeWeight(0.5)
    point(actor.x, actor.y)
  }

  spawn(actor) {
    let new_actor = super.spawn(actor)
    if (new_actor) {
      new_actor.path = []
      new_actor.d = actor.d + (Math.random() - 0.5) * PI
      new_actor.v = actor.v
      new_actor.lifetime = 1000 //get(new_actor.x, new_actor.y)[0]
    }
    return new_actor
  }
}

var SVG_TRANSLATE

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255)
  director = new MoldDirector(
    1000,   // max actors
    1       // seed actors
  )
  director.initialize()

  SVG_TRANSLATE = (210 * SVG_MM) / max(windowWidth, windowHeight)
  console.log(windowWidth, windowHeight)
  console.log(SVG_TRANSLATE)
}

var generation = 0
function draw() {
  director.process_and_draw()
  generation += 1
  if (generation > 1000) {
    beginSvg()
    for (let i = 0; i < director.actors.length; i++) {
      beginSvgPath()
      let actor = director.actors[i]
      if (!actor || !actor.path) {
        continue
      }
      for (let j = 0; j < actor.path.length; j++) {
        let x = (actor.path[j][0] - (windowWidth / 2)) * SVG_TRANSLATE + SVG_WIDTH / 2 * SVG_MM
        let y = (actor.path[j][1] - (windowHeight / 2)) * SVG_TRANSLATE + SVG_HEIGHT / 2 * SVG_MM
        if (j == 0) {
          svgMove(x, y)
        } else {
          svgLine(x, y)
        }
      }
      endSvgPath()
    }
    endSvg()
    noLoop()
  }
}
