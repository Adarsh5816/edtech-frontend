import { useState, useEffect, useCallback } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
  setLoading(true);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Server waking up... try again");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      alert(data.error || "Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", data.token);
    setIsLoggedIn(true);

  } catch (err) {
    if (err.name === "AbortError") {
      alert("Server timeout. Try again.");
    } else {
      alert("Backend not reachable");
    }
  }

  setLoading(false);
};

  // ================= LOAD DATA =================
  const loadData = useCallback(async () => {
    const token = getToken();

    try {
      const d = await fetch(`${BASE}/dashboard`, {
        headers: { Authorization: token }
      });
      const dash = await d.json();
      setRole(dash.role);

      const s = await fetch(`${BASE}/sessions`, {
        headers: { Authorization: token }
      });
      setSessions(await s.json());

      if (dash.role === "admin") {
        const u = await fetch(`${BASE}/users`, {
          headers: { Authorization: token }
        });
        setUsers(await u.json());
      }
    } catch (err) {
      console.log("Load error", err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn, loadData]);

  // ================= MOBILE DETECTION =================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    loadData();
  };

  // ================= RESCHEDULE =================
  const reschedule = async (id) => {
    const time = prompt("New time");
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
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      {isLoggedIn && (
        <>
          {isMobile ? (
            <>
              <button
                className="fixed top-3 left-3 z-50 bg-indigo-600 text-white px-3 py-2 rounded"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
              </button>

              {menuOpen && (
                <div className="fixed bg-indigo-600 text-white w-60 h-full p-5 z-40">
                  <h2 className="text-xl font-bold mb-4">EdTech</h2>
                  <p className="mb-4">{role}</p>

                  <button
                    className="bg-red-500 w-full p-2 rounded"
                    onClick={() => {
                      localStorage.removeItem("token");
                      setIsLoggedIn(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-60 bg-indigo-600 text-white p-5">
              <h2 className="text-xl font-bold mb-4">EdTech</h2>
              <p className="mb-4">{role}</p>

              <button
                className="bg-red-500 w-full p-2 rounded"
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </>
      )}

      {/* MAIN */}
      <div className={`flex-1 p-4 ${!isMobile ? "ml-60" : ""}`}>

        {!isLoggedIn ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-6 rounded shadow w-full max-w-sm">
              <h2 className="text-xl mb-4">Login</h2>

              <input
                className="border p-2 w-full mb-3"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-3"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="bg-indigo-600 text-white w-full p-2 rounded"
                onClick={login}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {role === "admin" && (
              <div className="bg-white p-4 rounded shadow mb-4">
                <h3 className="font-bold mb-2">Create User</h3>

                <div className="flex flex-col md:flex-row gap-2">
                  <input className="border p-2 flex-1"
                    placeholder="username"
                    onChange={(e)=>setNewUser({...newUser, username:e.target.value})} />

                  <input className="border p-2 flex-1"
                    placeholder="password"
                    onChange={(e)=>setNewUser({...newUser, password:e.target.value})} />

                  <select className="border p-2"
                    onChange={(e)=>setNewUser({...newUser, role:e.target.value})}>
                    <option value="student">student</option>
                    <option value="tutor">tutor</option>
                  </select>

                  <button onClick={createUser} className="bg-green-500 text-white px-4">
                    Create
                  </button>
                </div>

                <h3 className="mt-4 font-bold">Users</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {users.map(u => (
                    <div key={u._id} className="bg-gray-100 p-2 rounded">
                      {u.username} - {u.role}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {days.map(day => (
              <div key={day} className="bg-white p-4 rounded shadow mb-4">
                <h2 className="text-green-600 text-lg">{day}</h2>

                {sessions
                  .filter(s => new Date(s.date).toLocaleString("en-US",{weekday:"long"})===day)
                  .map(s => (
                    <div key={s._id} className="flex flex-col md:flex-row justify-between border-b py-2">
                      <span>{s.time}</span>

                      <a href={s.meetLink} target="_blank" rel="noreferrer"
                        className="text-blue-500">
                        Join
                      </a>

                      <span>{s.student}</span>

                      {role === "tutor" && (
                        <button onClick={()=>reschedule(s._id)} className="text-indigo-600">
                          Reschedule
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;