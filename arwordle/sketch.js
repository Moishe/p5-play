let actors = []
let max_actors = 10000
let next_free = -1
let seed_actors = 500
let max_life = 255
let circle_position = 0

let img;
function preload() {
  img = loadImage('CowrittenLogogram1.jpeg');
}

function sigmoid(t) {
    return 1 / (1 + Math.pow(Math.E, -t));
}

let offset = 64

function arcLine(a) {
  let begin_x = cos(a) * 96 + 256 + offset
  let begin_y = sin(a) * 96 + 256 + offset
  let end_x = cos(a) * 256 + 256 + offset
  let end_y = sin(a) * 256 + 256 + offset
  line(begin_x, begin_y, end_x, end_y)
}

function drawSegment(segment_idx) {
  let begin = segment_idx * PI / 2.5 + PI / 30
  let end = (segment_idx + 1) * PI / 2.5
  noFill()
  for (let i = 192; i < 512; i++) {
    arc(256 + offset, 256 + offset, i, i, begin, end)
  }

  stroke(0)
  arc(256 + offset, 256 + offset, 192, 192, begin, end)
  arc(256 + offset, 256 + offset, 512, 512, begin, end)

  arcLine(begin)
  arcLine(end)
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  stroke(0x6A, 0xAA, 0x64, 256)
  drawSegment(2)
  stroke(0x6A, 0xAA, 0x64, 256)
  drawSegment(3)

  stroke(0xC9, 0xB4, 0x58, 256)
  drawSegment(0)

  tint(255, 127);  
  image(img, offset, offset);

  /*  
  for (let i = 0; i < seed_actors; i++) {
    let a = (i / seed_actors) * PI * 2
    actors[i] = {
      x: cos(a) * windowWidth / 4 + windowWidth / 2,
      y: sin(a) * windowWidth / 4 + windowHeight / 2,
      d: Math.random() * PI * 2,
      v: 0,
      l: Math.random() * 50 + 100,
      active: true,
      color: 'black',
      next_free: -1
    }
  }
  for (let i = seed_actors; i < max_actors; i++) {
    actors[i] = {
      next_free: i == max_actors - 1 ? -1 : i + 1,
      active: false
    }
  }
  next_free = seed_actors
*/
}

let next_millis = 0
function draw() {
  /*
  if (millis() > next_millis) {
    next_millis = millis() + 100
  } else {
    return
  }
  //background(255); 
  strokeWeight(0.1)
  for (let i = 0; i < actors.length; i++) {
    if (!actors[i].active) {
      continue
    }
    stroke(0, 0, 0, actors[i].l)
    point(actors[i].x, actors[i].y)
    
    actors[i].x += cos(actors[i].d) * actors[i].v
    actors[i].y += sin(actors[i].d) * actors[i].v
    
    actors[i].v = sigmoid(actors[i].v + 0.1) * (0.0001 * i % 100)
    actors[i].d += (Math.random() - 0.5) * 0.1
    
    actors[i].l -= 1
    
    if (actors[i].l <= 0) {
      actors[i].next_free = next_free
      actors[i].active = false
      next_free = i
    } else if (i % 100 == 0 && next_free != -1) {
      temp_next_free = next_free
      next_free = actors[next_free].next_free      
      actors[temp_next_free] = {
        x: actors[i].x,
        y: actors[i].y,
        v: 0,
        d: Math.random() * Math.PI * 2,
        l: Math.random() * 50 + 100,
        color: 'red',
        active: true,
        next_free: -1
      }
    }
  }
  */
  /*
  //console.log(actors)
    
  strokeWeight(1)
  stroke(0)
  text(next_free, 20, 20)
  text(next_millis, 40, 20)
  //noLoop()
  */
}