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

class Agent {
  // map is the themepark
  constructor(map, tolerance = false, score = 100) {
    this.map = map;

    this.agentState = AgentStates.ENTERING;

    this.x = map.entrance.x;
    this.y = map.entrance.y;
    this.tolerance = tolerance;
    this.score = score
    // curNode refers to current node. Initialize as the starting of the map
    this.curNode = map.entrance;

    this.enteredTime = frameRunning;
    this.timeQueueing = 0;
    this.numRidesTaken = 0;

    // need to also set some weights on whether to choose to go for near ones or far ones
    // given a ride with distance d and waiting time w, the score of the ride is
    // m1 * d + m2 * w where m1 and m2 are constants describing how important those variables are
    // Could take the score as the amount of points that the agent will gain after riding the ride. Can add/minus bonus points afterwards

    // For now, just take into consideration tolerance.
    // we also set another variable that suggests whether the park is too crowded for them to stay
    if (this.tolerance == true) {
      // to differentiate between the type of agents
      this.fill = 'blue';

      // visitors with tolerance to waiting times do not care about the waiting time
      // this.m1 = 0.9;
      this.m2 = 0.1;

      // the park has to be really crowded for them to leave (since they have priority)
      this.limit = 10;
    } 
    
  //   else if (this.size != 1) {
  //     this.fill = 'pink';

  //     // group visitors would probably them both equally
  //     this.m1 = 0.5;
  //     this.m2 = 0.5;

  //     // not really good with crowds
  //     this.limit = 5;

  //   } 
  
  else {
      this.fill = 'green';

      // solo visitors don't really care about the distance
      // visitors without tolerance care more about waiting times
      // this.m1 = 0.3;
      this.m2 = 0.8;

      // okay with crowds
      this.limit = 7;
    }

    // slightly randomise the movespeeds so that agents dont overlap
    // can be removed if this behaviour is not wanted (just remove the randomisation)
    // the magnitude of randomisation actually needs to be on the order of 10s in order to have a noticeable effect
    // give it a range of +-20 from the original
    this.moveSpeed = MOVE_SPEED + (Math.random() * 40 - 20);
  }

  nextDestination() {
    // check the crowds (this is done by checking the average wait times)
    if (this.agentState != AgentStates.ENTERED && this.map.getAverageQueueTime() > this.limit && Math.random() < CROWD_DEPARTURE_PROB) {
      this.targetNode = this.map.entrance;
      this.agentState = AgentStates.EXITING;
      this.fill = "white";

    } else if (this.numRidesTaken >= int(ceil(RIDES_FOR_SATISFACTION * this.map.rides.length)) && this.score >= MAX_SCORE) {
      // check to see if this agent will leave based on the score
      this.targetNode = this.map.entrance;
      this.agentState = AgentStates.EXITING;
      this.fill = "white";

    } else if (this.agentState != AgentStates.ENTERED && this.score <= 0) {
      // randomly leaving
      this.targetNode = this.map.entrance;
      this.agentState = AgentStates.EXITING;
      // White represents agents who are going to exit
      this.fill = "white";
    } else {

      // pick another ride
      const rides = this.map.rides.filter((r) => !(r === this.curNode));
      if (rides.length == 0) {
        // just exit (since this means that there's only 1 ride)
        this.targetNode = this.map.entrance;
        this.agentState = AgentStates.EXITING;
        this.fill = "white";
      } else {

        // Update agent score for sitting ride
        // assign a score to each ride 
        
        let nextRideInfo = this.map.getRideInfoFromNode(this.curNode);
        let ride_scores = [];
        let ridescoreTotal = 0;
        for (let info of nextRideInfo) {
          // const total_score = this.m1 * info[0] + this.m1 * info[1];
          const total_score = this.m2 * info[0]
          ridescoreTotal += total_score;
          ride_scores.push(total_score);
        }

        // turn scores into probs and pick a weighted random ride
        let runningTotal = 0;
        let rng = Math.random();
        let choiceIndex = 0;
        for (let i = 0; i < ride_scores.length; i++) {
          ride_scores[i] /= ridescoreTotal;
          runningTotal += ride_scores[i];
          if (rng < runningTotal) {
            choiceIndex = i;
            break;
          }
        }
        this.targetNode = nextRideInfo[choiceIndex][2];
        // const choice = Math.floor(Math.random() * rides.length);
        // this.targetNode = rides[choice];
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
        // the second argument is the priority value, higher priority will be first to get to ride
        if (this.tolerance == true) {
          this.targetNode.enqueue(this, 1);
          this.score = this.score - 2;
          break;
        } else {
          this.targetNode.enqueue(this, 0);
          this.score = this.score - 4;
          break;
        }
      case AgentStates.FINISHED:
        this.nextDestination();
        break;
    }
  }

  // putting this here just to keep track of when the agent starts queuing
  startQueueing() {
    this.agentState = AgentStates.QUEUING;
    this.startQueueTime = frameRunning;
  }

  // putting this here just to keep track of when the agent reaches the end of the queue
  startRiding() {
    this.numRidesTaken++;
    const queueTime = (frameRunning - this.startQueueTime) / FRAME_RATE;
    this.timeQueuing += queueTime;
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