let director
let capturer
let save_animation = true
let max_frames = 60 * 10

function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(1024, 1024)
  background(255)
  director = new Director(
    5000, // max actors
    1,  // seed actors
    1000,  // max age
    100,   // min_age
    (min_age, max_age, parent) => {
      actor = Director.default_create_func(min_age, max_age, parent)
      actor.x = Math.random() * width
      actor.y = Math.random() * height
      actor.d = Math.random() * PI * 2
      return actor
    },
    (actor) => {
      let result = Director.default_update_func(actor)
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
    },
    (actor) => {
      return Math.random() < actor.age / actor.lifetime
    }
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