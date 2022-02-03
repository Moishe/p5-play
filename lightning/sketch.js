let dimension = 256
let nodes = []

let queue = [[[Math.floor(dimension / 2), 0], []]]
let goal = [Math.floor(dimension / 2), dimension - 1]
let goal_range = 25
let neighbor_density = 0.4

let visited = new Set()

function setup() {
  createCanvas(512, 512);

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
    }
    nodes.push(row)
  }
  background(0);
}

function light_up(node, color) {
  let node_width = width / dimension
  let node_height = height / dimension
  noStroke()
  fill(color)
  let x = node[0] * node_width
  let y = node[1] * node_height
  rect(x, y, node_width, node_height)
}

function make_key(node) {
  let key = node[0] * dimension + node[1]
  return key
}

function make_node(key) {
  return [[Math.floor(key / dimension)], [key % dimension]]
}

function draw() {
  fill(0, 0, 0, 8)
  rect(0, 0, width, height)
  for (let j = 0; j < 1000; j++) {
    let cur = queue.shift()
    if (!cur) {
      console.log("couldn't find it I guess?")
      noLoop()
      return
    }
    let cur_node = cur[0]
    let cur_path = cur[1]
    if ((cur_node[0] >= goal[0] - goal_range &&
         cur_node[0] <= goal[0] + goal_range) &&
        (cur_node[1] >= goal[1] - goal_range &&
         cur_node[1] <= goal[1] + goal_range)) {
      console.log('found!')
      noLoop()
      for (let i = 0; i < cur_path.length; i++) {
        let node = make_node(cur_path[i])
        light_up(node, 'yellow')
      }
    }
    visited.add(make_key(cur_node))
    light_up(cur_node, 'blue')
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
}