// Play with this, copy it, whatever! Enjoy.
// BUT if you use this code to make NFTs I will be very angry and sad.

let vertex_count = 512

let grid = []

let particle = {}

let circle_count = 3
let multipliers = [1, -3, 2]
let starts = [0, 0, 0]
let radii = [[0, 400], [400, 0], [50,100]]
let meta_rotation = [1, 2, 3]

let rotate = -Math.PI / 2

let show_attractor = false
let save_animation = true

let max_frames = 1024

let c
let capturer


function setup() {
  c = createCanvas(1024, 1024);
  background(0);
  
  particle = {
    loc: createVector(1024 / 2, 1024 / 2),
    vel: createVector(0, 0)
  }
  
  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }
}

let frame = 0
let current_goal = 0
let prev_loc
function draw() {
  if (frame == 0 && save_animation) {
    capturer.start()      
  }

  if (frame > max_frames) {
    noLoop()
    if (save_animation) {
      capturer.stop()
      capturer.save()      
    }
  }

  background(0)
  strokeWeight(0.1)
  vertices = []
  for (let i = 0; i < vertex_count; i++) {      
    for (let j = 0; j < circle_count; j++) {
      let a = (i / vertex_count) * (Math.PI * 2 * multipliers[j]) + starts[j] + rotate
      a += ((meta_rotation[j] * frame)  / max_frames) * Math.PI * 2
      let radius = lerp(radii[j][0], radii[j][1], (frame / max_frames) * meta_rotation[j])
      let x = cos(a) * radius + width / 2
      let y = sin(a) * radius + height / 2
      vertices.push(createVector(x,y))        
    }
  }
  particle.loc = vertices[0].copy()
  particle.vel = createVector(0, 0)
  while (true) {
    strokeWeight(0.1)
    stroke(256, 256, 256, 192)
    particle.loc.add(particle.vel)

    if (prev_loc) {
      line(prev_loc.x, prev_loc.y, particle.loc.x, particle.loc.y)
    }

    let goal = vertices[current_goal]
    let d = goal.dist(particle.loc)
    if (d < 1) {
      current_goal = (current_goal + 1) % vertices.length
      if ((current_goal) == 0) {
        break
      }

      if (show_attractor) {
        strokeWeight(2)
        stroke(255, 0, 0)
        point(vertices[current_goal].x, vertices[current_goal].y)          
      }
    } else {
      ideal_vector = p5.Vector.sub(goal, particle.loc)
      ideal_vector.normalize()
      particle.vel.lerp(ideal_vector, 1 / d * 2)
    }
    prev_loc = particle.loc.copy()
  }

  if (save_animation) {
    capturer.capture(document.getElementById('defaultCanvas0'));    
  }
  
  frame += 1
}