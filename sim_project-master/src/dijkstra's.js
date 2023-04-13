class Node {
    constructor(name, x, y) {
      this.name = name;
      this.x = x;
      this.y = y;
      this.connections = [];
    }
  
    addConnection(node, weight) {
      this.connections.push([node, weight]);
      node.connections.push([this, weight]);
    }
  }
  
  class Graph {
    constructor(nodes) {
      this.nodes = nodes;
    }
  
    dijkstra(startNode, endNode) {
      const dist = {};
      const visited = {};
      const previous = {};
      const queue = [];
  
      for (let node of this.nodes) {
        dist[node.name] = Infinity;
        visited[node.name] = false;
        previous[node.name] = null;
      }
  
      dist[startNode.name] = 0;
      queue.push(startNode);
  
      while (queue.length > 0) {
        let current = null;
        let minDist = Infinity;
  
        for (let node of queue) {
          if (dist[node.name] < minDist && !visited[node.name]) {
            current = node;
            minDist = dist[node.name];
          }
        }
  
        if (current === endNode) {
          let path = [];
          while (current !== null) {
            path.unshift(current.name);
            current = previous[current.name];
          }
          return path;
        }
  
        queue.splice(queue.indexOf(current), 1);
        visited[current.name] = true;
  
        for (let [neighbor, weight] of current.connections) {
          let alt = dist[current.name] + weight;
          if (alt < dist[neighbor.name]) {
            dist[neighbor.name] = alt;
            previous[neighbor.name] = current;
            queue.push(neighbor);
          }
        }
      }
  
      return null;
    }
  }
  
  // create nodes
  const node1 = new Node("Node 1", 0.4, 0.5);
  const node2 = new Node("Node 2", 0.6, 0.8);
  const node3 = new Node("Node 3", 0.2, 0.7);
  const node4 = new Node("Node 4", 0.2, 0.4);
  
  // add connections
  node1.addConnection(node2, 1);
  node1.addConnection(node3, 1);
  node2.addConnection(node3, 1);
  node3.addConnection(node4, 1)
  
  // create graph
  const graph = new Graph([node1, node2, node3]);
  
  // find shortest path
  const shortestPath = graph.dijkstra(node1, node2);
  
  console.log(shortestPath); // output: ["Node 1", "Node 2"]
  