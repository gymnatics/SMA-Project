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
    constructor(map,priority){
        this.map = map;

        this.agentState = AgentStates.ENTERED;

        this.x = map.entrance.x;
        this.y = map.entrance.y;

        this.priority = priority;
        
        this.satisfaction = 100;

        //curNode refers to current node
        this.curNode = map.entrance;
    


        this.enteredTime = null;
        this.timeQueuing = 0;
        this.numRidesTaken = 0;

        this.ride_bool = false;
        this.check_rides = [];

        //Differentiating btwn different agents
        if (this.priority == true) {
            this.fill = 'blue';
      
            // priority visitors do not care about the waiting time
            // this.m1 = 0.9;
            this.m2 = 0.1;
      
            // the park has to be really crowded for them to leave (since they have priority)
            this.limit = 10;
          } else {
            this.fill = 'green';
      
            // solo visitors don't really care about the distance
            // this.m1 = 0.3;
            this.m2 = 0.7;
      
            // okay with crowds
            this.limit = 7;
          }
      
          // slightly randomise the movespeeds so that agents dont overlap
          // can be removed if this behaviour is not wanted (just remove the randomisation)
          // the magnitude of randomisation actually needs to be on the order of 10s in order to have a noticeable effect
          // give it a range of +-20 from the original
          this.moveSpeed = MOVE_SPEED + (Math.random() * 40 - 20);    }


    // nextDestination(){
    //     this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
    //     // console.debug("rides:", this.map.rides);
    //     console.debug(this.satisfaction);
    //     // check the queue time for the next ride to determine next ride
    //     // agent state in chilling, will leave when score <= 0
    //     if (this.agentState == AgentStates.CHILLING && this.next_ride.getQueueTime() > this.limit){
    //         this.check_again = true;
    //         while (this.check_again === true){
    //             this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
    //             console.log("next ride:", this.next_ride);

                
    //             if (this.agentState == AgentStates.CHILLING && this.next_ride.getQueueTime() <= this.limit){

    //                 this.check_again = false;
    //                 this.targetNode = this.next_ride;
    //                 this.agentState = AgentStates.MOVING;
                
    //             }   
    //         }

    //     } else if (this.satisfaction >= MAX_SATISFACTION){
            
    //         this.targetNode = this.map.entrance;
    //         this.agentState = AgentStates.EXITING;
    //         this.fill = "white";

    //     }else if (this.satisfaction <= 0){
    //         this.targetNode = this.map.entrance;
    //         this.agentState = AgentStates.EXITING;
    //         this.fill = "white";

    //     }else{
    //         // //generate choice of next ride randomly
    //         // this.next_ride = this.map.rides[Math.floor(Math.random()*this.map.rides.length)];
    //         this.targetNode = this.next_ride;
    //         this.agentState = AgentStates.MOVING;
    //     }
    //     console.debug("this is curNode:", this.curNode);
    //     console.debug("target node:", this.targetNode);
        
        
    //     // console.log("this is targetNode:", this.targetNode);
    //     this.movepath = this.map.useShortestPath(this.curNode, this.targetNode);
    //     // console.log("initial path:",this.movepath);
    //     this.movepath.shift();
    //     // console.debug("next path:", this.movepath);
    //     this.startMoving();
    // }

    // startMoving(){
    // // set the current node (to the next node)
    // this.curNode = this.movepath[0];

    // // set the target coords (to the next node)
    // this.targetX = this.movepath[0].x;
    // this.targetY = this.movepath[0].y;

    // this.initialX = this.x;
    // this.initialY = this.y;

    // this.lerpT = 0; // varies from 0 to 1
    // this.timeRequired = dist(this.x, this.y, this.targetX, this.targetY) / this.moveSpeed;
    // // console.debug("target X and Y:", this.targetX, this.targetY);
    // // console.debug("initial lerpT:", this.lerpT)
    // }

    nextDestination() {
        // check the crowds (this is done by checking the average wait times)
        if (this.agentState == AgentStates.CHILLING) {
            for (let ride of this.map.rides){
                if(ride.getQueueTime()>this.limit){
                    this.ride_bool = false;
                } else {
                    this.ride_bool = true;
                }
                this.check_rides.push(this.ride_bool)
                
            }
            // console.debug(this.check_rides)
            if (this.check_rides.every(element => element === false)){
                this.targetNode = this.map.entrance;
                this.agentState = AgentStates.EXITING;
                this.fill = "white";
                console.debug("why is this happening???")
            } else{
                const rides = this.map.rides;
                console.debug("rides:", rides);
                this.next_ride = rides[Math.floor(Math.random()*rides.length)];
                this.targetNode = this.next_ride;
                console.debug("next ride:", this.next_ride);
                // const choice = Math.floor(Math.random() * rides.length);
                // this.targetNode = rides[choice];
                this.agentState = AgentStates.MOVING;
            }
    
    
        } else if ((this.satisfaction >= MAX_SATISFACTION) || (this.satisfaction <= 0)) {
          // check to see if this agent will leave based on the number of rides taken
          this.targetNode = this.map.entrance;
          this.agentState = AgentStates.EXITING;
          this.fill = "white";
          console.debug("this is happening")
    
        }  else {
    
            // pick another ride
            const rides = this.map.rides;
            console.debug("rides:", rides);
            this.next_ride = rides[Math.floor(Math.random()*rides.length)];
            this.targetNode = this.next_ride;
            console.debug("next ride:", this.next_ride);
            // const choice = Math.floor(Math.random() * rides.length);
            // this.targetNode = rides[choice];
            this.agentState = AgentStates.MOVING;
          
        }
        // find a path there
        console.debug(this.satisfaction);
        console.debug("curNode:", this.curNode);
        console.debug("targetNode:", this.targetNode);
        this.path = this.map.useShortestPath(this.curNode, this.targetNode);
        // console.debug("this is path:",this.path)
        this.path.shift();
    
        // start moving towards the next node
        this.startMoving();
    }
    
      // moves to the next node on the path
    startMoving() {
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
                this.satisfaction -= 0.01;
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
                        this.path.shift();
                        this.startMoving();
                    }
                }
                break;
            
            case AgentStates.REACHED:
                // enqueue this agent into ride (ride will deal with them)
                if (this.priority == true){
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
        this.current_cap ++;
        
    }

    doneRiding(){
        this.satisfaction -= (this.m2);
        this.lerpT = 0;
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
        if (this.priority == true) {
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
