// constants
const WIDTH = 800;
const HEIGHT = 600;

const AGENT_RADIUS = 7;
const NODE_RADIUS = 10;

const NODE_TYPES = ["junc", "ride_a","ride_b", "entrance"];

// display information parameters
const DISPLAY_HEIGHT = 175;
const DISPLAY_WIDTH = 150;
const HOVER_RADIUS = 300;

const MAX_RIDE_SAMPLES = 100; // keep up to this amount of queue-data
const RIDE_SAMPLE_UPDATE_FREQ = 0.1 // update the graph every x seconds

const RG_X_START = 20;
const RG_X_END = 120;
const RG_Y_START = 135;
const RG_Y_END = 185;

// global stats parameters
const STATS_WIDTH = 400;
const STATS_HEIGHT = 200;

const MAX_AGT_SAMPLES = 200; // keep up to this amount of agent-data
const AGT_SAMPLE_UPDATE_FREQ = 0.5  // update the graphs every x seconds

const GG_HEIGHT = 50;
const GG_WIDTH = 100;

// simulation parameters
const ARRIVAL_PROB = 0.2;

// const CROWD_TURNAWAY_PROB = 0.9; // have x chance of leaving if the crowds are high
// const CROWD_DEPARTURE_PROB = 0.4; // leaving if the crowds are high (after actually entering)
const RIDES_FOR_SATISFACTION = 0.8; // ride at least x * the number of rides available
const MAX_SATISFACTION = 200; // leaving once the agent is satisfied
const DEPARTURE_PROB = 0.05; // low chance to leave for whatever other reason

const TOLERANCE_PROB = 0.3; // proportion of all visitors that are tolerant


const MOVE_SPEED = 100; // moves x units per second

// resources and images
const ICON_WIDTH = 40;
const ICON_HEIGHT = 40;

const RIDE_IMG_PATH = "images/roller-coaster.png";
const ENTRANCE_IMG_PATH = "images/gate.jpg";



// application constants
const FRAME_RATE = 30;
let frameRunning = 0;

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function getRandomRide(arr) {

  // get random index value
  const randomIndex = Math.floor(Math.random() * arr.length);

  // get random item
  const item = arr[randomIndex];

  return item;
}


// change the stuff below as you see fit

function getRideCapacity(ride_type) {
  var capacityDict = {
    "ride_a": 10,
    "ride_b": 5
  }
  
  return ride_type in capacityDict ? capacityDict[ride_type] : 0
  
}


function getRideDuration(ride_type) {
  var runtimeDict = {
    "ride_a": 5,
    "ride_b": 3
  }

  return ride_type in runtimeDict ? runtimeDict[ride_type] : 0;
}


// taken from stackoverflow: https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
// because im too lazy to implement a priority queue in javascript
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

const PQtop1 = 0;
const PQparent1 = i => ((i + 1) >>> 1) - 1;
const PQleft1 = i => (i << 1) + 1;
const PQright1 = i => (i + 1) << 1;
class MaxPriorityQueue {
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
    return this._heap[PQtop1];
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
    if (bottom > PQtop1) {
      this._swap(PQtop1, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[PQtop1] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > PQtop1 && this._greater(node, PQparent1(node))) {
      this._swap(node, PQparent1(node));
      node = PQparent1(node);
    }
  }
  _siftDown() {
    let node = PQtop1;
    while (
      (PQleft1(node) < this.size() && this._greater(PQleft1(node), node)) ||
      (PQright1(node) < this.size() && this._greater(PQright1(node), node))
    ) {
      let maxChild = (PQright1(node) < this.size() && this._greater(PQright1(node), PQleft1(node))) ? PQright1(node) : PQleft1(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

