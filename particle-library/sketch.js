let Director = class {
  max_actors
  seed_actors
  max_age
  min_age
  create_func
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

  static default_should_spawn_func(actor) {
    return Math.random() > actor.age / actor.lifetime
    //return Math.floor(actor.lifetime / 2) == actor.age
  }

  constructor(max_actors, 
              seed_actors, 
              max_age,
              min_age,
              create_func=Director.default_create_func,
              update_func=Director.default_update_func,
              should_spawn_func=Director.default_should_spawn_func,
              default_actor=Director.default_actor_template) {
    this.max_actors = max_actors
    this.seed_actors = seed_actors
    this.max_age = max_age
    this.min_age = min_age
    this.create_func = create_func
    this.update_func = update_func
    this.should_spawn_func = should_spawn_func
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
    loadPixels()
    for (let i = 0; i < this.actors.length; i++) {
      if (!this.actors[i].is_active || this.actors[i].generation_created == generation) {
        continue
      }

      stroke(0, 0, 0, 255 - Math.floor(256 * (this.actors[i].age / this.actors[i].lifetime)))
      strokeWeight(0.1)
      point(this.actors[i].x, this.actors[i].y)

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
function setup() {
  createCanvas(windowWidth, windowHeight);
  director = new Director(
    10000,  // max actors
    10,   // seed actors
    1000,  // max age
    200,  // min_age
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
        let big_c = 0
        let dir = actor.d
        for (let i = 0; i < dirs.length; i++) {
          let look_x = actor.x + cos(dirs[i] + actor.d) * 5
          let look_y = actor.y + sin(dirs[i] + actor.d) * 5
          stroke(128, 32, 0, 0.5)
          strokeWeight(1)
          point(look_x, look_y)
          let c = get(look_x, look_y)[3]
          if (c > big_c) {
            c = big_c
            dir = dirs[i] + actor.d
          }
        }

        actor.d = lerp(actor.d, dir, 0.9)
        actor.d += (Math.random() - 0.5) * 0.1
      }
      return result
    })
  director.initialize()
}

let generation = 0
function draw() {
  director.process_and_draw(generation)
  generation += 1
}

function mousePressed() {
  console.log(get(mouseX, mouseY))
}