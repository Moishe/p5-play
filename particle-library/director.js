let Director = class {
    max_actors
    seed_actors
    max_age
    min_age
    create_func
    update_func
    should_spawn_func
    draw_func

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
      return Math.random() < 0.1
    }

    constructor(max_actors,
                seed_actors,
                max_age,
                min_age,
                create_func=Director.default_create_func,
                update_func=Director.default_update_func,
                should_spawn_func=Director.default_should_spawn_func,
                draw_func=Director.default_draw_func) {
      this.max_actors = max_actors
      this.seed_actors = seed_actors
      this.max_age = max_age
      this.min_age = min_age
      this.create_func = create_func
      this.update_func = update_func
      this.should_spawn_func = should_spawn_func
      this.draw_func = draw_func
    }

    initialize() {
      for (let i = 0; i < this.seed_actors; i++) {
        this.actors[i] = this.create_func(this.min_age, this.max_age)
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
        let idx = this.next_free
        this.next_free = this.actors[idx].next_free

        this.actors[idx] = this.create_func(this.min_age, this.max_age, actor)
        this.actors[idx].x = actor.x
        this.actors[idx].y = actor.y
        this.actors[idx].lifetime = this.min_age + Math.floor(Math.random() * this.max_age)
        this.actors[idx].age = 0
        this.actors[idx].v = 0
        this.actors[idx].d = actor.d + (Math.random() - 0.5) * Math.PI / 8
        this.actors[idx].next_free = -1

        return this.actors[idx]
      }
    }
  }