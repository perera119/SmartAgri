import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Map as MapIcon, 
  ShieldCheck, 
  Activity, 
  Trash2, 
  UserPlus, 
  RefreshCcw, 
  AlertOctagon, 
  CheckCircle2, 
  Navigation, 
  Cpu, 
  Globe, 
  Send,
  Plus,
  X,
  ChevronRight,
  UserCheck,
  Building2,
  Database,
  BarChart3,
  Sparkles
} from "lucide-react";
import SRI_LANKA_LOCATIONS from "../data/sriLankaLocations";

const API = "http://127.0.0.1:5001";
const AI_BASE = "http://127.0.0.1:8000";

// ── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm group hover:border-emerald-200 transition-all duration-500 relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 mb-1">{value ?? "—"}</p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{trend}</p>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
    {/* Subtle Glow */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${color.replace('text-', 'bg-')}`}></div>
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
  const [farmForm,     setFarmForm]     = useState({ name:"", district:"", city:"", cropType:"", areaHa:"", ownerName:"", notes:"" });
  const [addingFarm,   setAddingFarm]   = useState(false);
  const [activeTab,    setActiveTab]    = useState("overview");

  const [broadcastRegion,  setBroadcastRegion]  = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting,      setBroadcasting]      = useState(false);
  const [generatingAi,      setGeneratingAi]      = useState(false);

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
      setError("System gateway unresponsive. Verify backend connectivity.");
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
      showToast(`${user.firstName} escalated to ${newRole}`);
    } catch { showToast("Role modification failed."); }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`${API}/api/admin/users/${deleteModal._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id));
      showToast("Identity purged from records.");
    } catch { showToast("Purge failed."); }
    finally { setDeleteModal(null); fetchAll(); }
  };

  const handleAddFarm = async (e) => {
    e.preventDefault();
    setAddingFarm(true);
    try {
      showToast("Initiating orbital geocoding...");
      let lat = 7.8731, lon = 80.7718;
      try {
        const query = `${farmForm.city || farmForm.district}, Sri Lanka`;
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        if (geoRes.data?.[0]) {
          lat = parseFloat(geoRes.data[0].lat) + (Math.random() - 0.5) * 0.02;
          lon = parseFloat(geoRes.data[0].lon) + (Math.random() - 0.5) * 0.02;
        }
      } catch (geoErr) { console.error("Geocoding failed", geoErr); }

      await axios.post(`${API}/api/admin/farms`, {
        ...farmForm,
        district: `${farmForm.district} - ${farmForm.city}`,
        lat, lon,
        areaHa: parseFloat(farmForm.areaHa) || 0,
        addedBy: "System Admin",
      });
      showToast("Regional node established.");
      setShowAddFarm(false);
      setFarmForm({ name:"", district:"", city:"", cropType:"", areaHa:"", ownerName:"", notes:"" });
      fetchAll();
    } catch { showToast("Deployment failed."); }
    finally { setAddingFarm(false); }
  };

  const handleDeleteFarm = async () => {
    if (!deleteFarmId) return;
    try {
      await axios.delete(`${API}/api/admin/farms/${deleteFarmId}`);
      setFarms(prev => prev.filter(f => f._id !== deleteFarmId));
      showToast("Node dismantled and removed from grid.");
    } catch { showToast("Decommissioning failed."); }
    finally { setDeleteFarmId(null); }
  };

  const handleAiGenerate = async () => {
    if (!broadcastMessage) {
      showToast("Enter a keyword (e.g. flood) first.");
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await axios.post(`${AI_BASE}/api/ai/generate-broadcast`, {
        keyword: broadcastMessage,
        region: broadcastRegion || "National"
      });
      setBroadcastMessage(res.data.message);
      showToast("AI intelligence synthesized.");
    } catch {
      showToast("AI synthesis failed.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastRegion || !broadcastMessage) {
      showToast("Region and message required for broadcast.");
      return;
    }
    setBroadcasting(true);
    try {
      await axios.post(`${API}/api/admin/broadcast`, {
        region: broadcastRegion,
        message: broadcastMessage,
        severity: "High",
        type: "Government Official Warning"
      });
      showToast("Orbital broadcast sequence initiated.");
      setBroadcastMessage("");
    } catch {
      showToast("Broadcast transmission failed.");
    } finally {
      setBroadcasting(false);
    }
  };

  const initials = (u) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-600/20 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Authenticating Authority...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Cinematic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 font-display tracking-tight leading-none mb-4">Command Center</h2>
          <p className="text-slate-500 font-medium max-w-2xl text-lg">Centralized regional oversight and administrative control for the Smart Agricultural Disaster Early Warning Network.</p>
        </div>
      </div>

      {/* Primary Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Network Users" value={stats?.totalUsers} icon={Users} color="bg-emerald-50 text-emerald-600" trend="Active Operations" />
        <StatCard label="Regional Admins" value={stats?.adminUsers} icon={UserCheck} color="bg-rose-50 text-rose-600" trend="Privileged Access" />
        <StatCard label="Monitored Farms" value={farms?.length} icon={Building2} color="bg-blue-50 text-blue-600" trend="Satellite Coverage" />
        <StatCard label="Data Ingress" value={stats?.totalSensorReadings} icon={Activity} color="bg-amber-50 text-amber-600" trend="Live Telemetry" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* User Registry */}
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">User Registry</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Authorized network participants</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <Users size={18} />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {users.map((u) => {
                const isSelf = u.email === currentUser?.email;
                return (
                  <div key={u._id} className="group flex items-center gap-6 px-10 py-6 hover:bg-slate-50/80 transition-all">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm transition-transform group-hover:scale-105 ${
                      u.role === "Admin" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {initials(u)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900">{u.firstName} {u.lastName}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          u.role === "Admin" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={isSelf}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-0"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModal(u)}
                        disabled={isSelf}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Farm Network Grid */}
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Regional Farm Grid</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Satellite-monitored agricultural nodes</p>
              </div>
              <button 
                onClick={() => setShowAddFarm(true)}
                className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 hover:scale-110 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-slate-50">
              {farms.map(f => (
                <div key={f._id} className="p-8 hover:bg-slate-50/50 transition-all relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MapIcon size={20} />
                    </div>
                    <button 
                      onClick={() => setDeleteFarmId(f._id)}
                      className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h4 className="font-black text-slate-900 mb-1">{f.name}</h4>
                  <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">{f.district}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.cropType}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {f.areaHa} Ha
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-End Widgets */}
        <div className="space-y-8">
          
          {/* Neural Health Terminal */}
          <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Neural Engine</p>
                  <h4 className="text-lg font-black">System Integrity</h4>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: "AI Microservice", status: "Active", icon: Activity, color: "text-emerald-400" },
                  { label: "Neural Predictions", status: "Nominal", icon: Globe, color: "text-blue-400" },
                  { label: "Satellite Sync", status: "Live", icon: Navigation, color: "text-amber-400" },
                  { label: "Mainframe DB", status: "Encrypted", icon: Database, color: "text-rose-400" }
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <s.icon size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{s.label}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Global Heartbeat</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  Encryption active. Multi-spectral sensors communicating across {farms.length} regional nodes. No anomalies detected.
                </p>
              </div>
            </div>
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
          </div>

          {/* Broadcast Intelligence */}
          <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Send size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Broadcast</p>
                <h4 className="text-lg font-black text-slate-900">Issue Official Alert</h4>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              Manually trigger a high-priority government warning to all users in the selected region.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <select 
                  value={broadcastRegion}
                  onChange={(e) => setBroadcastRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Region</option>
                  <option value="National">National / All Regions</option>
                  {Object.keys(SRI_LANKA_LOCATIONS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
              </div>
              <div className="relative">
                <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type a keyword (e.g. flood) or compose manually..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none h-32 focus:border-emerald-500 transition-all pr-12"
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={generatingAi}
                  className="absolute right-4 top-4 p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                  title="Generate with AI"
                >
                  <Sparkles size={16} className={generatingAi ? "animate-pulse" : ""} />
                </button>
              </div>
              <button 
                onClick={handleBroadcast}
                disabled={broadcasting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {broadcasting ? <RefreshCcw className="animate-spin" size={16} /> : <AlertOctagon size={16} />}
                {broadcasting ? "Transmitting..." : "Execute Broadcast"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Add Farm Modal */}
      <AnimatePresence>
        {showAddFarm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowAddFarm(false)}>
            <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:20 }}
              className="bg-white rounded-[48px] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowAddFarm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">Add Farm Node</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Regional Network Expansion</p>
                </div>
              </div>

              <form onSubmit={handleAddFarm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Identification</label>
                    <input type="text" placeholder="Farm Name" required value={farmForm.name} onChange={e => setFarmForm(p=>({...p, name:e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Agriculture Type</label>
                    <input type="text" placeholder="Crop Type (e.g. Paddy)" required value={farmForm.cropType} onChange={e => setFarmForm(p=>({...p, cropType:e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Jurisdiction</label>
                    <select required value={farmForm.district} onChange={e => setFarmForm(p=>({...p, district:e.target.value, city:""}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-emerald-500 transition-all">
                      <option value="">Select District</option>
                      {Object.keys(SRI_LANKA_LOCATIONS).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Locality</label>
                    <select required disabled={!farmForm.district} value={farmForm.city} onChange={e => setFarmForm(p=>({...p, city:e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-emerald-500 transition-all disabled:opacity-50">
                      <option value="">Select City</option>
                      {(SRI_LANKA_LOCATIONS[farmForm.district] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={addingFarm} className="flex-1 bg-emerald-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-60 flex items-center justify-center gap-3">
                    {addingFarm ? "Geocoding..." : <><CheckCircle2 size={16} /> Deploy Node</>}
                  </button>
                  <button type="button" onClick={() => setShowAddFarm(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className="fixed bottom-10 right-10 z-[300] bg-slate-900 text-white px-8 py-5 rounded-[32px] text-sm font-black shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modals (Simplified for brevity but styled same as others) */}
      {deleteModal && (
        <div className="fixed inset-0 z-[250] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setDeleteModal(null)}>
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6"><Trash2 size={28} /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Purge</h3>
            <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">Permanently delete <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> and all associated data from the regional mainframe?</p>
            <div className="flex gap-4">
              <button onClick={handleDeleteUser} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all">Yes, Purge</button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

      {deleteFarmId && (
        <div className="fixed inset-0 z-[250] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setDeleteFarmId(null)}>
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6"><Building2 size={28} /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Dismantle Node</h3>
            <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">Remove this agricultural node from the orbital monitoring grid?</p>
            <div className="flex gap-4">
              <button onClick={handleDeleteFarm} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all">Yes, Dismantle</button>
              <button onClick={() => setDeleteFarmId(null)} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

