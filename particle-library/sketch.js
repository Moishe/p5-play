let director
let capturer
let save_animation = true
let max_frames = 60 * 10

class MoldDirector extends Director {
  create(parent) {
    let actor = super.create(parent)

    actor.x = Math.random() * width
    actor.y = Math.random() * height
    actor.d = Math.random() * PI * 2
    return actor
  }

  update(actor) {
    let result = super.update(actor)
    if (result) {
      actor.v = min(1, actor.v + 0.1)

      let dirs = [-Math.PI / 4, 0, Math.PI / 4]
      let big_c = 255
      let dir = actor.d
      for (let i = 0; i < dirs.length; i++) {
        let look_x = actor.x + cos(dirs[i] + actor.d) * 3
        let look_y = actor.y + sin(dirs[i] + actor.d) * 3
        let c = get(look_x, look_y)[0]
        if (c < big_c) {
          c = big_c
          dir = dirs[i] + actor.d
        }
      }

      actor.d = lerp(actor.d, dir, Math.random())
      actor.d += (Math.random() - 0.5) * 0.1
    }
    return result
  }

  should_spawn(actor) {
    let c = get(actor.x, actor.y)[0]
    return Math.random() * 255 < c
    //return Math.random() < actor.age / actor.lifetime
  }

  draw(actor) {
    stroke(0, 0, 0, 255 - Math.floor(255 * (actor.age / actor.lifetime)))
    strokeWeight(0.3)
    point(actor.x, actor.y)
  }

  spawn(actor) {
    let new_actor = super.spawn(actor)
    if (new_actor) {
      new_actor.d = actor.d
    }
    return new_actor
}
}

function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(1024, 1024)
  background(255)
  director = new MoldDirector(
    5000, // max actors
    7,  // seed actors
    1000,  // max age
    100
  )
  director.initialize()

  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }
}

let generation = 0
function draw() {
  if (generation == 0 && save_animation) {
    capturer.start()
  }

  if (generation > max_frames) {
    noLoop()
    if (save_animation) {
      capturer.stop()
      capturer.save()
    }
  }

  director.process_and_draw(generation)
  generation += 1

  if (save_animation) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

function mousePressed() {
  console.log(get(mouseX, mouseY))
}