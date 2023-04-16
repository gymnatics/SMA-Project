// global vars
let simMap;
let nodes = [];
let agents =[];

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
let avgQueueTimeHist = [];

let avgScore = 0;
let avgScoreHist = [];

function setup(){
    createCanvas(WIDTH, HEIGHT);

    //set 30 fps
    frameRate(FRAME_RATE);
    createMap();

    //create basic control buttons
    createP();
    const divs = createDiv();
    divs.class("buttons");

    const startBtn = createButton("Start/Pause Simulation");
    const resetBtn = createButton("Reset Simulation");
    const statsBtn = createButton("Show/Hide global statistics");
    const csvBtn = createButton("Export statistics (CSV)");
    const pBtn = createP();
    const defaultMapBtn = createButton("Create default map");

    startBtn.parent(divs);
    resetBtn.parent(divs);
    statsBtn.parent(divs);
    csvBtn.parent(divs);
    pBtn.parent(divs);
    defaultMapBtn.parent(divs);

    startBtn.mouseClicked(toggleSim);
    resetBtn.mouseClicked(resetSim);
    statsBtn.mouseClicked(toggleStats);
    csvBtn.mouseClicked(exportCSV);
    defaultMapBtn.mouseClicked(defaultMap);
}

function draw(){
    background(100);
    fill(0);
    noStroke();
    textAlign(RIGHT, TOP);
    text(`${time.toFixed(2)}\n${frameRunning}\n${timeHist.length}`, WIDTH - 5, 5);

    if(simMap){
        simMap.drawMap();
    }

    if (isRunning){
        frameRunning++;
        time += deltaTime /1000;
        updateLoop();
    }

    for (let agent of agents){
        agent.draw();
    }

    drawRunning();

    drawDisplay();

    if (showStats){
        drawStats();
    }
}

function mouseClicked() {
   
    if (simMap == null) {
        simMap = new SimMap(nodes);
    }
    
}

function toggleSim() {
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
    avgQueueTimeHist = [];
    
  
  
    for (const node of nodes) {
        node.reset();
    }
}

function defaultMap(){
    createMap();
}

function toggleStats(){
    showStats = !showStats;
}

function exportCSV() {
    isRunning = false;
  
    // list the stuff we want
    // timeHist, minQueueTimeHist, avgQueueTimeHist, agtsLeftHist, totalVisitorsHist, timeSpentHist, timeQueueHist
    let table = new p5.Table();
  
    table.columns = ["time", "min_wait_time", "avg_wait_time", "agts_left", "total_agts", "time_in_park", "time_in_queue","average_score"];
  
    let data = [timeHist, avgQueueTimeHist, agtsLeftHist, totalVisitorsHist, timeSpentHist, timeQueueHist, avgScoreHist];
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
        if (dist(node.x, node.y, mouseX, mouseY) < HOVER_RADIUS && (node.type == "ride_a" || node.type =="ride_b")) {
        // draw a rectangle at the top left to display info
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
    } 
    else {
        fill("#f08205");
        rect(8, 7.5, 5, 15);
        rect(16, 7.5, 5, 15);
    }
}

function drawStats() {
    // draw a rectangle near the bottom of the screen to display statistics
    fill(155,155,155,200);
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
    Average time spent (per visitor): ${(totalTimeSpent / exitedVisitors).toFixed(3)}
    Average queue time (per ride): ${(averageQueueTime).toFixed(3)}`;
    
  
    text(statsString, WIDTH / 2, HEIGHT - STATS_HEIGHT + 10);
  
    const leftBorder = (WIDTH - STATS_WIDTH) / 2;
    const btmBorder = HEIGHT;
  
    // possible todo: remove the magic numbers
    drawGraph("time in park", timeSpentHist, leftBorder + 25, btmBorder - 60, 30);
    drawGraph("missed fraction", agtsLeftHist, leftBorder + 150, btmBorder - 60, 1);
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
  
    // initialise a basic map (0,0 top left; 1,1 btm right)
    let e = new MapNode("Node 1","entrance", 0.5, 0.6);
    let n1 = new MapNode("Node 2","ride_a", 0.4, 0);
    let n2 = new MapNode("Node 3","ride_b", 0.3, 0.2);
    let n3 = new MapNode("Node 4","ride_a", 0.5, 0.5);
    let n4 = new MapNode("Node 5","ride_b", 0.8, 0.3);

    const nodes = [e, n1, n2, n3, n4];

    // add connections
    for (let i = 0; i < nodes.length; i++){
        for (let j = 0; j < nodes.length; j++){
            if (i == j) {
                continue;
            }
            nodes[i].addConnection(nodes[j],1)
            // console.log(i,j)
            
        
        }
    }
    // e.addConnection(n1,1);
    // e.addConnection(n2,1);
    // e.addConnection(n3,1);
    // e.addConnection(n4,1);

    n1.addConnection(n1,1);
    n2.addConnection(n2,1);
    n3.addConnection(n3,1);
    n4.addConnection(n4,1);
    // n1.addConnection(n2,1);
    // n1.addConnection(n3,1);
    // n1.addConnection(n4,1);

    // n2.addConnection(e,1);
    // n2.addConnection(n1,1);
    // n2.addConnection(n3,1);
    // n2.addConnection(n4,1);
    
    // n3.addConnection(e,1);
    // n3.addConnection(n1,1);
    // n3.addConnection(n2,1);
    // n3.addConnection(n4,1);

    // n4.addConnection(e,1);
    // n4.addConnection(n1,1);
    // n4.addConnection(n2,1);
    // n4.addConnection(n3,1);


    

  
    // set the global vars
    //rides = [n1, n2, n3, n4];
    // entrance = e;
  
    // initialise the actual map
    // const nodes = [e, n1, n2, n3, n4];
   
    // connections = [[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
    simMap = new SimMap(nodes);
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
        // Need to add avgScoreHist data!!
        
    }
  
}

function addAgents() {
    if (Math.random() < ARRIVAL_PROB) {
  
        // increment number of visitors
        totalVisitors++;
  
        const typeRNG = Math.random();
        if (typeRNG < TOLERANCE_PROB) {
            // console.log("priority entered");
            const agent = new Agent(simMap, tolerance = true, score = 100);
            agents.push(agent);
  
        }
        // need to instantiate a new agent, otherwise, it'll just be one agent being updated twice per loop
        // possible to identify groupings within the agents? maybe some sort of id
        // agents.push(agent);
        else {
            // console.log("entered");
            const agent = new Agent(simMap, tolerance = false, score = 100);
            agents.push(agent);
        }
    }
}

function removeAgents() {

    let exitedAgents = agents.filter((agt) => agt.agentState == AgentStates.EXITED);
    agents = agents.filter((agt) => (agt.agentState != AgentStates.EXITED));
  
    // let times = frameRunning * exitedAgents.length;
    // let ridesTaken = 0;
    // let queueTimes = 0;
    for (let agt of exitedAgents) {
        totalTimeSpent += (frameRunning - agt.enteredTime) / FRAME_RATE;
        totalTimeQueue += agt.timeSpentQueuing;
        totalRides += agt.numRidesTaken;
        numExitedAgents += agt.size;
    }
}
  

  

  