import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [date, setDate] = useState(new Date());

  const [adminData, setAdminData] = useState({});

  // Login
  const handleLogin = async () => {
    const res = await fetch("https://edtech-backend-r5yc.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      setMessage("Login failed ❌");
    }
  };

  // Get Role
  const getDashboard = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://edtech-backend-r5yc.onrender.com/dashboard", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setRole(data.message.split(" ")[1]);
  };

  // Courses
  const createCourse = async () => {
    const token = localStorage.getItem("token");

    await fetch("https://edtech-backend-r5yc.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ title: courseTitle })
    });

    alert("Course created!");
    setCourseTitle("");
  };

  const getCourses = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://edtech-backend-r5yc.onrender.com/courses", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setCourses(data);
  };

  // Sessions
  const createSession = async () => {
    const token = localStorage.getItem("token");

    await fetch("https://edtech-backend-r5yc.onrender.com/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ title: sessionTitle, date })
    });

    alert("Session created!");
    setSessionTitle("");
  };

  const getSessions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://edtech-backend-r5yc.onrender.com/sessions", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setSessions(data);
  };

  // Admin
  const loadAdmin = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://edtech-backend-r5yc.onrender.com/admin", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setAdminData(data);
  };

  // Auto load sessions
  useEffect(() => {
    if (isLoggedIn) {
      getSessions();
    }
  }, [isLoggedIn]);

  return (
    <div style={{ padding: "50px" }}>
      {!isLoggedIn ? (
        <>
          <h2>Login</h2>

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={handleLogin}>Login</button>
          <p>{message}</p>
        </>
      ) : (
        <>
          <h2>Dashboard</h2>
          <button onClick={getDashboard}>Load Dashboard</button>

          {/* STUDENT */}
          {role === "student" && (
            <>
              <h3>Courses</h3>
              <button onClick={getCourses}>Load Courses</button>

              <ul>
                {courses.map((c, i) => (
                  <li key={i}>{c.title}</li>
                ))}
              </ul>

              <h3>Calendar</h3>

              <Calendar
                onChange={setDate}
                value={date}
                tileClassName={({ date }) => {
                  const hasSession = sessions.find(
                    (s) =>
                      new Date(s.date).toDateString() ===
                      date.toDateString()
                  );
                  return hasSession ? "highlight" : null;
                }}
              />

              <h4>Sessions on selected date</h4>

              <ul>
                {sessions
                  .filter(
                    (s) =>
                      new Date(s.date).toDateString() ===
                      date.toDateString()
                  )
                  .map((s, i) => (
                    <li key={i}>{s.title}</li>
                  ))}
              </ul>
            </>
          )}

          {/* TUTOR */}
          {role === "tutor" && (
            <>
              <h3>Create Course</h3>
              <input
                placeholder="Course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
              <button onClick={createCourse}>Add Course</button>

              <h3>Schedule Session</h3>

              <input
                placeholder="Session title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />

              <Calendar onChange={setDate} value={date} />

              <button onClick={createSession}>Create Session</button>
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <h3>Admin Dashboard</h3>
              <button onClick={loadAdmin}>Load Data</button>

              <pre>{JSON.stringify(adminData, null, 2)}</pre>
            </>
          )}

          <br /><br />

          <button
            onClick={() => {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
              setRole("");
              setCourses([]);
              setSessions([]);
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default App;