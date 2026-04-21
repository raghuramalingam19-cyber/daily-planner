import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");

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

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditText(task.task);
    setEditDate(task.due_date || "");
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/edit-task/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: editText, due_date: editDate }),
    });
    setEditingId(null);
    fetchTasks();
  };

  const exportToExcel = () => {
    const headers = ["Task", "Due Date", "Status"];
    const rows = tasks.map(t => [
      t.task,
      t.due_date || "No date",
      t.completed ? "Completed" : "Pending"
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "daily-planner-tasks.csv";
    a.click();
  };

  const isOverdue = (due_date) => {
    if (!due_date) return false;
    return new Date(due_date) < new Date();
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="container">
      <div className="header">
        <h1>📋 Daily Planner</h1>
        <button className="export-btn" onClick={exportToExcel}>
          📊 Export to Excel
        </button>
      </div>

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
            {editingId === task._id ? (
              <div className="edit-row">
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="edit-input"
                />
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                />
                <button className="save-btn" onClick={() => saveEdit(task._id)}>💾 Save</button>
                <button className="cancel-btn" onClick={() => setEditingId(null)}>✖ Cancel</button>
              </div>
            ) : (
              <>
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
                <div className="action-btns">
                  <button className="edit-btn" onClick={() => startEdit(task)}>✏️ Edit</button>
                  <button className="delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
                </div>
              </>
            )}
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