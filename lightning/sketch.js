let dimension = 1024
let nodes = []

let queue = [[[Math.floor(dimension / 2), 0], []]]
let goal = [Math.floor(dimension / 2), dimension - 1]
let goal_range = 50
let neighbor_density = 0.3

let visited = new Set()

let capturer
let save_animation = false
let animation_frames = 320

let strikes = []

function shuffle_arr(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function initialize_board() {
  nodes = []
  for (let i = 0; i < dimension; i++) {
    let row = []
    for (let j = 0; j < dimension; j++) {
      let neighbors = []
      for (let ii = max(0, i - 1); ii <= min(dimension - 1, i + 1); ii++) {
        for (let jj = max(0, j - 1); jj <= min(dimension - 1, j + 1); jj++) {
          if (ii == i && jj == j) {
            continue
          }
          if (Math.random() < neighbor_density) {
            neighbors.push([ii, jj])
          }
        }
      }
      row.push(neighbors)
      //row.push(shuffle_arr(neighbors))
    }
    nodes.push(row)
  }
}

function setup() {
  createCanvas(dimension, dimension)
  background(0)

  if (save_animation) {
    capturer = new CCapture( { format: 'png' } );
  }

  initialize_board()
}

let radius = 5

function light_up(node, c) {
  let node_width = width / dimension
  let node_height = height / dimension
  noStroke()
  fill(c)
  let x = node[0] * node_width
  let y = node[1] * node_height
  rect(x, y, node_width, node_height)
}

function make_key(node) {
  let key = node[0] * dimension + node[1]
  return key
}

function make_node(key) {
  return [Math.floor(key / dimension), key % dimension]
}

function draw_lightning(path) {
  for (let i = 0; i < path.length; i++) {
    let node = make_node(path[i])
    for ()
  }
}

let frame = 0
function draw() {
  if (frame == 0 && save_animation) {
    capturer.start()
  }

  fill(0, 0, 0, 32)
  rect(0, 0, width, height)
  if (strikes.length && Math.random() < 0.4) {
    let index = Math.floor(Math.random() * strikes.length)
    let cur_path = strikes[index]
    strikes.splice(index, 1)
    draw_lightning(cur_path)
  }
  for (let j = 0; j < 8192; j++) {
    let cur = queue.shift()
    if (!cur) {
      console.log("not found, re-trying")
      queue = [[[Math.floor(dimension / 2), 0], []]]
      initialize_board()
      neighbor_density += 0.1
      break
    }
    let cur_node = cur[0]
    let cur_path = cur[1]
    if ((cur_node[0] >= goal[0] - goal_range &&
         cur_node[0] <= goal[0] + goal_range) &&
        (cur_node[1] == goal[1])) {
      strikes.push(cur_path)
    }
    visited.add(make_key(cur_node))
    light_up(cur_node, color(0, 0, 255))
    let node = nodes[cur_node[0]][cur_node[1]]
    for (let i = 0; i < node.length; i++) {
      let key = make_key(node[i])

      if (!visited.has(key)) {
        let new_path = [...cur_path]
        new_path.push(key)
        queue.push([node[i], new_path])
        visited.add(key)
      }
    }
  }

  if (frame == animation_frames && save_animation) {
    noLoop()
    capturer.stop()
    capturer.save()
  }

  if (save_animation) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }

  frame += 1
}