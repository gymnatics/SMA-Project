class SimMap {
    constructor(nodes){
        this.nodes = nodes;
        this.dist = {};
        this.parent = {};
        this.entrance = nodes.filter((node) => node.type == "entrance")[0];
        this.rides = nodes.filter((node) => (node.type == "ride_a" || node.type == "ride_b"));
        this.edges = [];
        this.shortest_path = {};


        //set ride IDs
        for (let i = 0; i < this.rides.length; i++){
            this.rides[i].setRideName(i+1);
        }
        // run dijkstra's for setup
        for (let i = 0; i < this.nodes.length; i++){
            this.shortest_path[this.nodes[i].name]= {}
            // console.log(this.nodes[i])
            for (let j = 0; j < this.nodes.length; j++){
                if (i == j) {
                    continue;
                }
                // console.log("i,j:", i,j)
                this.shortest_path[this.nodes[i].name][this.nodes[j].name] = this.getShortestPath(this.nodes[i],this.nodes[j]);
            
            }
        }
        console.debug("path:", this.shortest_path)

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
        //console.log("startNode:", startNode);
        this.initialize_single_source(startNode)
        const S = new Set();
        const Q = new PriorityQueue((a, b) => this.dist[a.name] < this.dist[b.name]);
        //console.log("startNode connections:", startNode.connections);

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
        // console.log("parent array:",this.parent)
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
        // console.log("path:",path)
        return path;
    }

    useShortestPath(startNode,EndNode){
        const path = [startNode]
        for (let node of this.shortest_path[startNode.name][EndNode.name]){
            path.push(node);
        }
        // console.log("shortest path:", this.shortest_path[startNode.name][EndNode.name]);
        
        return path

    }

    updateRides(){
        for (let ride of this.rides){
            ride.update();
        }
    }

    drawMap() {
        // draw nodes
        stroke(0);
        strokeWeight(1);
        for (const node of this.nodes) {
            if (node.type == "ride_a"){
                // set fill color to red
                fill(255, 0, 0);
                rect(node.x,node.y,50)
            }
            else if (node.type == "ride_b"){
                fill(0,0,255)
                rect(node.x,node.y,50)
            }
            else{
                fill(0,255,0)
                rect((WIDTH - STATS_WIDTH) / 2, 500, STATS_WIDTH, STATS_HEIGHT/3)
            }
          
        }
    }

    getRideInfoFromNode(startNode) {
        let retInfo = [];
        let startNodeIndex;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === startNode) {
                startNodeIndex = i;
                break;
            }
        }
        let minQ = Infinity, maxQ = 0
        for (let i = 0; i < this.nodes.length; i++) {
            // we only want to get ride info (get queue time )
            if (i != startNodeIndex && (this.nodes[i].type == "ride_a" || this.nodes[i].type == "ride_b" )) {
                const queue = this.nodes[i].getQueueTime();
                minQ = min(queue, minQ);
                maxQ = max(queue, maxQ);
                retInfo.push([queue, this.nodes[i]]);
            }
        }
        // normalise this info (so that we can score the rides effectively)
        const rangeQ = max(maxQ - minQ, 0.1);
        // console.log(rangeQ + " " + rangeD);
        for (let i = 0; i < retInfo.length; i++) {
            retInfo[i][0] = 1 - (retInfo[i][1] - minQ) / rangeQ;
        }
        return retInfo;
    }

    getAverageQueueTime() {
        let totalQueueTimes = 0;
        for (let ride of this.rides) {
            totalQueueTimes += ride.getQueueTime();
        }
        return totalQueueTimes / this.rides.length;
    }    
}

class MapNode {
    constructor(name,type,x,y){
        // 3 types (entrance, ride_a, ride_b)
        this.type = type;
        this.name = name;
        // x and y passed in as relative (converted to absolute)
        this.x = x * WIDTH;
        this.y = y * HEIGHT;
        this.connections = new Map();
        // console.log("this:",this)

        this.setTypePars();
    }

    addConnection(node,weight){

        this.connections.set(node,weight);
        node.connections.set(node,weight);
    }

    setTypePars(){
        if (this.type == "entrance"){
            this.img = null;
        }
        else{
            this.setRideParameters(getRideCapacity(this.type),getRideDuration(this.type));
            // for rides, let us store how many people are in queue at each second (basically every 30 frames)
            this.queueHist = [0];            
        }
        
    }

    setRideName(rideID){
        this.rideName = `Ride ${rideID}`
    }

    getQueueTime() {
        if (this.type == "ride_a" || this.type == "ride_b") {
            return int(ceil(this.queue.size() / this.capacity));
        } else return 0;
    }

    reset() {
        // reset the queue, cooldowns, riding agents
        this.queue = new MaxPriorityQueue((a, b) => a[0] > b[0]);
        this.ridingAgents = [];
        this.queueHist = [0];
        // this.maxQueueSoFar = 1;
    }

    getType() {
        return this.type;
    }

    getDisplayInfo() {
        // make sure that this node is actually a ride node
        if (this.type == 'ride_a' || this.type == "ride_b") {
            let displayInfo = `=== ${this.rideName},${this.type} ===\nCapacity: ${this.capacity}\nRide Duration: ${this.duration}\nQueue time: ${this.getQueueTime()}`;
            return displayInfo;
        }
    }

    setRideParameters(capacity,duration){
        this.capacity = capacity;
        this.duration = duration;
        this.current_cap = 0


        // used to keep track on who is riding and who is queuing
        this.ridingAgents = [];

        this.queue = new MaxPriorityQueue((a,b)=> a[0]>b[0]);

        this.runDurations = [];

    }

    enqueue(agent, tolerance){
        this.queue.push([tolerance,agent]);
        this.current_cap = this.current_cap + 1
        agent.startQueueing();
    }

    drawGraph() {
        if (this.type == "ride_a" || this.type =="ride_b") {
            // possible TODO: make this not rely on magic numbers
            const maxHist = max(1, max(this.queueHist));
            const minHist = 0;
        
            // const RG_MIN_OFF = 7;
            // const RG_MAX_OFF = 5;
        
            // draw the max and min values
            textAlign(CENTER, BOTTOM);
            fill(0);
            noStroke();
            text(maxHist, RG_X_START, RG_Y_START);
            // textAlign(CENTER, BOTTOM);
            // text(minHist, RG_X_START - RG_MIN_OFF, RG_Y_END + RG_MIN_OFF);
        
            // draw the x and y axes
            stroke(0);
            strokeWeight(1);
            line(RG_X_START, RG_Y_START, RG_X_START, RG_Y_END);
            line(RG_X_START, RG_Y_END, RG_X_END, RG_Y_END);
        
            // draw the actual graph
            stroke(255, 0, 0);
            strokeWeight(0.5);
            noFill();
            beginShape();
            for (let i = 0; i < MAX_RIDE_SAMPLES; i++) {
                if (i < this.queueHist.length) {
                    const xtick = (RG_X_END - RG_X_START) / MAX_RIDE_SAMPLES * i + RG_X_START;
                    const ytick = RG_Y_END - (RG_Y_END - RG_Y_START) / (maxHist - minHist) * (this.queueHist[i] - minHist);
                    vertex(xtick, ytick);
                }
            }
            endShape();
        }
    }

    update() {
        // update the queueHist with the newest queue data
        if (frameRunning % Math.floor(RIDE_SAMPLE_UPDATE_FREQ * FRAME_RATE) == 0) {
            // this.maxQueueSoFar = max(this.queueHist);
            const queueTime = int(ceil(this.queue.size() / this.capacity));
            this.queueHist.push(queueTime);
            if (this.queueHist.length > MAX_RIDE_SAMPLES) {
                // remove the oldest data point
                this.queueHist.shift();
            }
        }

        // if there is people in the queue and i am ready to receive riders
        if (!this.queue.isEmpty() && this.current_cap < this.capacity) {
            let agents = [];
            const agt = this.queue.pop()[1];
            agt.startRiding();
            agents.push(agt)

        }
        this.ridingAgents.push(agents)
        this.runDurations.push(this.duration);

        // console.debug("ridingAgents:", this.ridingAgents)
        // console.debug("runDurations:", this.runDurations);
        // if there are people riding, update my ridecooldowns -- refers to ride durations
        if (this.runDurations.length > 0) {
            let dones = 0;
            for (let i = 0; i < this.runDurations.length; i++) {
                this.runDurations[i] -= deltaTime / 1000;
                if (this.runDurations[i] <= 0) {
                    // this means the run is over
                    dones += 1;
                for (const agt of this.ridingAgents[i]) {
                    agt.doneRiding();
                }
                }
            }
            // if there are rides that are complete, clear the arrays
            this.runDurations.splice(0, dones);
            this.ridingAgents.splice(0, dones);
        }
    }
}

