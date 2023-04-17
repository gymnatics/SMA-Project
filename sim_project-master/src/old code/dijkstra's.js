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
  

const PQtop = 0;
const PQparent = i => ((i + 1) >>> 1) - 1;
const PQleft = i => (i << 1) + 1;
const PQright = i => (i + 1) << 1;
class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
      this._heap = [];
      this._comparator = comparator;
      this.howmany = 0
    }
    size() {
      return this._heap.length;
    }
    isEmpty() {
      return this.size() == 0;
    }
    peek() {
      return this._heap[PQtop];
    }
    push(...values) {
      values.forEach(value => {
        this._heap.push(value);
        this._siftUp();
      });
      return this.size();
    }
    pop() {
      const poppedValue = this.peek();
      const bottom = this.size() - 1;
      if (bottom > PQtop) {
        this._swap(PQtop, bottom);
      }
      this._heap.pop();
      this._siftDown();
      return poppedValue;
    }
    replace(value) {
      const replacedValue = this.peek();
      this._heap[PQtop] = value;
      this._siftDown();
      return replacedValue;
    }
    _smaller(i, j) {
      return this._comparator(this._heap[j], this._heap[i]);
    }
    _swap(i, j) {
      [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
      let node = this.size() - 1;
      while (node > PQtop && this._smaller(node, PQparent(node))) {
        this._swap(node, PQparent(node));
        node = PQparent(node);
      }
    }
    _siftDown() {
      let node = PQtop;
      while (
        (PQleft(node) < this.size() && this._smaller(PQleft(node), node)) ||
        (PQright(node) < this.size() && this._smaller(PQright(node), node))
      ) {
        let minChild = (PQright(node) < this.size() && this._smaller(PQright(node), PQleft(node))) ? PQright(node) : PQleft(node);
        this._swap(node, minChild);
        node = minChild;
      }
    }
}

class Graph {
    constructor(nodes) {
      this.nodes = nodes;
      this.dist = {};
      this.parent = {};
    }
    initialize_single_source(startNode){
    
        for (let node of this.nodes) {
          this.dist[node.name] = Infinity;
          this.parent[node.name] = null;
        }
    
        this.dist[startNode.name] = 0;
    }

    relax(u,v,w){
        if (this.dist[u.name]+ w < this.dist[v.name]){
            this.dist[v.name] = this.dist[u.name] + w;
            this.parent[v.name] = u;
        }
    }
    dijkstra(startNode) {
        this.initialize_single_source(startNode)
        const S = new Set();
        const Q = new PriorityQueue((a, b) => this.dist[a.name] < this.dist[b.name]);
        Q.push(startNode);
        while (!Q.isEmpty()){
           let u = Q.pop();
           S.add(u);
           for (let [v,weight] of u.connections){
               this.relax(u,v,weight);
               if (!S.has(v)){
                Q.push(v);
               }
           }
        }
    }
    getShortestPath(startNode, endNode) {
        this.dijkstra(startNode);
        const parent = this.parent;
        const path = [endNode];
        let current = endNode;
    
        while (current !== startNode) {
          if (!parent[current.name]) {
            return null; // no path exists
          }
          path.unshift(parent[current.name]);
          current = parent[current.name];
        }
        return path;
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
 const graph = new Graph([node1, node2, node3, node4]);
 
 // find shortest path
 graph.dijkstra(node1);
 console.log(graph.getShortestPath(node1,node4));






