class Maze {
  constructor() {
    this.container = document.getElementById("game-container");
    this.rows = 25;
    this.cols = 50;
    this.graph = [];
    this.bulletLifetime = 10; // Steps
    this.robber = {
      vertex: null,
      vertexEl: null,
      colour: "bg-gray-400",
      canTeleport: true,
      canTeleportOtherPlayer: true,
      canShoot: false,
      direction: null,
    };
    this.cop = {
      vertex: null,
      vertexEl: null,
      colour: "bg-blue-500",
      canTeleport: false,
      canTeleportOtherPlayer: false,
      canShoot: true,
      direction: null,
    };
    this.copBullet = {
      vertex: null,
      vertexEl: null,
      colour: "bg-yellow-600",
      direction: null,
      lifetime: this.bulletLifetime,
      isMissile: false,
    };

    this.init();
  }

  async init() {
    this.createGraph();
    await this.createMaze();
    this.startGame();
    //await this.sleep(1000);
    //await this.traverseMaze();
  }

  createGraph() {
    let vertex = 0;

    for (let row = 0; row < this.rows; ++row) {
      const rowEl = document.createElement("tr");

      for (let col = 0; col < this.cols; ++col) {
        this.graph.push([]);
        this.setVertexNeighbours(row, col, vertex);

        const vertexEl = document.createElement("td");
        vertexEl.id = vertex.toString();
        vertexEl.className =
          "text-center w-[25px] h-[25px] text-sm border-t-6 border-b-6 border-l-6 border-r-6 border-gray-300 text-white font-semibold";
        vertexEl.innerHTML = '<div class="w-[12px] h-[12px]"></div>';

        //vertexEl.innerText = vertex;
        rowEl.appendChild(vertexEl);
        vertex++;
      }

      this.container.appendChild(rowEl);
    }
  }

  setVertexNeighbours(row, col, vertex) {
    const neighbours = [];

    const up = row > 0 ? vertex - this.cols : null;
    const down = row < this.rows - 1 ? vertex + this.cols : null;
    const left = col > 0 ? vertex - 1 : null;
    const right = col < this.cols - 1 ? vertex + 1 : null;

    if (up !== null) neighbours.push(up);
    if (down !== null) neighbours.push(down);
    if (left !== null) neighbours.push(left);
    if (right !== null) neighbours.push(right);

    this.graph[vertex] = neighbours;
  }

  async createMaze() {
    const path = this.createMazeDfs();
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
      await this.sleep(1);

      const [from, to] = path[i];
      const fromEl = document.getElementById(from.toString());
      const toEl = document.getElementById(to.toString());

      if (from === 0) {
        fromEl.classList.add("bg-green-400");
      } else if (to === this.rows * this.cols - 1) {
        toEl.classList.add("bg-red-400");
      } else {
        fromEl.classList.add("bg-blue-400");
        toEl.classList.add("bg-blue-400");
      }

      let isFromAndToAdjacent = false;
      if (from - this.cols === to) {
        fromEl.classList.remove("border-t-6");
        toEl.classList.remove("border-b-6");
        isFromAndToAdjacent = true;
      } else if (from + this.cols === to) {
        fromEl.classList.remove("border-b-6");
        toEl.classList.remove("border-t-6");
        isFromAndToAdjacent = true;
      } else if (from - 1 === to) {
        fromEl.classList.remove("border-l-6");
        toEl.classList.remove("border-r-6");
        isFromAndToAdjacent = true;
      } else if (from + 1 === to) {
        fromEl.classList.remove("border-r-6");
        toEl.classList.remove("border-l-6");
        isFromAndToAdjacent = true;
      }

      if (isFromAndToAdjacent) {
        if (i === 0) {
          this.graph[from] = [to];
        } else {
          this.graph[from].push(to);
        }

        this.graph[to] = [from];
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
  createMazeDfs() {
    const stack = [[null, 0]]; // Track 'from' and 'to' vertices
    const visited = new Set();
    const path = [];

    while (stack.length > 0) {
      const [fromVertex, toVertex] = stack.pop();

      if (!visited.has(toVertex)) {
        if (fromVertex !== null) path.push([fromVertex, toVertex]);
        visited.add(toVertex);
      }

      const unvisitedNeighbours = this.shuffle(this.graph[toVertex]).filter(
        (v) => !visited.has(v)
      );

      for (const neighbour of unvisitedNeighbours) {
        stack.push([toVertex, neighbour]);
      }
    }

    return path;
  }

  shuffle(array) {
    const copy = [...array];
    let currentIndex = copy.length;

    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [copy[currentIndex], copy[randomIndex]] = [
        copy[randomIndex],
        copy[currentIndex],
      ];
    }

    return copy;
  }

  async traverseMaze() {
    const path = this.dfs();

    for (const vertex of path) {
      await this.sleep(50);
      const vertexEl = document.getElementById(vertex.toString());

      vertexEl.classList.forEach((cls) => {
        if (cls.startsWith("bg-")) {
          vertexEl.classList.remove(cls);
        }
      });

      vertexEl.classList.add("bg-blue-500");
    }
  }

  dfs() {
    const path = [];
    const visited = new Set();
    const stack = [0];

    while (stack.length > 0) {
      const vertex = stack.pop();

      if (!visited.has(vertex)) {
        path.push(vertex);
        visited.add(vertex);

        if (vertex === this.rows * this.cols - 1) return path;
      }

      const unvisitedNeighbours = this.graph[vertex].filter(
        (v) => !visited.has(v)
      );

      for (const neighbour of unvisitedNeighbours) {
        stack.push(neighbour);
      }
    }

    return path;
  }

  startGame() {
    this.addPlayers();
    this.addPlayerEvents();

    setInterval(this.gameLoop.bind(this), 250);
  }

  gameLoop() {
    // Bullets
    if (this.copBullet.lifetime === 0) {
      this.removeBulletPermanent(this.copBullet);
      this.cop.canShoot = true;
    } else if (Number.isFinite(this.copBullet.vertex)) {
      const moved = this.tryMoveBullet(
        this.copBullet,
        this.nextVertexInDirection(
          this.copBullet.vertex,
          this.copBullet.direction
        ),
        this.copBullet.direction
      );

      if (!moved) {
        this.removeBulletPermanent(this.copBullet);
        this.cop.canShoot = true;
      }

      this.copBullet.lifetime--;
    }

    if (this.copBullet.vertex === this.robber.vertex) {
      this.removePlayerPermanent(this.robber);
    }
  }

  addPlayers() {
    const vertex = Math.floor(Math.random() * (this.rows * this.cols));
    this.insertPlayer(this.robber, 0);
    this.insertPlayer(this.cop, vertex);
  }

  insertPlayer(player, vertex) {
    const vertexEl = document.getElementById(vertex.toString());

    vertexEl.innerHTML = `<div class="flex justify-center items-center">
        <div class="w-[12px] h-[12px] ${player.colour}"></div>
      </div>`;

    player.vertex = vertex;
    player.vertexEl = vertexEl;
  }

  removePlayer(player) {
    player.vertexEl.innerHTML = '<div class="w-[12px] h-[12px]"></div>';
  }

  removePlayerPermanent(player) {
    this.removePlayer(player);
    player.vertex = null;
  }

  tryMovePlayer(player, otherPlayer, vertex, direction, isTeleporting) {
    if (vertex < 0 || vertex >= this.rows * this.cols) return false;
    if (isTeleporting) return this.movePlayer(player, vertex, direction);

    // Attempt to move one space beyond the player in the current direction
    if (vertex === otherPlayer.vertex) {
      vertex = this.nextVertexInDirection(vertex, direction);

      if (this.graph[otherPlayer.vertex].includes(vertex)) {
        this.movePlayer(player, vertex, direction);
      }

      return;
    }

    if (this.graph[player.vertex].includes(vertex)) {
      this.movePlayer(player, vertex, direction);
    }
  }

  movePlayer(player, vertex, direction) {
    this.removePlayer(player);
    this.insertPlayer(player, vertex);
    player.direction = direction;
  }

  tryPlayerTeleport(player, otherPlayer) {
    player.canTeleport = false;
    const vertex = Math.floor(Math.random() * (this.rows * this.cols));
    this.tryMovePlayer(player, otherPlayer, vertex, "right", true);
  }

  tryOtherPlayerTeleport(player, otherPlayer) {
    player.canTeleportOtherPlayer = false;
    const vertex = Math.floor(Math.random() * (this.rows * this.cols));
    this.tryMovePlayer(otherPlayer, player, vertex, "right", true);
  }

  tryPlayerShoot(player, bullet, isMissile) {
    if (!player.direction) return;

    const nextVertex = this.nextVertexInDirection(
      player.vertex,
      player.direction
    );

    if (!this.graph[player.vertex].includes(nextVertex)) return;

    player.canShoot = false;
    player.lifetime = isMissile ? 100 : 30;
    bullet.isMissile = isMissile;

    this.insertBullet(bullet, nextVertex, player.direction);
  }

  insertBullet(bullet, vertex, direction) {
    const vertexEl = document.getElementById(vertex.toString());

    vertexEl.innerHTML = `<div class="flex justify-center items-center rounded-full">
        <div class="w-[8px] h-[8px] ${bullet.colour}"></div>
      </div>`;

    bullet.vertex = vertex;
    bullet.vertexEl = vertexEl;
    bullet.lifetime = this.bulletLifetime;
    bullet.direction = direction;
  }

  removeBullet(bullet) {
    bullet.vertexEl.innerHTML = '<div class="w-[12px] h-[12px]"></div>';
  }

  removeBulletPermanent(bullet) {
    this.removeBullet(bullet);
    bullet.vertex = null;
  }

  tryMoveBullet(bullet, vertex, direction) {
    if (this.isVertexOutOfBounds(vertex, direction) && !bullet.isMissile)
      return false;

    if (!bullet.isMissile) {
      this.moveBullet(bullet, vertex, direction);
      return true;
    }

    if (this.graph[bullet.vertex].includes(vertex)) {
      this.moveBullet(bullet, vertex, direction);
      return true;
    }

    const directions = this.validMissileTurnDirections(direction);

    while (directions.length > 0) {
      const index = Math.floor(Math.random() * directions.length);
      const randomDirection = directions[index];
      directions.splice(index, 1);

      const nextVertex = this.nextVertexInDirection(
        bullet.vertex,
        randomDirection
      );

      if (this.graph[bullet.vertex].includes(nextVertex)) {
        this.moveBullet(bullet, nextVertex, randomDirection);
        return true;
      }
    }

    return false;
  }

  // Check if the next vertex in the given direction is out of bounds
  isVertexOutOfBounds(vertex, direction) {
    const row = Math.floor(vertex / this.cols);
    const col = vertex % this.cols;

    if (row < 0) return true;
    if (row > this.rows - 1) return true;
    if (col === this.cols - 1 && direction === "left") return true;
    if (col === 0 && direction === "right") return true;

    return vertex < 0 || vertex >= this.rows * this.cols;
  }

  validMissileTurnDirections(direction) {
    if (direction === "up" || direction === "down") {
      return ["left", "right"];
    }

    return ["up", "down"];
  }

  moveBullet(bullet, vertex, direction) {
    this.removeBullet(bullet);
    this.insertBullet(bullet, vertex, direction);
  }

  addPlayerEvents() {
    document.addEventListener("keydown", this.onKeydown.bind(this));
  }

  nextVertexInDirection(vertex, direction) {
    switch (direction) {
      case "up":
        return vertex - this.cols;
      case "down":
        return vertex + this.cols;
      case "left":
        return vertex - 1;
      case "right":
        return vertex + 1;
      default:
        return;
    }
  }

  onKeydown(e) {
    const validKeys = [
      "w",
      "s",
      "a",
      "d",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "r",
      "Enter",
      "p",
    ];

    if (validKeys.includes(e.key)) {
      e.preventDefault();
    }

    // Robber movement
    if (Number.isFinite(this.robber.vertex)) {
      if (e.key === "w") {
        this.tryMovePlayer(
          this.robber,
          this.cop,
          this.robber.vertex - this.cols,
          "up"
        );
      } else if (e.key === "s") {
        this.tryMovePlayer(
          this.robber,
          this.cop,
          this.robber.vertex + this.cols,
          "down"
        );
      } else if (e.key === "a") {
        this.tryMovePlayer(
          this.robber,
          this.cop,
          this.robber.vertex - 1,
          "left"
        );
      } else if (e.key === "d") {
        this.tryMovePlayer(
          this.robber,
          this.cop,
          this.robber.vertex + 1,
          "right"
        );
      }
    }

    // Cop movement
    if (Number.isFinite(this.cop.vertex)) {
      if (e.key === "ArrowUp") {
        this.tryMovePlayer(
          this.cop,
          this.robber,
          this.cop.vertex - this.cols,
          "up"
        );
      } else if (e.key === "ArrowDown") {
        this.tryMovePlayer(
          this.cop,
          this.robber,
          this.cop.vertex + this.cols,
          "down"
        );
      } else if (e.key === "ArrowLeft") {
        this.tryMovePlayer(this.cop, this.robber, this.cop.vertex - 1, "left");
      } else if (e.key === "ArrowRight") {
        this.tryMovePlayer(this.cop, this.robber, this.cop.vertex + 1, "right");
      }
    }

    // Robber Abilities
    if (e.key === " " && this.robber.canTeleport) {
      this.tryPlayerTeleport(this.robber, this.cop);
    } else if (e.key === "r" && this.robber.canTeleportOtherPlayer) {
      this.tryOtherPlayerTeleport(this.robber, this.cop);
    }

    // Cop Abilities
    if (this.cop.canShoot) {
      if (e.key === "Enter") {
        this.tryPlayerShoot(this.cop, this.copBullet, false);
      } else if (e.key === "p") {
        this.tryPlayerShoot(this.cop, this.copBullet, true);
      }
    }
  }

  sleep = (ms) => new Promise((r) => setTimeout(r, ms));
}

new Maze();
