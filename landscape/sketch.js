function setup() {
  createCanvas(windowWidth, windowHeight);

  background(192)
  for (let k = 0; k < 5; k++) {
    let layer_line = [
      createVector(0, height / 4 + Math.random() * height / 4 + ((k / 3) * height / 4)),
      createVector(width, height / 4 + Math.random() * height / 4 + ((k / 3) * height / 4))
    ]
  
    let current_line = layer_line
    for (let i = 0; i < Math.floor(Math.random() * 4) + 3; i++) {
      let new_line = []
      for (let j = 0; j < current_line.length - 1; j++) {
        new_triplet = fracture_line([current_line[j], current_line[j + 1]])
        new_line = new_line.concat(new_triplet)
      }
      current_line = Array.from(new_line)
    }
  
    strokeWeight(0)
    let color = p5.Vector.lerp(createVector(192, 192, 192), createVector(16, 164, 64), (k + 1) / 3)
    fill(color.x, color.y, color.z)
    beginShape();
    for (let i = 0; i < current_line.length; i++) {
      vertex(current_line[i].x, current_line[i].y)
    }
    vertex(width, height)
    vertex(0, height)
    endShape(CLOSE)
  }
}

function perp(l, p, m)
{
  let normalized = l[1].copy().sub(l[0]).setMag(1)
  if (Math.random() < 0.5) {
    normalized.rotate(-HALF_PI)
  } else {
    normalized.rotate(HALF_PI)
  }
  normalized.setMag(m)
  return p.copy().add(normalized)
}

function fracture_line(l) {
  let offset = Math.random() * 0.2 - 0.1 + 0.5
  
  let midPoint = p5.Vector.lerp(l[0], l[1], offset)
  
  midPoint = perp(l, midPoint, p5.Vector.dist(l[0], l[1]) / 10.0 * Math.random())
  
  return [l[0], midPoint, l[1]]
}

function draw() {
  noLoop()
}