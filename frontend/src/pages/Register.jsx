import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import SRI_LANKA_LOCATIONS from "../data/sriLankaLocations";

const API_BASE = "http://127.0.0.1:5001";

export default function Register({ onRegister, onSwitch }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "User"
  });
  const [farmForm, setFarmForm] = useState({
    name: "", district: "", city: "", cropType: "", areaHa: "", notes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFarmChange = (e) => {
    setFarmForm({ ...farmForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_BASE}/api/register`, formData);
      
      if (formData.role === "Admin") {
        setSuccess("Admin account established. Redirecting to terminal...");
        setTimeout(() => {
          onSwitch(); // Go to login
        }, 2000);
      } else {
        setSuccess("Account created! Let's map your farm.");
        setTimeout(() => {
          setStep(2);
          setSuccess("");
          setError("");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setSuccess("Locating farm via satellite...");
      
      let lat = 7.8731;
      let lon = 80.7718;
      
      try {
      const query = `${farmForm.city || farmForm.district}, Sri Lanka`;
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        if (geoRes.data && geoRes.data.length > 0) {
          lat = parseFloat(geoRes.data[0].lat);
          lon = parseFloat(geoRes.data[0].lon);
          lat += (Math.random() - 0.5) * 0.05;
          lon += (Math.random() - 0.5) * 0.05;
        }
      } catch (err) { }

      await axios.post(`${API_BASE}/api/admin/farms`, {
        ...farmForm,
        district: `${farmForm.district} - ${farmForm.city}`,
        lat, lon,
        areaHa: parseFloat(farmForm.areaHa) || 0,
        addedBy: `${formData.firstName} ${formData.lastName}`
      });

      setSuccess("Farm added successfully!");
      setTimeout(() => onSwitch(), 1500);
    } catch (err) {
      setError("Failed to add farm. You can skip this step.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Full Desktop Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Luxury Farm Background" 
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Centered Register Card */}
      <div className="max-w-[540px] w-full bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-emerald-950/20 border border-white/20 p-12 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 font-display mb-3 tracking-tight">
            {step === 1 ? "Create Account" : "Add Your Farm"}
          </h2>
          <p className="text-slate-500 font-medium px-4">
            {step === 1 ? "Join the AgriWatch precision network today" : "Step 2: Plot your land on the global map"}
          </p>
        </div>

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 mb-4 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold border border-emerald-100 mb-4 overflow-hidden"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="Sanjula"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Perera"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number (For Alerts)</label>
              <input 
                type="tel" 
                name="phone"
                placeholder="+94 77 123 4567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>

            {/* Role Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading}
                className="w-full bg-emerald-900 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : `Create ${formData.role} Account`}
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-slate-400">
                Already have an account? 
                <button type="button" onClick={onSwitch} className="text-emerald-600 ml-2 hover:underline">Login Here</button>
              </p>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleFarmSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 mb-4">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold border border-emerald-100 mb-4 flex items-center gap-2">
                  {success.includes("Locating") && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Farm Name *</label>
                <input type="text" name="name" value={farmForm.name} onChange={handleFarmChange} required className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District *</label>
                <div className="relative">
                  <select
                    name="district"
                    value={farmForm.district}
                    onChange={(e) => setFarmForm(p => ({ ...p, district: e.target.value, city: "" }))}
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {Object.keys(SRI_LANKA_LOCATIONS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town *</label>
                <div className="relative">
                  <select
                    name="city"
                    value={farmForm.city}
                    onChange={handleFarmChange}
                    required
                    disabled={!farmForm.district}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{farmForm.district ? "Select City" : "Select district first"}</option>
                    {(SRI_LANKA_LOCATIONS[farmForm.district] || []).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crop Type *</label>
                <input type="text" name="cropType" placeholder="e.g. Rice, Tea" value={farmForm.cropType} onChange={handleFarmChange} required className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area (Hectares)</label>
                <input type="number" name="areaHa" placeholder="Optional" value={farmForm.areaHa} onChange={handleFarmChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Farm to Map"}
              </button>
              <button 
                type="button"
                onClick={onSwitch}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-base hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">© 2026 AgriWatch Solutions • Secure Portal</p>
      </div>
    </motion.div>
  );
}
