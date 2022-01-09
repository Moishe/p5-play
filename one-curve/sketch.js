let vertex_count = 512

let grid = []

let particle = {}

let circle_count = 4
let multipliers = [1, 2, 3, 4]
let radii = [50, 500, 100, 250]

let c

function setup() {
  c = createCanvas(1024, 1024);
  background(0);
  
  particle = {
    loc: createVector(1024 / 2, 1024 / 2),
    vel: createVector(0, 0)
  }
}

let frame = 0
let current_goal = 0
let prev_loc
function draw() {
  if (frame == 0) {
    strokeWeight(0.1)
    vertices = []
    for (let i = 0; i < vertex_count; i++) {      
      for (let j = 0; j < circle_count; j++) {
        let a = (i / vertex_count) * (Math.PI * 2 * multipliers[j]) + Math.PI / 2
        let x = cos(a) * radii[j] + width / 2
        let y = sin(a) * radii[j] + height / 2
        vertices.push(createVector(x,y))        
      }
    }
    particle.loc = vertices[0].copy()
  } else {
    while (true) {
      strokeWeight(0.1)
      stroke(256, 256, 256, 192)
      //point(particle.loc.x, particle.loc.y)
      particle.loc.add(particle.vel)
      
      if (prev_loc) {
        line(prev_loc.x, prev_loc.y, particle.loc.x, particle.loc.y)
      }
  
      let goal = vertices[current_goal]
      let d = goal.dist(particle.loc)
      if (d < 1) {
        current_goal = (current_goal + 1) % vertices.length
        if ((current_goal) == 0) {
          //saveCanvas(c, 'myCanvas', 'jpg');
          noLoop()
        }
        /*
        strokeWeight(2)
        stroke(255, 0, 0)
        point(vertices[current_goal].x, vertices[current_goal].y)
        */        
        break
      } else {
        ideal_vector = p5.Vector.sub(goal, particle.loc)
        ideal_vector.normalize()
        particle.vel.lerp(ideal_vector, 1 / d * 3)
      }
      prev_loc = particle.loc.copy()
    }
  }
  frame = 1
}