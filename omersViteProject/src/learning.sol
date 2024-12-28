// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LearningTracker {

    // Define the LearningTask struct to store task details
    struct LearningTask {
        string task;       // Description of the learning task
        bool completed;    // Status: whether the task is completed
        string resource;   // URL or description of the resource for the task
    }

    // Array to store all learning tasks
    LearningTask[] public learningTasks;

    // Events to emit when a task is added or completed
    event LearningTaskAdded(uint256 taskId, string task, string resource);
    event LearningTaskCompleted(uint256 taskId);

    // Function to add a new learning task
    function addLearningTask(string memory _task, string memory _resource) public {
        // Push the new task to the array
        learningTasks.push(LearningTask(_task, false, _resource));

        // Get the taskId (index of the new task)
        uint256 taskId = learningTasks.length - 1;

        // Emit the event that a new task has been added
        emit LearningTaskAdded(taskId, _task, _resource);
    }

    // Function to mark a task as completed
    function completeLearningTask(uint256 _taskId) public {
        // Ensure the taskId exists
        require(_taskId < learningTasks.length, "Task does not exist");

        // Mark the task as completed
        learningTasks[_taskId].completed = true;

        // Emit an event that the task has been completed
        emit LearningTaskCompleted(_taskId);
    }

    // Function to get all learning tasks (for the frontend)
    function getLearningTasks() public view returns (string[] memory, bool[] memory, string[] memory) {
        uint256 taskCount = learningTasks.length;

        // Arrays to store task details
        string[] memory taskDescriptions = new string[](taskCount);
        bool[] memory taskStatuses = new bool[](taskCount);
        string[] memory resources = new string[](taskCount);

        // Loop through all tasks and store their data in the arrays
        for (uint256 i = 0; i < taskCount; i++) {
            taskDescriptions[i] = learningTasks[i].task;
            taskStatuses[i] = learningTasks[i].completed;
            resources[i] = learningTasks[i].resource;
        }

        // Return the arrays with the task data
        return (taskDescriptions, taskStatuses, resources);
    }
}
