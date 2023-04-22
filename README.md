# SMA-Project

Hello! This is Team 10: Sharlene World

Team Members:
Danny Yeo Rui Quan 1005138
Nhieu Chia Xin Yi 1005646
Robin Yeo Shao Jie 1005116
Ng Jie Lin 1005476

Please run index.html in Team10SubmissionHTML to view our submissions. Thank you!

This readme will be a basic explanation of the type of structures
that this code will use.

1. There will be 3 main class types:
    a. Theme park Class
    b. Agent Class
    c. Ride Class

Notes: I am not sure if we want to define an entirely new class
for each agent/ride, or whether we should set some conditions that
will change the values of the agents/rides to whatever it is supposed to be.

2. The theme park class will be responsible for the placement of the 
rides, as well as the different areas for the states such as the chilling area.

3. The theme park class shall inherit the agent and ride classes so that we can
position them more easily.

4. The agent class will consist of all the agent attributes such as the score, tolerance etc

5. The ride class will consist of all the ride attributes such as the queue time and capacity etc

6. For the queues, we will store them as arrays/lists for each type of ride.

7. These will be fixed arrays rather than linked lists so that we can limit the capacity.

8. For the states, they will be stored within the agent class

Notes: I don't know how you want to store the states yet, but we can store them as integers or as a string.

9. For anything that involves queueing, use arrays.

10. Might need to find a way to integrate the simulation with the classes.

11. Will need to get the location of each agent. They will be saved under the agent as ana attribute
