// global vars
let simMap;
let nodes = [];
let connections = [];
let entrance;
let rides;
let agents = [];
let isRunning = false;
let showStats = true;

// statistics
let time = 0;
let timeHist = [];

let totalVisitors = 0;
let totalVisitorsHist = [];

let totalTimeSpent = 0;
let timeSpentHist = [];

let totalTimeQueue = 0;
let timeQueueHist = [];

let totalRides = 0;
let rideHist = [];

let totalAgtsLeft = 0;
let agtsLeftHist = [];
let numExitedAgents = 0;

let averageQueueTime = 0;
let avgQueueA = 0;
let avgQueueB = 0;
let avgQueueC = 0;
let avgQueueAHist = [];
let avgQueueBHist = [];
let avgQueueCHist = [];
let avgQueueTimeHist = [];
let minQueueTimeHist = [];

let avgQueueTimePerson = 0;
let avgQueueTimePersonA = 0;
let avgQueueTimePersonB = 0;
let avgQueueTimePersonC = 0;
let avgQueueTimePersonHist = [];
let avgQueueTimePersonHistA = [];
let avgQueueTimePersonHistB = [];
let avgQueueTimePersonHistC = [];

let avgProfits = 0;
let avgProfitsA = 0;
let avgProfitsB = 0;
let avgProfitsC = 0;
let avgProfitsHist = [];
let avgProfitsHistA = [];
let avgProfitsHistB = [];
let avgProfitsHistC = [];

let avgScore = 0;
let avgScoreHist = [];

// creator mode
let creatorMode = false;
let selected = false;
let selectedNodeIndex = -1;
let selecting = false;

function setup() {
  createCanvas(WIDTH, HEIGHT);

  // set framerate at 30fps
  frameRate(FRAME_RATE);
  createMap();

  // create some basic control buttons
  createP();
  const divs = createDiv();
  divs.class("buttons");

  const startBtn = createButton("Start/Pause Simulation");
  const resetBtn = createButton("Reset Simulation");
  const statsBtn = createButton("Show/Hide global statistics");
  const csvBtn = createButton("Export statistics (CSV)");
  const pBtn = createP();

  startBtn.parent(divs);
  resetBtn.parent(divs);
  statsBtn.parent(divs);
  csvBtn.parent(divs);
  pBtn.parent(divs);


  startBtn.mouseClicked(toggleSim);
  resetBtn.mouseClicked(resetSim);
  statsBtn.mouseClicked(toggleStats);
  csvBtn.mouseClicked(exportCSV);

}

function draw() {
  background(100);
  fill(0);
  noStroke();
  textAlign(RIGHT, TOP);
  text(`${time.toFixed(2)}\n${frameRunning}\n${timeHist.length}`, WIDTH - 5, 5);

  if (simMap) {
    simMap.drawMap(creatorMode);
  }

  // update function
  if (!creatorMode) {

    if (isRunning) {
      frameRunning++;
      time += deltaTime / 1000;
      updateLoop();
    }

    // keep drawing agents
    for (let agent of agents) {
      agent.draw();
    }

    drawRunning();

    drawDisplay();

    if (showStats) {
      drawStats();
    }

  } 
}

function mouseClicked() {
  if (creatorMode && !selecting && mouseX > 0 && mouseY > 0 && mouseX < WIDTH && mouseY < HEIGHT) {
    const node = new MapNode("ride", mouseX / WIDTH, mouseY / HEIGHT);
    nodes.push(node);
    if (simMap == null) {
      simMap = new SimMap(nodes, connections);
    }
  }
}

function checkMap() {
  if (simMap == null || !simMap.checkMap()) {
    alert("Invalid map");
    creatorMode = true;
  } else {
    creatorMode = false;
  }
}

function toggleSim() {
  checkMap();
  isRunning = !isRunning;
}

function resetSim() {
  // reset the frame count
  frameRunning = 0;

  isRunning = false;
  agents = [];

  // reset statistics as well
  time = 0;
  timeHist = [];

  totalVisitors = 0;
  totalVisitorsHist = [];

  totalTimeSpent = 0;
  timeSpentHist = [];

  totalTimeQueue = 0;
  timeQueueHist = [];

  totalRides = 0;
  rideHist = [];

  totalAgtsLeft = 0;
  agtsLeftHist = [];
  numExitedAgents = 0;

  averageQueueTime = 0;
  avgQueueA = 0;
  avgQueueB = 0;
  avgQueueC = 0;
  avgQueueAHist = [];
  avgQueueBHist = [];
  avgQueueCHist = [];
  avgQueueTimeHist = [];
  minQueueTimeHist = [];
  
  avgQueueTimePerson = 0;
  avgQueueTimePersonA = 0;
  avgQueueTimePersonB = 0;
  avgQueueTimePersonC = 0;
  avgQueueTimePersonHist = [];
  avgQueueTimePersonHistA = [];
  avgQueueTimePersonHistB = [];
  avgQueueTimePersonHistC = [];
  
  avgProfits = 0;
  avgProfitsA = 0;
  avgProfitsB = 0;
  avgProfitsC = 0;
  avgProfitsHist = [];
  avgProfitsHistA = [];
  avgProfitsHistB = [];
  avgProfitsHistC = [];

  avgScore = 0;
  avgScoreHist = [];


  for (const node of nodes) {
    node.reset();
  }
}

function defaultMap() {
  if (creatorMode) createMap();
}

function resetMap() {
  if (creatorMode) {
    rideID = 0;
    simMap = null;
    nodes = [];
    connections = [];
  }
}

function toggleCreate() {
  resetSim();
  creatorMode = !creatorMode;

  if (!creatorMode) checkMap();
}

function toggleStats() {
  showStats = !showStats;
}

function exportCSV() {
  isRunning = false;

  // list the stuff we want
  // timeHist, minQueueTimeHist, avgQueueTimeHist, agtsLeftHist, totalVisitorsHist, timeSpentHist, timeQueueHist
  let table = new p5.Table();

  table.columns = ["time", "avg_queue_time_a", "avg_queue_time_b", "avg_wait_time","avg_wait_person", "avg_wait_person_a","avg_wait_person_b", "total_agts", "time_in_park", "time_in_queue", "average_score", "average_profits","average_profits_a","average_profits_b"];

  let data = [timeHist, avgQueueAHist, avgQueueBHist, avgQueueTimeHist,avgQueueTimePersonHist,avgQueueTimePersonHistA, avgQueueTimePersonHistB,  totalVisitorsHist, timeSpentHist, timeQueueHist, avgScoreHist, avgProfitsHist,avgProfitsHistA, avgProfitsHistB];
  console.log(data);
  for (let j = 0; j < data[0].length; j++) {
    let rowData = [];
    for (let i = 0; i < data.length; i++) {
      rowData.push(data[i][j]);
    }
    let row = rowData.join(",");

    table.addRow(new p5.TableRow(row, ","));
  }
  save(table, "export.csv");
}

function drawDisplay() {
  for (let node of nodes) {
    if (dist(node.x, node.y, mouseX, mouseY) < HOVER_RADIUS && ((node.type == "ride_a") || (node.type == "ride_b") || (node.type == "ride_c"))) {
      // draw a rectangle at the top left to display info
      rectMode(CORNER);
      fill(255, 255, 255, 60);
      stroke(0);
      strokeWeight(0.5);
      rect(0, 30, DISPLAY_WIDTH, DISPLAY_HEIGHT);

      textAlign(LEFT, TOP);
      noStroke();
      fill(0);
      text(node.getDisplayInfo(), 10, 40, DISPLAY_WIDTH - 5, DISPLAY_HEIGHT - 5);
      // text(node.runCooldowns, 5, 200);
      // text(node.turnoverCooldown, 5, 220);
      node.drawGraph();
      // this is just to avoid overdrawing of display info (in case multiple nodes are very close to one another)
      break;
    }
  }
}

function drawRunning() {
  strokeWeight(0.5);
  stroke(0);
  if (isRunning) {
    fill("#2a1");
    triangle(10, 7.5, 20, 15, 10, 22.5);
  } else {
    fill("#f08205");
    rect(8, 7.5, 5, 15);
    rect(16, 7.5, 5, 15);
  }
}

function drawStats() {
  // draw a rectangle near the bottom of the screen to display statistics
  rectMode(CORNER);
  fill(155);
  stroke(0);
  strokeWeight(0.5);
  rect((WIDTH - STATS_WIDTH) / 2, HEIGHT - STATS_HEIGHT, STATS_WIDTH, STATS_HEIGHT);

  textAlign(CENTER, TOP);
  noStroke();
  fill(0);

  const exitedVisitors = max(1, numExitedAgents);

  // show: total number of visitors, visitors currently in park
  statsString = `=== Global Stats ===
  Total visitors (lifetime): ${totalVisitors}
  Current visitors: ${totalVisitors - numExitedAgents}
  Average satisfaction (per visitor): ${(avgScore.toFixed(3))}
  Average time spent (per visitor): ${(totalTimeSpent / exitedVisitors).toFixed(3)}
  Average queue time (per ride): ${(averageQueueTime).toFixed(3)}`;

  text(statsString, WIDTH / 2, HEIGHT - STATS_HEIGHT + 10);

  const leftBorder = (WIDTH - STATS_WIDTH) / 2;
  const btmBorder = HEIGHT;


  drawGraph("average profits", avgProfitsHist, leftBorder + 25, btmBorder - 60, 30);
  drawGraph("average satisfaction", avgScoreHist, leftBorder + 150, btmBorder - 60, 1);
  drawGraph("ride queue times", avgQueueTimeHist, leftBorder + 275, btmBorder - 60, 10);

}

function drawGraph(title, data, x, y, defMax) {
  // set the default max so you can sort of have some sort of constant reference point
  const maxHist = max(defMax, int(ceil(max(data))));
  const minHist = 0;

  // draw title and max values
  textAlign(CENTER, BOTTOM);
  fill(0);
  noStroke();
  text(title, x + GG_WIDTH / 2, y - 10)
  text(maxHist, x, y);

  // draw the x and y axes
  stroke(0);
  strokeWeight(1);
  line(x, y, x, y + GG_HEIGHT);
  line(x, y + GG_HEIGHT, x + GG_WIDTH, y + GG_HEIGHT);

  // draw the actual graph
  stroke(255, 0, 0);
  strokeWeight(0.5);
  noFill();
  beginShape();
  for (let cnt = 0; cnt < MAX_AGT_SAMPLES; cnt++) {
    // offset the i
    // if i have more than 100 samples, i want to start at x (instead of 0)
    i = cnt + max(data.length - MAX_AGT_SAMPLES, 0);
    if (i < data.length) {
      const xtick = (GG_WIDTH) / MAX_AGT_SAMPLES * cnt + x;
      const ytick = y + GG_HEIGHT - (GG_HEIGHT) / (maxHist - minHist) * (data[i] - minHist);
      vertex(xtick, ytick);
    }
  }
  endShape();
}

function createMap() {
  // reset the rideID
  rideID = 0;

  // initialise a basic map (0,0 top left; 1,1 btm right)
  let e = new MapNode("entrance", 0.5, 0.6);
  let n1 = new MapNode("ride_a", 0.5, 0.45);
  let n2 = new MapNode("junc", 0.5, 0.35);
  let n3 = new MapNode("ride_b", 0.3, 0.3);
  let n4 = new MapNode("ride_a", 0.7, 0.3);
  let n5 = new MapNode("junc", 0.5, 0.2);
  let n6 = new MapNode("ride_b", 0.5, 0.2);
  let n7 = new MapNode("ride_b", 0.7, 0.45);
  let n8 = new MapNode("ride_a", 0.2, 0.2);

  nodes = [e, n1, n2, n3, n4, n5, n6, n7, n8];
  
  connections = [[0,1],[1,2],[1,7],[2,3],[2,4],[3,5],[4,5],[5,6],[6,8]]
  simMap = new SimMap(nodes, connections);
}

function getAvgScore() {
  let totalScore = 0; // get totalScore to track the total score
  for (let agent of agents) {
      
      totalScore += agent.satisfaction // add each agent's satisfaction to totalScore
  }

  if (agents.length == 0){
    return 0
  } 
  else{
    return totalScore / agents.length; // average score = total score / total number of agents
  }
}

function getAverageProfits() {
    let totalProfits = 0; // get totalProfits to track the total profits
    for (let agent of agents) {
        
        totalProfits += agent.profit // add each agent's satisfaction to totalScore
    }
  
    if (agents.length == 0){
      return 0
    } 
    else{
      return totalProfits / agents.length; // average score = total score / total number of agents
    }
}

function getAverageProfitsA() {
    let totalProfitsA = 0; // get totalProfits to track the total profits
    for (let agent of agents) {
        if (agent.curNode.type == "ride_a"){
            // add each agent's profit to total profit
            totalProfitsA += agent.profit
        }
    }
        
  
    if (agents.length == 0){
      return 0
    } 
    else{
      return totalProfitsA / agents.length; // average score = total score / total number of agents
    }
}

function getAverageProfitsB() {
    let totalProfitsB = 0; // get totalProfits to track the total profits
    for (let agent of agents) {
        if (agent.curNode.type == "ride_b"){
            // add each agent's profit to total profit
            totalProfitsB += agent.profit
        }
    }
        
  
    if (agents.length == 0){
      return 0
    } 
    else{
      return totalProfitsB / agents.length; // average score = total score / total number of agents
    }
}



function getAverageQueueTimePerson(){
    let totalQueueTime = 0;
    let rides = simMap.rides;
    for (let ride of rides){
        totalQueueTime += ride.getQueueTime();
    }
    return totalQueueTime / agents.length;
}

function getAverageQueueTimePersonA(){
    let totalQueueTimeA = 0;
    let rides = simMap.rides;
    for (let ride of rides){
        if (ride.type =="ride_a"){
            totalQueueTimeA += ride.getQueueTime();
        }
    }

    return totalQueueTimeA / agents.length;
}

function getAverageQueueTimePersonB(){
    let totalQueueTimeB = 0;
    let rides = simMap.rides;
    for (let ride of rides){
        if (ride.type =="ride_b"){
            totalQueueTimeB += ride.getQueueTime();
        }
    }

    return totalQueueTimeB / agents.length;
}


  

function updateLoop() {
  addAgents();

  for (let agent of agents) {
    agent.update();
  }

  simMap.updateRides();

  removeAgents();

  // calculate averageQueueTime (because there's nowhere else to calculate this)
  averageQueueTime = simMap.getAverageQueueTime();
  avgQueueA = simMap.getAverageQueueTime_A();
  avgQueueB = simMap.getAverageQueueTime_B();
  // avgQueueC = simMap.getAverageQueueTime_C();
  avgQueueTimePerson = getAverageQueueTimePerson();
  avgQueueTimePersonA = getAverageQueueTimePersonA();
  avgQueueTimePersonB = getAverageQueueTimePersonB();
  // avgQueueTimePersonC = getAverageQueueTimePersonC();

  // update the histories with the calculated data
  const exitedVisitors = max(1, numExitedAgents);
  if (frameRunning % Math.floor(AGT_SAMPLE_UPDATE_FREQ * FRAME_RATE) == 0) {
    timeHist.push(time);

    totalVisitorsHist.push(totalVisitors);

    timeSpentHist.push(totalTimeSpent / exitedVisitors);
    timeQueueHist.push(totalTimeQueue / exitedVisitors);
    rideHist.push(totalRides / exitedVisitors);

    agtsLeftHist.push(totalAgtsLeft / totalVisitors);

    avgQueueTimeHist.push(averageQueueTime);
    minQueueTimeHist.push(simMap.getMinQueueTime());
    avgQueueAHist.push(avgQueueA);
    avgQueueBHist.push(avgQueueB);
    // avgQueueCHist.push(avgQueueC);

    avgQueueTimePersonHist.push(avgQueueTimePerson);
    avgQueueTimePersonHistA.push(avgQueueTimePersonA);
    avgQueueTimePersonHistB.push(avgQueueTimePersonB);
    // avgQueueTimePersonHistC.push(avgQueueTimePersonC);

    avgProfits = getAverageProfits();
    avgProfitsA = getAverageProfitsA();
    avgProfitsB = getAverageProfitsB();
    // avgProfitsC = getAverageProfitsC();
    avgProfitsHist.push(avgProfits);
    avgProfitsHistA.push(avgProfitsA);
    avgProfitsHistB.push(avgProfitsB);
    // avgProfitsHistC.push(avgProfitsC);

    avgScore = getAvgScore();
    avgScoreHist.push(avgScore);
  }

}

function addAgents() {
  if (Math.random() < ARRIVAL_PROB) {

    // increment number of visitors
    totalVisitors++;

    const typeRNG = Math.random();
    if (typeRNG < PRIORITY_PROB) {
      // console.log("priority entered");
      const agent = new Agent(simMap, priority = true, grp = 1);
      agents.push(agent);

    } 
    else {
      // console.log("entered");
      const agent = new Agent(simMap, priority = false, grp = 1);
      agents.push(agent);
    }
  }
}

function removeAgents() {
  // we need to keep track of the cummulative total of how many people left
  let leftAgents = agents.filter((agt) => agt.agentState == AgentStates.LEFT);
  for (let agent of leftAgents) {
    totalAgtsLeft += agent.size;
  }

  let exitedAgents = agents.filter((agt) => agt.agentState == AgentStates.EXITED);
  agents = agents.filter((agt) => (agt.agentState != AgentStates.EXITED && agt.agentState != AgentStates.LEFT));


  for (let agt of exitedAgents) {
    totalTimeSpent += (frameRunning - agt.enteredTime) / FRAME_RATE;
    totalTimeQueue += agt.timeSpentQueuing;
    totalRides += agt.numRidesTaken;
    numExitedAgents += agt.size;
  }
}