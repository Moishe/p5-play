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
        x = width / 2,
        y = height / 2,
        lifetime = Math.floor(Math.random() * this.max_age),
        is_active = true,
        next_free = -1
      }
      return actor
    }
  }

  static default_update_func(actor) {
    actor.x += cos(actor.d) * actor.v
    actor.y += sin(actor.d) * actor.v

    actor.age += 1
    if (actor.age > actor.lifetime) {
      return false
    }
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

    for (let i = seed_actors; i < this.max_actors; i++) {
      this.actors[i] = {
        next_free: i == seed_actors ? -1 : i - 1,
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

      stroke(this.actors[i].color)
      point(this.actors[i].x, actors[i].y)

      if (!this.update_func(this.actors[i])) {
        this.delete_actor(i)
      }
    }
  }

  delete_actor(index) {
    actor[index] = {
      is_active: false,
      next_free: this.next_free
    }
    this.next_free = index
  }
}

let director
function setup() {
  debugger
  director = new Director(1000, 10, 100)
  director.initialize()
}

function draw() {
  director.process_and_draw()
}