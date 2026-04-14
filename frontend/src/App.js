import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const API = "https://daily-planner-backend-tfir.onrender.com";

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = () => {
    fetch(`${API}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data));
  };

  const addTask = async () => {
    if (!taskName.trim()) return;
    await fetch(`${API}/add-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: taskName, due_date: dueDate }),
    });
    setTaskName("");
    setDueDate("");
    fetchTasks();
  };

  const toggleComplete = async (id, completed) => {
    await fetch(`${API}/update-task/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/delete-task/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const isOverdue = (due_date) => {
    if (!due_date) return false;
    return new Date(due_date) < new Date();
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="container">
      <h1>📋 Daily Planner</h1>
      <div className="input-row">
        <input
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="Enter a task..."
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* Pending Tasks */}
      <p className="section-label">🔵 Pending ({pending.length})</p>
      <ul>
        {pending.length === 0 && <p className="empty">No pending tasks!</p>}
        {pending.map(task => (
          <li key={task._id} className={isOverdue(task.due_date) ? "overdue" : ""}>
            <div className="left">
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleComplete(task._id, task.completed)}
              />
              <div className="task-info">
                <span className="task-name">{task.task}</span>
                {task.due_date && (
                  <span className="due-date">
                    📅 {task.due_date} {isOverdue(task.due_date) ? "⚠️ Overdue" : ""}
                  </span>
                )}
              </div>
            </div>
            <button className="delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
          </li>
        ))}
      </ul>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <>
          <p className="section-label">✅ Completed ({completed.length})</p>
          <ul>
            {completed.map(task => (
              <li key={task._id} className="completed">
                <div className="left">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleComplete(task._id, task.completed)}
                  />
                  <div className="task-info">
                    <span className="task-name done">{task.task}</span>
                    {task.due_date && (
                      <span className="due-date">📅 {task.due_date}</span>
                    )}
                  </div>
                </div>
                <button className="delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;