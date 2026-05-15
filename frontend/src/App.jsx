import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Bell, 
  Settings, 
  Activity, 
  AlertTriangle,
  X,
  Globe
} from "lucide-react";

// Components
import Navbar from "./components/Navbar";

// Pages
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Monitoring from "./pages/Monitoring";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmRegistry from "./pages/FarmRegistry";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

const API_BASE = "http://127.0.0.1:5001";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsLoggedIn(true);
      if (parsed.role === "Admin") setActivePage("admin");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setActivePage(userData.role === "Admin" ? "admin" : "dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };
  const [farmVisitCount, setFarmVisitCount] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [alertsData, setAlertsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Role-based Navigation
  const menuItems = user?.role === "Admin"
    ? [
        { key: "admin",      label: "Admin Panel",    icon: Settings },
        { key: "farms",      label: "Geospatial Map", icon: Globe },
        { key: "dashboard",  label: "System Status",  icon: LayoutDashboard }
      ]
    : [
        { key: "dashboard",  label: "Home",           icon: LayoutDashboard },
        { key: "alerts",     label: "Alerts",         icon: Bell            },
        { key: "monitoring", label: "Monitoring",     icon: Activity        },
        { key: "farms",      label: "Farm Map",       icon: Globe           },
      ];

  const fetchData = async () => {
    try {
      const [dashboardRes, alertsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/api/dashboard`),
        axios.get(`${API_BASE}/api/alerts`),
        axios.get(`${API_BASE}/api/history`),
      ]);

      setDashboardData(dashboardRes.data);
      setAlertsData(Array.isArray(alertsRes.data) ? alertsRes.data : []);
      setHistoryData(Array.isArray(historyRes.data) ? historyRes.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to sync with farm sensors. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    try {
      const simulatedData = {
        fieldId: "north-field",
        temperature: Math.floor(Math.random() * (40 - 20 + 1) + 20),
        humidity: Math.floor(Math.random() * (90 - 40 + 1) + 40),
        soilMoisture: Math.floor(Math.random() * (80 - 10 + 1) + 10),
        rainfall: Math.floor(Math.random() * (50 - 0 + 1) + 0)
      };

      await axios.post(`${API_BASE}/api/sensors`, simulatedData);
      await fetchData(); // Refresh UI immediately
      return true;
    } catch (err) {
      console.error("Simulation failed:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  if (loading && isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <img src="/logo.png" alt="AgriWatch" className="w-32 h-32 object-contain" />
          <h2 className="text-2xl font-black text-emerald-900 font-display">AgriWatch</h2>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-1/2 h-full bg-emerald-600"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        {authView === "login" ? (
          <Login key="login" onLogin={handleLogin} onSwitch={() => setAuthView("register")} />
        ) : (
          <Register key="register" onRegister={handleLogin} onSwitch={() => setAuthView("login")} />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar 
        activePage={activePage} 
        setActivePage={(page) => {
          if (page === "farms") setFarmVisitCount(c => c + 1);
          setActivePage(page);
        }}
        menuItems={menuItems} 
        setIsLoggedIn={handleLogout} 
        user={user}
        alertsData={alertsData}
      />

      <main className="flex-1 overflow-y-auto">
        <div className={activePage === "dashboard" ? "" : "max-w-[1600px] mx-auto p-10 pt-6"}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-amber-50 text-amber-700 px-6 py-4 rounded-[28px] text-sm font-bold border border-amber-100 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                {error}
              </div>
              <button onClick={() => setError("")} className="text-amber-800/40 hover:text-amber-800 transition-colors">
                <X size={18} />
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activePage === "dashboard" && (
                <Dashboard 
                  data={dashboardData} 
                  history={historyData} 
                  onSimulate={handleSimulate} 
                />
              )}
              {activePage === "alerts" && <Alerts />}
              {activePage === "monitoring" && <Monitoring />}
              {activePage === "farms" && <FarmRegistry key={farmVisitCount} />}
              {activePage === "settings" && <SettingsPage />}
              {activePage === "profile" && <Profile user={user} onUserUpdate={handleUserUpdate} />}
              {activePage === "admin" && user?.role === "Admin" && <AdminDashboard currentUser={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;