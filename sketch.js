function setup() {
  createCanvas(1024, 1024);
  for (i = 0; i < 10; i++) {
    createActor()
  }

  background(0)
}

var actors = []

function createActor() {
  var colors = [
    {r: 255, g: 0, b: 0},
    {r: 0, g: 255, b: 0},
    {r: 0, g: 0, b: 255}
  ]
  var a = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    direction: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }
  actors.push(a)
}

function spawnActor() {
  seed = actors[Math.floor(Math.random() * actors.length)]
  return {
    x: seed.x,
    y: seed.y,
    direction: seed.direction + Math.random() - 0.5,
    color: seed.color
  }
}

function generation() {
  actors.forEach(actor => {
    actor.x += cos(actor.direction)
    actor.y += sin(actor.direction)

    if (actor.x > width || actor.y > height || actor.x < 0 || actor.y < 0) {
      new_actor = spawnActor()
      actor.x = new_actor.x
      actor.y = new_actor.y
      actor.direction = new_actor.direction
      actor.color = new_actor.color
    }

    actor.direction += (Math.random() - 0.5) * 0.1
  })
}

let interval = 20

function draw() {
  //background(0)
  /*
  for (var i = 0; i < height; i += (interval + 1)) {
    stroke(i / height * 255, i / height * 128, i / height * 255)
    line(i, 0, 0, height - i)
    stroke(255 - i / height * 255, i / height * 128, i / height * 255)
    line(i, width, height, height - i)
    line(width - i, 0, width, height - i)
    line(i, height, 0, i)
  }
  */

  generation()
  strokeWeight(10)
  prev_x = actors[0].x
  prev_y = actors[0].y
  actors.forEach(actor => {
    stroke(actor.color.r, actor.color.g, actor.color.b, 32)
    point(actor.x, actor.y)
    //line(prev_x, prev_y, actor.x, actor.y)
    prev_x = actor.x
    prev_y = actor.y
  })
}