import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://127.0.0.1:5001";

const statCard = (label, value, sub, color) => (
  <div className={`bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-4xl font-black ${color} mb-1`}>{value ?? "—"}</p>
    {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
  </div>
);

export default function AdminDashboard({ currentUser }) {
  const [stats,        setStats]        = useState(null);
  const [users,        setUsers]        = useState([]);
  const [farms,        setFarms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [deleteFarmId, setDeleteFarmId] = useState(null);
  const [toast,        setToast]        = useState("");
  const [showAddFarm,  setShowAddFarm]  = useState(false);
  const [farmForm,     setFarmForm]     = useState({ name:"", district:"", cropType:"", lat:"", lon:"", areaHa:"", ownerName:"", notes:"" });
  const [addingFarm,   setAddingFarm]   = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const [statsRes, usersRes, farmsRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`),
        axios.get(`${API}/api/admin/users`),
        axios.get(`${API}/api/admin/farms`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFarms(farmsRes.data);
    } catch {
      setError("Could not load admin data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "Admin" ? "User" : "Admin";
    try {
      await axios.put(`${API}/api/admin/users/${user._id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      showToast(`${user.firstName}'s role changed to ${newRole}`);
    } catch { showToast("Failed to update role."); }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`${API}/api/admin/users/${deleteModal._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id));
      showToast(`${deleteModal.firstName} ${deleteModal.lastName} deleted.`);
    } catch { showToast("Failed to delete user."); }
    finally { setDeleteModal(null); fetchAll(); }
  };

  const handleAddFarm = async (e) => {
    e.preventDefault();
    setAddingFarm(true);
    try {
      await axios.post(`${API}/api/admin/farms`, {
        ...farmForm,
        lat: parseFloat(farmForm.lat),
        lon: parseFloat(farmForm.lon),
        areaHa: parseFloat(farmForm.areaHa) || 0,
        addedBy: "Admin",
      });
      showToast("Farm added successfully!");
      setShowAddFarm(false);
      setFarmForm({ name:"", district:"", cropType:"", lat:"", lon:"", areaHa:"", ownerName:"", notes:"" });
      fetchAll();
    } catch { showToast("Failed to add farm."); }
    finally { setAddingFarm(false); }
  };

  const handleDeleteFarm = async () => {
    if (!deleteFarmId) return;
    try {
      await axios.delete(`${API}/api/admin/farms/${deleteFarmId}`);
      setFarms(prev => prev.filter(f => f._id !== deleteFarmId));
      showToast("Farm deleted.");
    } catch { showToast("Failed to delete farm."); }
    finally { setDeleteFarmId(null); }
  };

  const initials = (u) =>
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-bold">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1,  y:   0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[200] bg-emerald-900 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.93,    opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl mb-6">🗑️</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete User?</h3>
              <p className="text-slate-500 font-medium mb-8">
                Permanently delete <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> ({deleteModal.email})?
              </p>
              <div className="flex gap-4">
                <button onClick={handleDeleteUser} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black hover:bg-rose-700 transition-all">Yes, Delete</button>
                <button onClick={() => setDeleteModal(null)} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-rose-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">System Administration</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Admin Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-100 px-5 py-2.5 rounded-2xl text-xs font-black text-rose-700 uppercase tracking-widest">
            🔐 Admin Access
          </div>
          <button
            onClick={fetchAll}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {statCard("Total Users",        stats?.totalUsers,         "Registered accounts",       "text-slate-900")}
        {statCard("Admin Users",        stats?.adminUsers,         "With admin privileges",     "text-rose-600")}
        {statCard("Regular Users",      stats?.regularUsers,       "Standard access",           "text-emerald-700")}
        {statCard("Sensor Readings",    stats?.totalSensorReadings,"Total data points logged",  "text-blue-600")}
      </div>

      {/* Latest Sensor reading if available */}
      {stats?.latestSensor && (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Latest Sensor Reading</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Temperature",   value: `${stats.latestSensor.temperature}°C`,    color: "text-orange-600" },
              { label: "Humidity",      value: `${stats.latestSensor.humidity}%`,         color: "text-blue-600"   },
              { label: "Soil Moisture", value: `${stats.latestSensor.soilMoisture}%`,    color: "text-emerald-600"},
              { label: "Rainfall",      value: `${stats.latestSensor.rainfall} mm`,       color: "text-slate-600"  },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-2xl px-5 py-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4">
            Recorded: {new Date(stats.latestSensor.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Control</p>
            <h3 className="text-xl font-black text-slate-900">User Management</h3>
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{users.length} users</span>
        </div>

        <div className="divide-y divide-slate-50">
          {users.length === 0 ? (
            <div className="px-10 py-12 text-center text-slate-400 font-bold">No users found</div>
          ) : (
            users.map((u) => {
              const isSelf = u.email === currentUser?.email;
              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-6 px-10 py-5 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    u.role === "Admin" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {initials(u)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 text-sm">
                        {u.firstName} {u.lastName}
                        {isSelf && <span className="ml-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">{u.email}</p>
                  </div>

                  {/* Joined */}
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                    <p className="text-xs font-bold text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Role badge */}
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex-shrink-0 ${
                    u.role === "Admin"
                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {u.role}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      disabled={isSelf}
                      title={isSelf ? "Cannot change your own role" : `Switch to ${u.role === "Admin" ? "User" : "Admin"}`}
                      className="px-4 py-2 text-[11px] font-black rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      {u.role === "Admin" ? "→ User" : "→ Admin"}
                    </button>
                    <button
                      onClick={() => setDeleteModal(u)}
                      disabled={isSelf}
                      title={isSelf ? "Cannot delete yourself" : "Delete user"}
                      className="px-4 py-2 text-[11px] font-black rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Farm delete confirm */}
      <AnimatePresence>
        {deleteFarmId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setDeleteFarmId(null)}>
            <motion.div initial={{ scale:0.93 }} animate={{ scale:1 }} exit={{ scale:0.93 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="text-3xl mb-4">🌾</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Farm?</h3>
              <p className="text-slate-500 font-medium mb-8">This farm record will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={handleDeleteFarm} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black hover:bg-rose-700 transition-all">Yes, Delete</button>
                <button onClick={() => setDeleteFarmId(null)} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Farm Management ── */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry</p>
            <h3 className="text-xl font-black text-slate-900">Farm Management</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{farms.length} farms</span>
            <button
              onClick={() => setShowAddFarm(v => !v)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
            >
              {showAddFarm ? "Cancel" : "+ Add Farm"}
            </button>
          </div>
        </div>

        {/* Add Farm Form */}
        <AnimatePresence>
          {showAddFarm && (
            <motion.form
              initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              onSubmit={handleAddFarm}
              className="px-10 py-8 bg-emerald-50/40 border-b border-slate-100 overflow-hidden"
            >
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5">New Farm Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { key:"name",      label:"Farm Name",    required:true  },
                  { key:"district",  label:"District",     required:true  },
                  { key:"cropType",  label:"Crop Type",    required:true  },
                  { key:"lat",       label:"Latitude",     required:true  },
                  { key:"lon",       label:"Longitude",    required:true  },
                  { key:"areaHa",    label:"Area (Ha)",    required:false },
                  { key:"ownerName", label:"Owner Name",   required:false },
                  { key:"notes",     label:"Notes",        required:false },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}{f.required && " *"}</label>
                    <input
                      type="text"
                      value={farmForm[f.key]}
                      onChange={e => setFarmForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required={f.required}
                      className="bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit" disabled={addingFarm}
                className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                {addingFarm ? "Adding..." : "Add Farm"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Farm List */}
        <div className="divide-y divide-slate-50">
          {farms.length === 0 ? (
            <div className="px-10 py-12 text-center text-slate-400 font-bold">No farms added yet. Click "+ Add Farm" to start.</div>
          ) : (
            farms.map(f => (
              <div key={f._id} className="flex items-center gap-5 px-10 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg flex-shrink-0">🌾</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{f.district} · {f.cropType}{f.ownerName ? ` · ${f.ownerName}` : ""}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinates</p>
                  <p className="text-xs font-bold text-slate-600">{f.lat}°N, {f.lon}°E</p>
                </div>
                {f.areaHa > 0 && (
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</p>
                    <p className="text-xs font-bold text-slate-600">{f.areaHa} Ha</p>
                  </div>
                )}
                <button
                  onClick={() => setDeleteFarmId(f._id)}
                  className="px-4 py-2 text-[11px] font-black rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all uppercase tracking-widest flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
