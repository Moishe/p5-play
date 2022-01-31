let Director = class {
  max_actors
  seed_actors
  max_age
  min_age
  create_func
  update_func
  should_spawn_func
  draw_func
  default_actor

  actors = []
  next_free = -1

  static default_create_func(min_age, max_age, parent=null) {
    if (parent) {
      let actor = Object.assign({}, parent)
      return actor
    } else {
      let actor = {
        x: width / 2,
        y: height / 2,
        d: 0,
        v: 0,
        lifetime: Math.floor(Math.random() * max_age) + min_age,
        color: 'black',
        age: 0,
        is_active: true,
        generation_created: 0,
        next_free: -1
      }
      return actor
    }
  }

  static default_update_func(actor) {
    actor.x += cos(actor.d) * actor.v
    actor.y += sin(actor.d) * actor.v

    actor.age += 1
    return actor.age < actor.lifetime &&
      actor.x >= 0 &&
      actor.y >= 0 &&
      actor.x < width &&
      actor.y < height
  }

  static default_draw_func(actor) {
    stroke(0, 0, 0, 255 - Math.floor(256 * (actor.age / actor.lifetime)))
    strokeWeight(0.5)
    point(actor.x, actor.y)

  }

  static default_should_spawn_func(actor) {
    return Math.random() < actor.age / actor.lifetime
    //return Math.floor(actor.lifetime / 2) == actor.age
  }

  constructor(max_actors,
              seed_actors,
              max_age,
              min_age,
              create_func=Director.default_create_func,
              update_func=Director.default_update_func,
              should_spawn_func=Director.default_should_spawn_func,
              draw_func=Director.default_draw_func,
              default_actor=Director.default_actor_template) {
    this.max_actors = max_actors
    this.seed_actors = seed_actors
    this.max_age = max_age
    this.min_age = min_age
    this.create_func = create_func
    this.update_func = update_func
    this.should_spawn_func = should_spawn_func
    this.draw_func = draw_func
    this.default_actor = default_actor
  }

  initialize() {
    for (let i = 0; i < this.seed_actors; i++) {
      this.actors[i] = this.create_func(this.min_age, this.max_age, this.default_actor)
    }

    for (let i = this.seed_actors; i < this.max_actors; i++) {
      this.actors[i] = {
        next_free: i == this.seed_actors ? -1 : i - 1,
        is_active: false
      }
    }
    this.next_free = this.max_actors - 1
  }

  process_and_draw(generation) {
    for (let i = 0; i < this.actors.length; i++) {
      if (!this.actors[i].is_active || this.actors[i].generation_created == generation) {
        continue
      }

      this.draw_func(this.actors[i])

      if (!this.update_func(this.actors[i])) {
        this.delete_actor(i)
      } else if (this.should_spawn_func(this.actors[i])) {
        actor = this.spawn_actor(this.actors[i])
        if (actor) {
          actor.generation_created = generation
        }
      }
    }
  }

  delete_actor(index) {
    this.actors[index] = {
      is_active: false,
      next_free: this.next_free
    }
    this.next_free = index
  }

  spawn_actor(actor) {
    if (this.next_free != -1) {
      let temp_next_free = this.actors[this.next_free].next_free
      let idx = this.next_free
      this.actors[idx] = this.create_func(this.min_age, this.max_age, actor)
      this.actors[idx].next_free = -1
      this.actors[idx].lifetime = this.min_age + Math.floor(Math.random() * this.max_age)
      this.actors[idx].age = Math.floor(this.actors[idx].lifetime / 4)
      this.actors[this.next_free].x = actor.x
      this.actors[this.next_free].y = actor.y
      this.actors[this.next_free].v = 0
      this.actors[idx].d = actor.d + (Math.random() - 0.5) * Math.PI / 4
      this.next_free = temp_next_free
      return this.actors[idx]
    }
  }
}

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
    1000,  // seed actors
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

        let dirs = [-Math.PI / 3, 0, Math.PI / 3]
        let big_c = 255
        let dir = actor.d
        for (let i = 0; i < dirs.length; i++) {
          let look_x = actor.x + cos(dirs[i] + actor.d) * 5
          let look_y = actor.y + sin(dirs[i] + actor.d) * 5
          let c = get(look_x, look_y)[0]
          if (c < big_c) {
            c = big_c
            dir = dirs[i] + actor.d
          }
        }

        actor.d = lerp(actor.d, dir, Math.random())
        actor.d += (Math.random() - 0.5) * 0.5
      }
      return result
    })
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