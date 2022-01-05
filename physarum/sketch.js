// Maximum number of actors. 
// Can be arbitrarily big but perf will suffer above a few thousand
let max_actors = 10000

// Number of initial active actors. Anything up to max_actors
let seed_actors = 400

// Minimum lifespan for an actor. Anything between 2 (which would be silly) and whatever
let min_lifespan = 1000

// Additional random lifespan. Can be zero
let additional_random_lifespan = 100

// Chance of spawning if we find an inactive actor. Between 0 and 1.
// Lower numbers may lead to colony collapse; must be balanced with
// lifespan and number of actors
let spawn_chance = 0.01

// How much to randomize a spawned actor's direction, relative to its parent.
let spawn_direction_randomization = Math.PI / 6

// How much an actor should just wander around
let random_wander = Math.PI / 3

// How narrow is an actor's view of the world (bigger is narrower)
let narrowness = 6

// How far ahead does an actor look
let look_distance = 9

// How quickly does the board fade. Between 0 and 255
let fade_speed = 3

// How intense is an actor's color blended. Between 0 and 255
let actor_blend_amount = 255

// how thick a line the actors draw
let stroke_weight = 1

// Can set this to nil and will default to random placement. The
// function specified here will define variables for arranging
// the initial layout (margins, spacing, etc).
let arrangement = rectangleActor

let speed = 0.0
let max_speed = 1
let acceleration = 0.002

let save_animation = true
let animation_frames = 480
let save_interval = 1

function getLifespan() {
  return min_lifespan + Math.floor(Math.random() * additional_random_lifespan);
}

function rectangleActor(idx) {
  let margin = 0.25

  var a = randomActor(idx)
  var actors_per_side = seed_actors / 4 //sqrt(seed_actors)
  var x = idx % actors_per_side
  var y = Math.floor(idx / actors_per_side)

  var offset_x = width * margin
  var offset_y = height * margin

  var spacing_x = ((1 - margin * 2) * width) / actors_per_side
  var spacing_y = ((1 - margin * 2) * height) / actors_per_side

  if (idx < seed_actors / 4) {
    a.x = offset_x + x * spacing_x
    a.y = offset_y
    a.direction = Math.PI / 2
    a.color = {r: 255, g: 0, b: 0}
  } else if (idx < seed_actors / 2) {
    a.x = width - offset_x
    a.y = offset_y + x * spacing_y
    a.direction = Math.PI
    a.color = {r: 0, g: 255, b: 0}
  } else if (idx < (seed_actors * 3/4)) {
    a.x = width - offset_x - x * spacing_x
    a.y = height - offset_y
    a.direction = Math.PI + Math.PI / 2
    a.color = {r: 0, g: 0, b: 255}
  } else {
    a.x = offset_x
    a.y = height - offset_y - x * spacing_y
    a.direction = 0
    a.color = {r: 255, g: 255, b: 0}
  }
/*
  a.color = {
    r: 255,
    g: 255,
    b: 255
  }
*/
  return a
}

let c
let capturer

function setup() {
  c = createCanvas(512, 512) //windowWidth, windowHeight);
  for (i = 0; i < max_actors; i++) {
    createActor(i, arrangement)
  }
  background(0)

  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }
}

var actors = []

function randomActor(idx) {
  var lifespan
  if (idx < seed_actors) {
    lifespan = getLifespan()
  } else {
    lifespan = 0
  }    
  
  var a = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    direction: Math.random() * Math.PI * 2,
    lifespan: lifespan
  }
  a.color = {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
  }
  return a
}

function createActor(idx, actorFromIdx=randomActor) {
  var a = actorFromIdx(idx)
  actors.push(a)
}

function spawnActor() {
  seed = actors[Math.floor(Math.random() * actors.length)]
  if (seed.lifespan <= 1) {
    return false
  }

  return {
    x: seed.x,
    y: seed.y,
    direction: seed.direction + (Math.random() - 0.5) * spawn_direction_randomization,
    color: seed.color
  }
}

let frame = 0

function generation() {
  if (frame == 0 && save_animation) {
    capturer.start()      
  }

  if (speed < max_speed) {
    speed += acceleration
  }

  for (var i = 0; i < actors.length; i++) {
    if (actors[i].lifespan <= 1) {
      if (Math.random() < spawn_chance) {
        new_actor = spawnActor()
        if (new_actor) {
          actors[i].x = new_actor.x
          actors[i].y = new_actor.y
          actors[i].direction = new_actor.direction
          actors[i].color = new_actor.color
          actors[i].lifespan = getLifespan()  
        }
      }
    } else {
      if (actors[i].lifespan > 1) {
        actors[i].x += cos(actors[i].direction) * speed
        actors[i].y += sin(actors[i].direction) * speed
    
        if (actors[i].x > width || actors[i].y > height || actors[i].x < 0 || actors[i].y < 0) {
          new_actor = spawnActor()
          if (!new_actor) {
            continue;
          }
          actors[i].x = new_actor.x
          actors[i].y = new_actor.y
          actors[i].direction = new_actor.direction
          actors[i].color = new_actor.color
          actors[i].lifespan = getLifespan()
        }
    
        actors[i].lifespan -= 1
        actors[i].direction += (Math.random() - 0.5) * random_wander
    
        // look around
        var dir = actors[i].direction
        var my_color = createVector(actors[i].color.r, actors[i].color.g, actors[i].color.b).normalize()
        var max_value = 0
        for (var j = 0; j < 3; j++) {
          var look_direction = actors[i].direction - Math.PI / narrowness + (Math.PI / narrowness) * j
          look_at_x = actors[i].x + cos(look_direction) * look_distance
          look_at_y = actors[i].y + sin(look_direction) * look_distance
    
          var c = get(look_at_x, look_at_y)
          var color_at = createVector(c[0], c[1], c[2]).normalize()
          var dx = color_at.dot(my_color)
    
          if (dx > max_value) {
            max_value = dx
            dir = look_direction
          }
        }
    
        actors[i].direction = dir
      }
    }
  }

  if (frame == animation_frames && save_animation) {
    noLoop()
    capturer.stop()
    capturer.save()
  }

  if (save_animation && (frame % save_interval == 0)) {
    capturer.capture(document.getElementById('defaultCanvas0'));    
  }
  
  frame += 1
}

function draw() {
  fill(0, 0, 0, fade_speed)
  rect(0, 0, width, height)

  generation()
  strokeWeight(stroke_weight)
  prev_x = actors[0].x
  prev_y = actors[0].y
  actors.forEach(actor => {
    if (actor.lifespan > 1) {
      stroke(actor.color.r, actor.color.g, actor.color.b, actor_blend_amount)
      point(actor.x, actor.y)
      //line(prev_x, prev_y, actor.x, actor.y)
      prev_x = actor.x
      prev_y = actor.y  
    }
  })
}