let Director = class {
  max_actors
  seed_actors
  max_age
  create_func
  default_actor

  actors = []
  next_free = -1

  static default_create_func(parent=null) {
    if (parent) {
      return parent.copy()
    } else {
      let actor = {
        x: width / 2,
        y: height / 2,
        d: 0,
        v: 0,
        lifetime: Math.floor(Math.random() * 100),
        color: 'black',
        age: 0,
        is_active: true,
        next_free: -1
      }
      return actor
    }
  }

  static default_update_func(actor) {
    actor.x += cos(actor.d) * actor.v
    actor.y += sin(actor.d) * actor.v

    actor.age += 1
    return actor.age < actor.lifetime
  }

  constructor(max_actors, 
              seed_actors, 
              max_age, 
              create_func=Director.default_create_func,
              update_func=Director.default_update_func,
              default_actor=Director.default_actor_template) {
    this.max_actors = max_actors
    this.seed_actors = seed_actors
    this.max_age = max_age
    this.create_func = create_func
    this.update_func = update_func
    this.default_actor = default_actor
  }

  initialize() {
    for (let i = 0; i < this.seed_actors; i++) {
      this.actors[i] = this.create_func(this.default_actor)
    }

    for (let i = this.seed_actors; i < this.max_actors; i++) {
      this.actors[i] = {
        next_free: i == this.seed_actors ? -1 : i - 1,
        is_active: false
      }
    }
    this.next_free = this.max_actors - 1
  }

  process_and_draw() {
    for (let i = 0; i < this.actors.length; i++) {
      if (!this.actors[i].is_active) {
        continue
      }

      stroke(0)
      strokeWeight(1)
      point(this.actors[i].x, this.actors[i].y)

      if (!this.update_func(this.actors[i])) {
        this.delete_actor(i)
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
}

let director
function setup() {
  createCanvas(windowWidth, windowHeight);
  director = new Director(
    1000, // max actors
    10,   // seed actors
    100,  // max age
    (parent) => {
      actor = Director.default_create_func(parent)
      actor.d = Math.random() * Math.PI * 2
      return actor
    },
    (actor) => {
      let result = Director.default_update_func(actor)
      if (result) {
        actor.v = max(1, actor.v + 0.01)
        actor.d += (Math.random() - 0.5) * 0.1
      }
      return result
    })
  director.initialize()
}

function draw() {
  //background(255)
  director.process_and_draw()
}