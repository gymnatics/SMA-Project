// Setting Global Variables
// A - Rollercoaster, B- Teacup
// Might not need this if we are using classes
var RideArray = ["A","B"]

// Sectioning screen to various areas, might put it into the theme park class afterwards.
// Will have to use inheritance (Super)
// the items in the variable is not accurate.
// But the type is correct
var areas =[
    {"label":"Chilling Area","startRow":4,"numRows":5,"startCol":15,"numCols":11,"color":"pink"},
    {"label":"Staging Area","startRow":rideRow-1,"numRows":1,"startCol":rideCol-2,"numCols":5,"color":"red"}	
   ]
   var waitingRoom = areas[0]; // the waiting room is the first element of the areas array
   
   var currentTime = 0;

   // Statistics not complete, will have to re-align again later when more of the code is fleshed out.
   // Will include average score for agent, as well as average number of rides taken.
   var statistics = [
   {"name":"Average queue time for Ride A: ","location":{"row":rideRow+3,"col":rideCol-4},"cumulativeValue":0,"count":0},
   {"name":"Average queue time for Ride B: ","location":{"row":rideRow+4,"col":rideCol-4},"cumulativeValue":0,"count":0}
   ];

// dynamic list of agents
var agents = [];

// Declaration of Agent Class
class Agent{
    constructor(score = 20, tolerance = 1, desired_ride, in_queue = 0, in_ride = 0, agent_id = 0, agent_type = "A"){
        this.score = score
        this.tolerance = tolerance
        this.desired_ride = desired_ride
        this.in_queue = in_queue
        this.in_ride = in_ride
        this.agent_id = agent_id
        this.agent_type = agent_type
    }

    //Function to GET the score of Agent1 
    get_agent_score(){
        return this._score
    }

    // Updating score for Agent1
    //The following is a pseudocode:

    set_agent_score(bonus,finish_ride){
        //If no rides to take:
        // this.score = 0
        // Leave theme park
    
        //Else:
            // bonus = 0
            
            // While this.score <= max_score:
                // If queue for desired ride:
                    // this.score = this.score + bonus
                    // If there is queue, in_queue = 1
                    // While queue != 0:
                        // - points from score per timeStep (function should include tolerance, use a for loop)
                        // If user score = 0, break while loop and leave theme park
                    // in_queue = 0, because agent no longer in queue
                    // in_ride = 1, because agent is sitting the ride now
                    // this.score = this.score + finish_ride (because agent completed ride)
                    // this.score = newscore + this.score
                    // regenerate next desired ride.

                // Else:
                    // - points from score
                    // regenerate new desired ride
            
            // Agent leaves themepark

    }
    


    }

// Creation of Ride Class
// Might need to inherit Agent class? IDKKKK
// Have to take a look at composition/mixins
// STATE: IDLE = 0, BUSY = 1
class Ride {
    constructor(ride_type, capacity,max_capacity, duration, ticket_price, state = 0, queue_length){
        this.ride_type = ride_type
        this.capacity = capacity
        this.duration = duration 
        this.ticket_price = ticket_price
        this.state = state
        this._max_capacity = max_capacity
        this.queue_length = queue_length
    }

    // Add agents into the ride
    // Consider this as pseudocode
    add_riders(){
        while (this.capacity <= this._max_capacity){
            this.capacity = this.capacity + 1
            this.queue_length = this.queue_length - 1
            if (this.queue_length < 0){
                this.queue_length = 0
            }
        } 
    }

}


// Code below is just a preliminary idea of using mixins, most likely wrong
const MixRideAgents = superclass => class extends superclass {
    set_agent_score(bonus,finish_ride){
        //If no rides to take:
        // this.score = 0
        // Leave theme park
    
        //Else:
            // bonus = 0
            
            // While this.score <= max_score:
                // If queue for desired ride:
                    // this.score = this.score + bonus
                    // If there is queue, in_queue = 1
                    // While queue != 0:
                        // - points from score per timeStep (function should include tolerance, use a for loop)
                        // If user score = 0, break while loop and leave theme park
                    // in_queue = 0, because agent no longer in queue
                    // in_ride = 1, because agent is sitting the ride now
                    // this.score = this.score + finish_ride (because agent completed ride)
                    // this.score = newscore + this.score
                    // regenerate next desired ride.

                // Else:
                    // - points from score
                    // regenerate new desired ride
            
            // Agent leaves themepark

    }

    add_riders(){
        if (this.capacity <= this._max_capacity){
            this.capacity = this._max_capacity

        } 
    }
}




// BIG WARNING: I AM NOT SURE IF THE BOTTOM IDEA WILL WORK
// JUST A SUGGESTION THAT MAY/MAY NOT BE FEASIBLE



// Themepark is not a class as it cannot do multiple inheritance.

function Themepark (agent_id, agent_type, ride_type, capacity) {
    Object.assign(
        this,
        new Agent(),
        new Ride()
    )
}

// ORRRRRR

// Using composition to merge Agent and Ride into themepark
class Themepark {
    // We will construct themepark with the agents and ride as objects
    constructor(agent, ride){
        // Allowing themepark to access the 
        this.agent = agent
        this.ride = ride
    }

}

// Another method would be to not create a theme park class,
// I think this might be the best but I am not sure. \
// Need yall to help me on this.