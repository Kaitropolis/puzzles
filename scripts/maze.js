class Maze {
  constructor() {
    this.events();
  }

  events() {
    document
      .getElementById("start-btn")
      .addEventListener("click", this.createMaze.bind(this));
  }

  createMaze() {
    console.log("start", this);
  }
}

new Maze();
