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
            this.limit = 10;
        }
        // Generate move speed of agents
        this.moveSpeed = MOVE_SPEED + (Math.random()*40-20);
    }


    nextDestination(){
        this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
        // console.debug("rides:", this.map.rides);
        console.debug(this.satisfaction);
        // check the queue time for the next ride to determine next ride
        // agent state in chilling, will leave when score <= 0
        if (this.agentState == AgentStates.CHILLING && this.next_ride.getQueueTime() > this.limit){
            this.check_again = true;
            while (this.check_again === true){
                this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
                console.log("next ride:", this.next_ride);

                
                if (this.agentState == AgentStates.CHILLING && this.next_ride.getQueueTime() <= this.limit){

                    this.check_again = false;
                    this.targetNode = this.next_ride;
                    this.agentState = AgentStates.MOVING;
                
                }   
            }

        } else if (this.satisfaction >= MAX_SATISFACTION){
            
            this.targetNode = this.map.entrance;
            this.agentState = AgentStates.EXITING;
            this.fill = "white";

        }else if (this.satisfaction <= 0){
            this.targetNode = this.map.entrance;
            this.agentState = AgentStates.EXITING;
            this.fill = "white";

        }else{
            // //generate choice of next ride randomly
            // this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
            this.targetNode = this.next_ride;
            this.agentState = AgentStates.MOVING;
        }
        console.debug("this is curNode:", this.curNode);
        console.debug("target node:", this.targetNode);
        
        
        // console.log("this is targetNode:", this.targetNode);
        this.movepath = this.map.useShortestPath(this.curNode, this.targetNode);
        // console.log("initial path:",this.movepath);
        this.movepath.shift();
        // console.debug("next path:", this.movepath);
        this.startMoving();
    }

    startMoving(){
    // set the current node (to the next node)
    this.curNode = this.movepath[0];

    // set the target coords (to the next node)
    this.targetX = this.movepath[0].x;
    this.targetY = this.movepath[0].y;

    this.initialX = this.x;
    this.initialY = this.y;

    this.lerpT = 0; // varies from 0 to 1
    this.timeRequired = dist(this.x, this.y, this.targetX, this.targetY) / this.moveSpeed;
    // console.debug("target X and Y:", this.targetX, this.targetY);
    // console.debug("initial lerpT:", this.lerpT)
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
                this.satisfaction -= 0.005;
                this.nextDestination();
                break;
            
            case AgentStates.MOVING: case AgentStates.EXITING:
                this.lerpT += deltaTime / (1000 * this.timeRequired);
                // console.debug(this.lerpT);
                if (this.lerpT >= 1) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    if (this.curNode === this.targetNode) {
                        this.lerpT = 0;
                        if (this.agentState == AgentStates.MOVING) this.agentState = AgentStates.REACHED;
                        else this.agentState = AgentStates.EXITED;
                    } else {
                        // not yet reached the target node
                        // drop the front node (we're there already), and start moving again
                        this.movepath.shift();
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
                this.satisfaction += 0.1;
                
                break;

        }

        // console.debug("agent state:", this.agentState)
    }

    startQueueing(){
        this.agentState = AgentStates.QUEUING;
        this.startQueueTime = frameRunning;
    }

    startRiding(){
        this.numRidesTaken++;
        const queueTime = (frameRunning - this.startQueueTime) / FRAME_RATE;
        this.timeQueueing += queueTime;
        this.current_cap ++;
        
    }

    doneRiding(){
        this.satisfaction -= (this.queue_w/1000).toFixed(2);
        this.agentState = AgentStates.FINISHED;
        
    }
    draw() {
        stroke(0);
        strokeWeight(0.5);
        fill(this.fill);
        if (this.agentState == AgentStates.MOVING || this.agentState == AgentStates.EXITING) {
            // console.debug("before lerp:", this.x, this.y)
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
