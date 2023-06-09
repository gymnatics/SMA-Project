const AgentStates = {
    "ENTERING": 99, // deciding or not whether to enter the park
    "ENTERED": 100, // just entered the park
    "MOVING": 101, // moving to the target ride
    "QUEUING": 102, // queuing for the ride
    "EXITING": 103, // exiting the park (moving to the exit)
    "REACHED": 104, // reached the target ride
    "FINISHED": 105, // done with the current ride
    "EXITED": 106, // exited the park (should remove from agents)
  };
  Object.freeze(AgentStates);
  
  class Agent {
    constructor(map, priority = false, size = 1) {
      this.map = map;
  
      this.agentState = AgentStates.ENTERING;
  
      this.x = map.entrance.x;
      this.y = map.entrance.y;
      this.priority = priority;
      this.size = size
      this.satisfaction = 100;
      this.curNode = map.entrance;
  
      this.enteredTime = frameRunning;
      this.timeSpentQueuing = 0;
      this.numRidesTaken = 0;
      this.profit = 0;
  
      // need to also set some weights on whether to choose to go for near ones or far ones
      // given a ride with distance d and waiting time w, the score of the ride is
      // m1 * d + m2 * w where m1 and m2 are constants describing how important those variables are
      // we also set another variable that suggests whether the park is too crowded for them to stay
      if (this.priority == true) {
        this.fill = 'blue';
  
        // priority visitors do not care about the waiting time
        this.m1 = 0.9;
        this.m2 = 0.1;
  
        // the park has to be really crowded for them to leave (since they have priority)
        this.limit = 10;
      } else {
        this.fill = 'green';
  
        // solo visitors don't really care about the distance
        this.m1 = 0.3;
        this.m2 = 0.7;
  
        // okay with crowds
        this.limit = 7;
      }
  
      // slightly randomise the movespeeds so that agents dont overlap
      this.moveSpeed = MOVE_SPEED + (Math.random() * 40 - 20);
    }
  
    nextDestination() {
      // check the average queue times
      if (this.agentState != AgentStates.ENTERED && this.map.getAverageQueueTime() > this.limit && Math.random() < CROWD_DEPARTURE_PROB) {
        this.targetNode = this.map.entrance;
        this.agentState = AgentStates.EXITING;
        this.fill = "white";
  
      } else if (((this.satisfaction >= MAX_SATISFACTION) || (this.satisfaction <= 0))) {
        // check to see if this agent will leave based on the number of rides taken
        this.targetNode = this.map.entrance;
        this.agentState = AgentStates.EXITING;
        this.fill = "white";
  
      } else {
  
        // pick another ride
        const rides = this.map.rides.filter((r) => !(r === this.curNode));
        if (rides.length == 0) {
          // just exit 
          this.targetNode = this.map.entrance;
          this.agentState = AgentStates.EXITING;
          this.fill = "white";
        } else {
  
          // assign a score to each ride
          let nextRideInfo = this.map.getRideInfoFromNode(this.curNode);
          let scores = [];
          let scoreTotal = 0;
          for (let info of nextRideInfo) {
            const score = this.m1 * info[0] + this.m1 * info[1];
            scoreTotal += score;
            scores.push(score);
          }
  
          // turn scores into probs and pick a weighted random ride
          let runningTotal = 0;
          let rng = Math.random();
          let choiceIndex = 0;
          for (let i = 0; i < scores.length; i++) {
            scores[i] /= scoreTotal;
            runningTotal += scores[i];
            if (rng < runningTotal) {
              choiceIndex = i;
              break;
            }
          }
          this.targetNode = nextRideInfo[choiceIndex][2];
  
          this.agentState = AgentStates.MOVING;
        }
      }
      // find a path there
      this.path = this.map.getPathToNode(this.curNode, this.targetNode);
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
  
    update() {
      switch (this.agentState) {
        case AgentStates.ENTERING:
          this.agentState = AgentStates.ENTERED;
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
              if (this.agentState == AgentStates.MOVING){
                this.satifaction -= 5;
                this.agentState = AgentStates.REACHED;
              } else{
                this.agentState = AgentStates.EXITED;
                }
            } else {
              // not yet reached the target node
              
              this.path.shift();
              this.startMoving();
            }
          }
          break;
        case AgentStates.REACHED:
          // enqueue this agent into the ride 
          // the second argument is the priority value, higher priority will be first to get to ride
          if (this.priority == true) {
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
    //   console.debug("satisfaction:", this.satisfaction);
    }
  
    
    startQueueing() {
      this.agentState = AgentStates.QUEUING;
      this.startQueueTime = frameRunning;
    }
  
    startRiding() {
      this.numRidesTaken++;
      const queueTime = (frameRunning - this.startQueueTime) / FRAME_RATE;
      this.timeSpentQueuing += queueTime;
      this.satisfaction -= this.timeSpentQueuing*this.m2;
      // console.debug("satisfaction queue:", this.satisfaction)
    }
  
    doneRiding() {
      if (this.curNode.type == "ride_a"){
        // console.log("curNode:", this.curNode);
        this.satisfaction += 50
        if (this.priority == true){
          this.profits += 8 - 2
        } else{
          this.profit += 6 - 2
        }
        
        // console.log("satisfaction a:", this.satisfaction);
      }
      if (this.curNode.type == "ride_b"){
        // console.log("curNode:", this.curNode);
        this.satisfaction += 30
        if (this.priority == true){
          this.profits += 10 - 4
        } else{
          this.profit += 8 - 4
        }
        // console.log("satisfaction b:", this.satisfaction);
      }
      if (this.curNode.type == "ride_c"){
        // console.log("curNode:", this.curNode);
        this.satisfaction += 40
        if (this.priority == true){
          this.profits += 7 - 3
        } else{
          this.profit += 5 - 3
        }
        // console.log("satisfaction b:", this.satisfaction);
      }
      console.log("profits", this.profit)
      
      this.agentState = AgentStates.FINISHED;
      
    }
  
    draw() {
      stroke(0);
      strokeWeight(0.5);
      fill(this.fill);
      if (this.agentState == AgentStates.MOVING || this.agentState == AgentStates.EXITING) {
        this.x = lerp(this.initialX, this.targetX, this.lerpT);
        this.y = lerp(this.initialY, this.targetY, this.lerpT);
      }
      if (this.priority == true) {
        ellipse(this.x, this.y, 1.5 * AGENT_RADIUS);
      } else if (this.size != 1) {
        for (var i = 0; i < this.size; i++) {
          ellipse(this.x, this.y + i * AGENT_RADIUS, AGENT_RADIUS);
        }
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