class Graph {
    constructor() {
      this.nodes = [];
      this.edges = [];
      this.shortestPaths = null;
    }
  
    addNode(node) {
      this.nodes.push(node);
    }
  
    addEdge(node1, node2, weight) {
      this.edges.push([node1, node2, weight]);
    }
  
    computeShortestPaths() {
      const N = this.nodes.length;
      this.shortestPaths = [];
      for (let i = 0; i < N; i++) {
        let row = [];
        for (let j = 0; j < N; j++) {
          row.push(Infinity);
        }
        this.shortestPaths.push(row);
        this.shortestPaths[i][i] = 0;
      }
      for (let [u, v, w] of this.edges) {
        let i = this.nodes.indexOf(u);
        let j = this.nodes.indexOf(v);
        this.shortestPaths[i][j] = w;
      }
      for (let k = 0; k < N; k++) {
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            if (this.shortestPaths[i][j] > this.shortestPaths[i][k] + this.shortestPaths[k][j]) {
              this.shortestPaths[i][j] = this.shortestPaths[i][k] + this.shortestPaths[k][j];
            }
          }
        }
      }
    }
  
    findShortestPath(node1, node2) {
      if (!this.shortestPaths) {
        this.computeShortestPaths();
      }
      let i = this.nodes.indexOf(node1);
      let j = this.nodes.indexOf(node2);
      let path = [];
      if (this.shortestPaths[i][j] === Infinity) {
        return null;
      }
      while (i !== j) {
        let k = this.next[i][j];
        path.push(this.nodes[k]);
        i = k;
      }
      return path;
    }
}

class Agent {
    constructor(startNode, endNode, shortestPath) {
      this.currentNode = startNode;
      this.endNode = endNode;
      this.shortestPath = shortestPath;
      this.radius = 10;
      this.color = 'blue';
      this.isMoving = false;
      this.speed = 2;
      this.targetNode = null;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.currentNode.x, this.currentNode.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  
    async move() {
      if (this.isMoving) {
        return;
      }
  
      if (this.currentNode === this.endNode) {
        return;
      }
  
      this.isMoving = true;
      this.targetNode = this.shortestPath.shift();
      const dx = this.targetNode.x - this.currentNode.x;
      const dy = this.targetNode.y - this.currentNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = distance / this.speed;
      const stepX = dx / steps;
      const stepY = dy / steps;
  
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        this.currentNode.x += stepX;
        this.currentNode.y += stepY;
      }
  
      this.currentNode = this.targetNode;
      this.isMoving = false;
    }
  }
  
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  
  const node1 = { x: 100, y: 100 };
  const node2 = { x: 200, y: 200 };
  const node3 = { x: 300, y: 100 };
  
  const shortestPath = [node1, node2, node3];
  
  const agent = new Agent(node1, node3, shortestPath);
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    agent.draw(ctx);
    requestAnimationFrame(draw);
  }
  
  draw();
  
  

  