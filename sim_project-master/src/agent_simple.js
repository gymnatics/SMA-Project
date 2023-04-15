const AgentStates = {
    "ENTERED": 99, // just entered the park
    "CHILLING": 100, // random walk while deciding next ride
    "MOVING": 101, // moving to target ride
    "QUEUING": 102, // queuing for ride
    "EXITING": 103, // moving towards exit (exit = entrance)
    "REACHED": 104, // reached the target ride
    "FINISHED": 105, // done with the current ride
    "EXITED": 106, // exited the park (remove the agent)
};
Object.freeze(AgentStates);

class Agent{
    constructor(map,tolerance){
        this.map = map;

        this.agentState = AgentStates.ENTERED;

        this.x = map.entrance.x;
        this.y = map.entrance.y;

        this.tolerance = tolerance;
        this.score = score;
        this.satisfaction = 100;

        //curNode refers to current node
        this.curNode = map.entrance;
    


        this.enteredTime = null;
        this.timeQueuing = 0;
        this.numRidesTaken = 0;

        //Differentiating btwn different agents
        if (this.tolerance == true){
            // agents who have high threshold for queuing
            this.fill = "yellow";
            // Waiting times will be less important to them --> lower weightage
            this.queue_w = 1;
            //PArk must be very crowded for them to leave
            this.limit = 20;

        }
        else {
            // low tolerance agents
            this.fill = "red";

            //Care more about waiting times --> higher weightage
            this.queue_w = 3;

            // not so good with crowds
            this.limit = 15;
        }
        // Generate move speed of agents
        this.moveSpeed = MOVE_SPEED + (Math.random()*40-20);
    }


    nextDestination(){
        //generate choice of next ride randomly
        this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];

        // check the queue time for the next ride to determine next ride
        // agent state in chilling, will leave when score <= 0
        if (this.agentState == AgentStates.CHILLING && this.next_ride.getQueueTime() > this.limit){
            this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
            
            while (this.next_ride.getQueueTime() > this.limit){
                this.satisfaction = this.satisfaction - 5;
                if (this.satisfaction <= 0){
                    this.targetNode = this.map.entrance;
                    this.agentState = AgentStates.EXITING;
                    this.fill = "white";
                }
    
            }

        }

        if (this.satisfaction >= MAX_SATISFACTION){
            this.targetNode = this.map.entrance;
            this.agentState = AgentStates.EXITING;
            this.fill = "white";
        }
        else{
            this.targetNode = this.next_ride;
            this.agentState = AgentStates.MOVING;
        }
        console.log(this.satisfaction);
        console.log("this is curNode:", this.curNode);
        console.log("this is targetNode:", this.targetNode);
        this.path = this.map.useShortestPath(this.curNode, this.targetNode);
        this.path.shift();
        this.startMoving();
    }

    startMoving(){
    // set the current node (to the next node)
    this.curNode = this.path[0];

    // set the target coords (to the next node)
    this.targetX = this.path[0].x;
    this.targetY = this.path[0].y;

    this.initialX = this.x;
    this.initialY = this.y;

    this.lerpT = 0; // varies from 0 to 1
    this.timeRequired = dist(this.x, this.y, this.targetX, this.targetY) / this.moveSpeed;

    }


    update(){
        switch (this.agentState){
            case AgentStates.ENTERED:
                //start counting the time agent spend in park
                this.enteredTime = frameRunning;
                // agent moves to the decision state
                this.agentState = AgentStates.CHILLING;
                break;

            case AgentStates.CHILLING:
                //pick a random ride to head to
                this.nextDestination();
                break;
            
            case AgentStates.MOVING: case AgentStates.EXITING:
                this.lerpT += deltaTime / (1000 * this.timeRequired);
        
                if (this.lerpT >= 1) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    if (this.curNode === this.targetNode) {
                    if (this.agentState == AgentStates.MOVING) this.agentState = AgentStates.REACHED;
                    else this.agentState = AgentStates.EXITED;
                    } else {
                    // not yet reached the target node
                    // drop the front node (we're there already), and start moving again
                    this.path.shift();
                    this.startMoving();
                    }
                }
                break;
            
            case AgentStates.REACHED:
                // enqueue this agent into ride (ride will deal with them)
                if (this.tolerance == true){
                    this.targetNode.enqueue(this,1);
                }
                else{
                    this.targetNode.enqueue(this,0);
                }
                break;
            
            case AgentStates.FINISHED:
                this.agentState = AgentStates.CHILLING;
                break;

        }

        console.debug("agent state:", this.agentState)
    }

    startQueueing(){
        this.agentState = AgentStates.QUEUING;
        this.startQueueTime = frameRunning;
    }

    startRiding(){
        this.numRidesTaken++;
        const queueTime = (frameRunning - this.startQueueTime) / FRAME_RATE;
        this.timeQueueing += queueTime;
        //normalize queue times into scores
        let minQ = Infinity, maxQ = 0
        minQ = min(this.timeQueuing,minQ);
        maxQ = max(this.timeQueuing,maxQ);
        const rangeQ = max(maxQ-minQ, 0.1);
        var queue_score = (this.timeQueuing-minQ)/rangeQ
        this.satisfaction = this.satisfaction - queue_score * this.queue_w
    }

    doneRiding(){
        this.agentState = AgentStates.FINISHED;
        this.satisfaction += 20
    }
    draw() {
        stroke(0);
        strokeWeight(0.5);
        fill(this.fill);
        if (this.agentState == AgentStates.MOVING || this.agentState == AgentStates.EXITING) {
            this.x = lerp(this.initialX, this.targetX, this.lerpT);
            this.y = lerp(this.initialY, this.targetY, this.lerpT);
        }
        if (this.tolerance == true) {
            ellipse(this.x, this.y, 1.5 * AGENT_RADIUS);
        } 
        else {
            ellipse(this.x, this.y, AGENT_RADIUS);
        }
    }
}
    
class Group {
    constructor(list_of_agents) {
        this.list = list_of_agents
    }
    }
