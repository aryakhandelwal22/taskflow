import { useEffect, useState, useRef } from "react";

function App() {
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [todos, setTodos] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const [category, setCategory] = useState("General");
  const [editingId, setEditingId] = useState(null);

  const alarmRef = useRef(null);

  const quotes = [
    "Stay consistent and trust the process.",
    "Small progress is still progress.",
    "Focus on one task at a time.",
    "Discipline creates results.",
    "Your future self will thank you.",
    "Productivity starts with clarity.",
    "Every completed task matters.",
  ];

  const dailyQuote =
    quotes[new Date().getDate() % quotes.length];

  // Load todos
  useEffect(() => {
    const savedTodos =
      JSON.parse(localStorage.getItem("todos")) || [];

    setTodos(savedTodos);

    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Save todos
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Alarm checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      todos.forEach((todo) => {
        if (
          todo.startTime === currentTime &&
          !todo.alerted
        ) {
          if (alarmRef.current) {
            alarmRef.current
              .play()
              .catch((err) => console.log(err));
          }

          if (
            Notification.permission === "granted"
          ) {
            new Notification("Task Reminder", {
              body: todo.text,
            });
          }

          setTodos((prev) =>
            prev.map((t) =>
              t.id === todo.id
                ? { ...t, alerted: true }
                : t
            )
          );
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [todos]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (task.trim() === "") return;

    const newTodo = {
      id: editingId || Date.now(),
      text: task,
      startTime,
      endTime,
      alerted: false,
      completed: false,
      category,
    };

    setTodos([newTodo, ...todos]);

    setTask("");
    setStartTime("");
    setEndTime("");
    setCategory("General");
    setEditingId(null);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(
      (todo) => todo.id !== id
    );

    setTodos(updatedTodos);
  };

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );
  };

  const editTask = (todo) => {
    setTask(todo.text);
    setStartTime(todo.startTime);
    setEndTime(todo.endTime);
    setCategory(todo.category);

    setEditingId(todo.id);

    deleteTodo(todo.id);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <audio
        ref={alarmRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      />

      <div className="quote">
        {dailyQuote}
      </div>

      <div className="todo-container">
        <div className="top-bar">
          <h1>TaskFlow</h1>

          <button
            className="dark-btn"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="todo-form"
        >
          <input
            type="text"
            placeholder="Enter your task..."
            value={task}
            onChange={(e) =>
              setTask(e.target.value)
            }
          />

          <div className="time-row">
            <input
              type="time"
              value={startTime}
              onChange={(e) =>
                setStartTime(e.target.value)
              }
            />

            <input
              type="time"
              value={endTime}
              onChange={(e) =>
                setEndTime(e.target.value)
              }
            />
          </div>

          <select
            className="category-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option>General</option>
            <option>Work</option>
            <option>Study</option>
            <option>Personal</option>
          </select>

          <button type="submit">
            {editingId
              ? "Update Task"
              : "Add Task"}
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              No tasks added yet.
            </div>
          ) : (
            todos.map((todo) => (
              <div
                className="todo-item"
                key={todo.id}
              >
                <div>
                  <p
                    style={{
                      textDecoration:
                        todo.completed
                          ? "line-through"
                          : "none",
                      opacity: todo.completed
                        ? 0.6
                        : 1,
                    }}
                  >
                    {todo.text}
                  </p>

                  {(todo.startTime ||
                    todo.endTime) && (
                    <span className="time">
                      {todo.startTime} -{" "}
                      {todo.endTime}
                    </span>
                  )}

                  <div className="tags">
                    <span className="category">
                      {todo.category}
                    </span>
                  </div>
                </div>

                <div className="actions">
                  <button
                    onClick={() =>
                      toggleComplete(todo.id)
                    }
                  >
                    ✓
                  </button>

                  <button
                    onClick={() =>
                      editTask(todo)
                    }
                  >
                    ✎
                  </button>

                  <button
                    onClick={() =>
                      deleteTodo(todo.id)
                    }
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;