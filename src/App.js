import { useState, useEffect, useCallback } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student"
  });

  const BASE = "https://edtech-backend-r5yc.onrender.com";

  const getToken = () => localStorage.getItem("token");

  // ================= LOGIN =================
  const login = async () => {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Backend not updated yet");
      return;
    }

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    setIsLoggedIn(true);

  } catch {
    alert("Network error");
  }
};

  // ================= LOAD DATA =================
  const loadData = useCallback(async () => {
    const token = getToken();

    try {
      const dash = await fetch(`${BASE}/dashboard`, {
        headers: { Authorization: token }
      });

      const d = await dash.json();
      setRole(d.role);

      const s = await fetch(`${BASE}/sessions`, {
        headers: { Authorization: token }
      });

      setSessions(await s.json());

      if (d.role === "admin") {
        const u = await fetch(`${BASE}/users`, {
          headers: { Authorization: token }
        });

        setUsers(await u.json());
      }

    } catch (err) {
      console.log("LOAD ERROR", err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn, loadData]);

  // ================= CREATE USER =================
  const createUser = async () => {
    await fetch(`${BASE}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken()
      },
      body: JSON.stringify(newUser)
    });

    alert("User created");
    loadData();
  };

  // ================= RESCHEDULE =================
  const reschedule = async (id) => {
    const time = prompt("Enter new time");
    if (!time) return;

    await fetch(`${BASE}/session/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken()
      },
      body: JSON.stringify({ time })
    });

    loadData();
  };

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  return (
    <div className="flex h-screen">

      {isLoggedIn ? (
        <>
          {/* SIDEBAR */}
          <div className="w-60 bg-indigo-600 text-white p-4">
            <h2 className="text-xl font-bold mb-4">EdTech</h2>
            <p className="capitalize">{role}</p>

            <button
              className="mt-4 bg-red-500 p-2 w-full rounded"
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
              }}
            >
              Logout
            </button>
          </div>

          {/* MAIN */}
          <div className="flex-1 p-6 bg-gray-100 overflow-auto">

            {/* ADMIN PANEL */}
            {role === "admin" && (
              <div className="bg-white p-4 rounded shadow mb-4">
                <h3 className="font-bold mb-2">Create User</h3>

                <input
                  className="border p-2 m-1"
                  placeholder="username"
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />

                <input
                  className="border p-2 m-1"
                  placeholder="password"
                  type="password"
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />

                <select
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="border p-2 m-1"
                >
                  <option value="student">student</option>
                  <option value="tutor">tutor</option>
                </select>

                <button
                  onClick={createUser}
                  className="bg-green-500 text-white p-2 ml-2"
                >
                  Create
                </button>

                <h3 className="mt-4 font-bold">Users</h3>
                {users.map(u => (
                  <div key={u._id}>
                    {u.username} - {u.role}
                  </div>
                ))}
              </div>
            )}

            {/* WEEK VIEW */}
            {days.map(day => (
              <div key={day} className="bg-white p-4 rounded shadow mb-4">
                <h2 className="text-green-600 text-xl">{day}</h2>

                <div className="grid grid-cols-4 font-bold mt-2">
                  <span>Time</span>
                  <span>Meet</span>
                  <span>Student</span>
                  <span>Action</span>
                </div>

                {sessions
                  .filter(
                    s =>
                      new Date(s.date).toLocaleString("en-US", {
                        weekday: "long"
                      }) === day
                  )
                  .map(s => (
                    <div key={s._id} className="grid grid-cols-4 mt-2">
                      <span>{s.time}</span>

                      <a
                        href={s.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500"
                      >
                        Join
                      </a>

                      <span>{s.student}</span>

                      {role === "tutor" ? (
                        <button
                          onClick={() => reschedule(s._id)}
                          className="text-indigo-600"
                        >
                          Reschedule
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full bg-gray-100">
          <div className="bg-white p-6 w-80 rounded shadow">
            <h2 className="text-xl mb-4">Login</h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="border p-2 w-full mb-2"
              placeholder="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="bg-indigo-600 text-white w-full p-2"
              onClick={login}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;