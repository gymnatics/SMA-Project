const AgentStates = {
    "ENTERING": 99, // deciding or not whether to enter the park
    "ENTERED": 100, // just entered the park
    "MOVING": 101, // moving to the target ride
    "QUEUING": 102, // queuing for the ride
    "EXITING": 103, // exiting the park (moving to the exit)
    "REACHED": 104, // reached the target ride
    "FINISHED": 105, // done with the current ride
    "EXITED": 106, // exited the park (should remove from agents)
    "LEFT": 107, // left the park without paying
  };
  Object.freeze(AgentStates);

  class Agent{
    //map is the themepark and rides
    constructor(map, tolerance, score) {
        this.map = map;

        this.agentState = AgentStates.ENTERING;

        this.x = map.entrance.x;
        this.y = map.entrance.y;
        this.tolerance = tolerance;
        this.score = score;
        this.check_rides = 0

        //curNode refers to current node.
        this.curNode = map.entrance;

        this.enteredTime = frameRunning;
        this.timeQueueing = 0;
        this.numRidesTaken = 0;

        if (this.tolerance == true){
            //to differentiate different types of agents
            this.fill = "blue";

            // visitors with tolerance will not care about waiting times
            this.queue_w = 1;

            //Park must be very crowded for them to leave
            this.limit = 15;
        } else{
            //low tolerance ppl
            this.fill = "green";

            //these visitors care more about waiting times
            this.queue_w = 3;
            // not so good with crowds
            this.limit = 7;
        }

        //Generate move speed of agents
        this.moveSpeed = MOVE_SPEED +(Math.random()*40-20);
    }

    nextDestination(){
        // generate next destination randomly
        this.next_ride = rides[Math.floor(Math.random()*rides.length)];
        let nextRideInfo = this.map.getRideInfoFromNode(this.next_ride);
        // check the crowds by checking average wait times
        if (this.agentState != AgentStates.ENTERED && this.next_ride.getQueueTime() > this.limit) {
            this.check_rides = this.check_rides + 1
            this.score = this.score - 5;
            if (this.check_rides >= 8){
                this.targetNode = this.map.entrance;
                this.agentState = AgentStates.EXITING;
                this.fill = "white"
            }

        } else if (this.score >= MAX_SCORE){
            this.targetNode = this.map.entrance;
            this.agentState = AgentStates.EXITING;
            this.fill = "white"

        } else {
            this.targetNode = this.next_ride
            this.agentState = AgentStates.MOVING;

        }
        // find a path there
        this.path = this.map.getPathToNode(this.curNode, this.targetNode);
        this.path.shift();

        // start moving towards the next node
        this.startMoving();
        
  }

  startMoving(){
    //set current node
    this.curNode = this.path[0];
    // set the target coords (to the next node)
    this.targetX = this.path[0].x;
    this.targetY = this.path[0].y;

    this.initialX = this.x;
    this.initialY = this.y;

    this.lerpT = 0; // varies from 0 to 1
    this.timeRequired = dist(this.x, this.y, this.targetX, this.targetY) / this.moveSpeed;
    
  }

  update() {
    switch (this.agentState) {
      case AgentStates.ENTERING:
        // look at all the rides and see if the crowds are too high
        // if too high, set it to AgentStates.LEFT
        if (this.map.getAverageQueueTime() > this.limit && Math.random() < CROWD_TURNAWAY_PROB) this.agentState = AgentStates.LEFT;
        else this.agentState = AgentStates.ENTERED;
        break;
      case AgentStates.ENTERED:
        // pick a random ride to head to
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
        // enqueue this agent into the ride (ride will deal with them)
        
        if (this.tolerance == true) {
          this.targetNode.enqueue(this, 1);
          break;
        } else {
          this.targetNode.enqueue(this, 0);
          break;
        }
      case AgentStates.FINISHED:
        this.nextDestination();
        break;
    }
  }

  startQueueing() {
    this.agentState = AgentStates.QUEUING;
    this.startQueueTime = frameRunning;
  }

  startRiding() {
    this.numRidesTaken++;
    const queueTime = (frameRunning - this.startQueueTime) / FRAME_RATE;
    this.timeQueuing += queueTime;
    //normalize queue times into scores
    let minQ = Infinity, maxQ = 0
    minQ = min(this.timeQueuing,minQ);
    maxQ = max(this.timeQueuing,maxQ);
    const rangeQ = max(maxQ-minQ, 0.1);
    var queue_score = (this.timeQueuing-minQ)/rangeQ
    if (this.tolerance == true){
        this.score = this.score - queue_score * 1
    } else{
        this.score = this.score - queue_score * 2
    }
    
  }

  doneRiding() {
    this.agentState = AgentStates.FINISHED;
    this.score = this.score + 20
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
    } else {
      ellipse(this.x, this.y, AGENT_RADIUS);
    }
  }
}

class Group {
    constructor(list_of_agents) {
      this.list = list_of_agents
    }
  }




