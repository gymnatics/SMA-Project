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
  
    precomputeDijkstra() {
        this.shortestPaths = {};
      
        for (let i = 0; i < this.nodes.length; i++) {
          const startNode = this.nodes[i];
          const distances = {};
          const visited = {};
          const previous = {};
      
          // Initialize distances to infinity and visited to false for all nodes
          for (let node of this.nodes) {
            distances[node.id] = Infinity;
            visited[node.id] = false;
          }
      
          // Distance to start node is 0
          distances[startNode.id] = 0;
      
          while (true) {
            // Find the unvisited node with the smallest distance
            let smallestDistance = Infinity;
            let current = null;
            for (let node of this.nodes) {
              if (!visited[node.id] && distances[node.id] < smallestDistance) {
                current = node;
                smallestDistance = distances[node.id];
              }
            }
      
            if (current === null) {
              // All nodes have been visited
              break;
            }
      
            // Mark the current node as visited
            visited[current.id] = true;
      
            // Update distances to neighbors
            for (let edge of current.connections) {
              const neighbor = edge[0];
              const distance = edge[1];
              const totalDistance = distances[current.id] + distance;
              if (totalDistance < distances[neighbor.id]) {
                distances[neighbor.id] = totalDistance;
                previous[neighbor.id] = current.id;
              }
            }
          }
      
          // Store the shortest paths for the current start node
          for (let node of this.nodes) {
            if (node.id !== startNode.id) {
              const path = [node.id];
              let prev = previous[node.id];
              while (prev !== undefined) {
                path.unshift(prev);
                prev = previous[prev];
              }
              this.shortestPaths[startNode.id + "-" + node.id] = path;
            }
          }
        }
      
        console.log("Dijkstra precomputation done");
        console.log(path);
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
  node3.addConnection(node4, 1);
  
  // create graph
  const graph = new Graph([node1, node2, node3, node4]);
  
  // find shortest path
  const shortestPath = graph.precomputeDijkstra();
  
//   console.log(shortestPath); // output: ["Node 1", "Node 2"]
  