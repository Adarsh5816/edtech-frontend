import { useState, useEffect } from "react";
import Calendar from "react-calendar";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [student, setStudent] = useState("");

  const [course, setCourse] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student"
  });

  const BASE = "https://edtech-backend-r5yc.onrender.com";

  const getToken = () => localStorage.getItem("token");

  // LOGIN
  const login = async () => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      alert("Login failed");
    }
  };

  // LOAD ROLE
  const loadDashboard = async () => {
    const res = await fetch(`${BASE}/dashboard`, {
      headers: { Authorization: getToken() }
    });

    const data = await res.json();
    setRole(data.role);
  };

  // LOAD SESSIONS
  const loadSessions = async () => {
    const res = await fetch(`${BASE}/sessions`, {
      headers: { Authorization: getToken() }
    });

    if (!res.ok) return;

    const data = await res.json();
    setSessions(data);
  };

  // LOAD STUDENTS
  const loadStudents = async () => {
    const res = await fetch(`${BASE}/users`, {
      headers: { Authorization: getToken() }
    });

    if (!res.ok) {
      console.log(await res.text());
      return;
    }

    const data = await res.json();
    setStudents(data);
  };

  // CREATE SESSION
  const createSession = async () => {
    const res = await fetch(`${BASE}/session`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        Authorization: getToken()
      },
      body: JSON.stringify({ title, date, time, student })
    });

    const data = await res.json();

    alert(`Link: ${data?.meetLink}`);
    loadSessions();
  };

  // UPDATE SESSION
  const updateSession = async (id) => {
    await fetch(`${BASE}/session/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type":"application/json",
        Authorization: getToken()
      },
      body: JSON.stringify({ date, time })
    });

    alert("Updated");
    loadSessions();
  };

  // ADMIN CREATE USER
  const createUser = async () => {
    await fetch(`${BASE}/user`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:getToken()
      },
      body:JSON.stringify(newUser)
    });

    alert("User Created");
  };

  // ADMIN CREATE COURSE
  const createCourse = async () => {
    await fetch(`${BASE}/course`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:getToken()
      },
      body:JSON.stringify({ title: course })
    });

    alert("Course Created");
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboard();
      loadSessions();
      loadStudents();
    }
  }, [isLoggedIn]);

  return (
    <div style={{ padding: 30 }}>
      {!isLoggedIn ? (
        <>
          <input placeholder="username" onChange={(e)=>setUsername(e.target.value)} />
          <input type="password" onChange={(e)=>setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </>
      ) : role ? (
        <>
          <h2>{role}</h2>

          {/* STUDENT */}
          {role === "student" && (
            <>
              <Calendar onChange={setDate} value={date} />

              {sessions
                .filter(s => new Date(s.date).toDateString() === date.toDateString())
                .map((s,i)=>(
                  <div key={i}>
                    <b>{s.title}</b><br/>
                    👨‍🏫 {s.tutor}<br/>
                    ⏰ {s.time}<br/>
                    <a href={s.meetLink} target="_blank" rel="noreferrer">
                      👉 Join Class
                    </a>
                  </div>
                ))}
            </>
          )}

          {/* TUTOR */}
          {role === "tutor" && (
            <>
              <input placeholder="Title" onChange={(e)=>setTitle(e.target.value)} />
              <Calendar onChange={setDate} value={date} />
              <input type="time" onChange={(e)=>setTime(e.target.value)} />

              <select onChange={(e)=>setStudent(e.target.value)}>
                <option>Select student</option>
                {students.map((s,i)=>(
                  <option key={i} value={s.username}>
                    {s.username}
                  </option>
                ))}
              </select>

              <button onClick={createSession}>Create</button>

              <h3>Reschedule</h3>
              {sessions.map(s=>(
                <div key={s._id}>
                  {s.title} - {s.time}
                  <button onClick={()=>updateSession(s._id)}>Update</button>
                </div>
              ))}
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <h3>Create User</h3>
              <input placeholder="username"
                onChange={(e)=>setNewUser({...newUser,username:e.target.value})}/>
              <input placeholder="password"
                onChange={(e)=>setNewUser({...newUser,password:e.target.value})}/>
              <select onChange={(e)=>setNewUser({...newUser,role:e.target.value})}>
                <option value="student">student</option>
                <option value="tutor">tutor</option>
              </select>
              <button onClick={createUser}>Create</button>

              <h3>Create Course</h3>
              <input onChange={(e)=>setCourse(e.target.value)} />
              <button onClick={createCourse}>Create Course</button>
            </>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;