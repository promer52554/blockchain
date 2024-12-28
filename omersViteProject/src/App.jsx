import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import LearningTrackerABI from "./LearningTrackerABI.json"; // Replace with the path to your ABI JSON
import "./App.css"; // Include your CSS file

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [learningTasks, setLearningTasks] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskResource, setTaskResource] = useState("");
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const contractInstance = new web3Instance.eth.Contract(LearningTrackerABI, contractAddress);
        setContract(contractInstance);

        fetchLearningTasks(contractInstance);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask is not installed");
    }
  };

  const fetchLearningTasks = async (contractInstance) => {
    try {
      const tasks = await contractInstance.methods.getLearningTasks().call();
      const formattedTasks = tasks[0].map((task, index) => ({
        description: task,
        completed: tasks[1][index],
        resource: tasks[2][index],
      }));
      setLearningTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addLearningTask = async () => {
    if (contract && taskDescription && taskResource) {
      try {
        await contract.methods.addLearningTask(taskDescription, taskResource).send({ from: accounts[0] });
        fetchLearningTasks(contract);
        setTaskDescription("");
        setTaskResource("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const completeLearningTask = async (taskId) => {
    if (contract) {
      try {
        await contract.methods.completeLearningTask(taskId).send({ from: accounts[0] });
        fetchLearningTasks(contract);
      } catch (error) {
        console.error("Error completing task:", error);
      }
    }
  };

  useEffect(() => {
    if (contract) {
      fetchLearningTasks(contract);
    }
  }, [contract]);

  return (
    <div className="App">
      <h1>Learning Tracker</h1>
      {accounts ? (
        <>
          <p>Connected Account: {accounts[0]}</p>

          <div className="task-input">
            <input
              type="text"
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Resource URL"
              value={taskResource}
              onChange={(e) => setTaskResource(e.target.value)}
            />
            <button onClick={addLearningTask} disabled={isConnecting}>
              {isConnecting ? "Adding..." : "Add Task"}
            </button>
          </div>

          <div className="task-list">
            {learningTasks.length === 0 ? (
              <p>No tasks found. Add some tasks!</p>
            ) : (
              <ul>
                {learningTasks.map((task, index) => (
                  <li key={index} className={task.completed ? "completed" : ""}>
                    <p><strong>{task.description}</strong></p>
                    <p>Resource: <a href={task.resource} target="_blank" rel="noopener noreferrer">{task.resource}</a></p>
                    <button onClick={() => completeLearningTask(index)} disabled={task.completed}>
                      {task.completed ? "Completed" : "Mark as Completed"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => setAccounts(null)}>Disconnect Wallet</button>
        </>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};

export default App;
