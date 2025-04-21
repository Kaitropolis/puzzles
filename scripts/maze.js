class Maze {
  constructor() {
    this.container = document.getElementById("game-container")
    this.rows = 15
    this.cols = 15
    this.graph = []

    this.createGraph()
    this.createMaze()
  }

  createGraph() {
    let vertex = 0

    for (let row = 0; row < this.rows; ++row) {
      const rowEl = document.createElement("tr")

      for (let col = 0; col < this.cols; ++col) {
        this.graph.push([])
        this.setVertexNeighbours(row, col, vertex)

        const vertexEl = document.createElement("td")
        vertexEl.id = vertex.toString()
        vertexEl.className =
          "text-center w-[30px] h-[30px] text-sm border-t-8 border-b-8 border-l-8 border-r-8 border-gray-300 text-white font-semibold"

        //vertexEl.innerText = vertex;
        rowEl.appendChild(vertexEl)
        vertex++
      }

      this.container.appendChild(rowEl)
    }
  }

  setVertexNeighbours(row, col, vertex) {
    const neighbours = []

    const up = row > 0 ? vertex - this.cols : null
    const down = row < this.rows - 1 ? vertex + this.cols : null
    const left = col > 0 ? vertex - 1 : null
    const right = col < this.cols - 1 ? vertex + 1 : null

    if (up !== null) neighbours.push(up)
    if (down !== null) neighbours.push(down)
    if (left !== null) neighbours.push(left)
    if (right !== null) neighbours.push(right)

    this.graph[vertex] = neighbours
  }

  async createMaze() {
    const path = this.dfs()
    // Example Path
    // [
    //   [0, 3],
    //   [3, 4],
    //   [4, 5],
    //   [5, 2],
    //   [2, 1],
    //   [5, 8],
    //   [8, 7],
    //   [7, 6],
    // ];

    for (let i = 0; i < path.length; ++i) {
      await this.sleep(50)

      const [from, to] = path[i]
      const fromEl = document.getElementById(from.toString())
      const toEl = document.getElementById(to.toString())

      if (from === 0) {
        //fromEl.classList.remove("border-l-8");
        fromEl.classList.add("bg-green-400")
      } else if (to === this.rows * this.cols - 1) {
        //toEl.classList.remove("border-r-8");
        toEl.classList.add("bg-red-400")
      } else {
        fromEl.classList.add("bg-blue-400")
        toEl.classList.add("bg-blue-400")
      }

      if (from - this.cols === to) {
        fromEl.classList.remove("border-t-8")
        toEl.classList.remove("border-b-8")
      } else if (from + this.cols === to) {
        fromEl.classList.remove("border-b-8")
        toEl.classList.remove("border-t-8")
      } else if (from - 1 === to) {
        fromEl.classList.remove("border-l-8")
        toEl.classList.remove("border-r-8")
      } else if (from + 1 === to) {
        fromEl.classList.remove("border-r-8")
        toEl.classList.remove("border-l-8")
      }
    }
  }

  /* 
    Use depth first search to create a connected path through the maze and explore all vertices.
    We must also track both the vertex being travelled from and the one being travelled to. The
    'to' vertex is always an unvisited neighbour of the 'from' vertex, which allows us to identify
    which vertex each neighbour is connected to. This is important for creating an accessible path
    by connecting vertices from the start to the end of the maze. Our method of connecting vertices
    is achieved by removing the walls that separate them.
    
    The order of the path being returned represents the order in which each vertex was visited and
    just relying on this to connect vertices is problematic in the event that a dead-end is reached
    and we backtrack to a previous vertex non-adjacent to the one we just visited. So instead we can 
    connect the 'from' and 'to' vertices, thus continuing the connected path through the maze despite 
    hitting a dead-end.
  */
  dfs() {
    const stack = [[null, 0]] // Track 'from' and 'to' vertices
    const visited = new Set()
    const path = []

    while (stack.length > 0) {
      const [fromVertex, toVertex] = stack.pop()

      if (!visited.has(toVertex)) {
        if (fromVertex !== null) path.push([fromVertex, toVertex])
        visited.add(toVertex)
      }

      const unvisitedNeighbours = this.shuffle(this.graph[toVertex]).filter(
        (v) => !visited.has(v)
      )

      for (const neighbour of unvisitedNeighbours) {
        stack.push([toVertex, neighbour])
      }
    }

    return path
  }

  shuffle(array) {
    const copy = [...array]
    let currentIndex = copy.length

    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      ;[copy[currentIndex], copy[randomIndex]] = [
        copy[randomIndex],
        copy[currentIndex],
      ]
    }

    return copy
  }

  sleep = (ms) => new Promise((r) => setTimeout(r, ms))
}

new Maze()
