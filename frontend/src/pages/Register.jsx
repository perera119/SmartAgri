import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5001";

export default function Register({ onRegister, onSwitch }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "User"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_BASE}/api/register`, formData);
      setSuccess("Account created successfully! You can now log in.");
      setTimeout(() => {
        onSwitch(); // Switch to login after success
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
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
          <h2 className="text-4xl font-black text-slate-900 font-display mb-3 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium px-4">Join the AgriWatch precision network today</p>
        </div>

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
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-400">
            Already have an account? 
            <button onClick={onSwitch} className="text-emerald-600 ml-2 hover:underline">Login Here</button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">© 2026 AgriWatch Solutions • Secure Portal</p>
      </div>
    </motion.div>
  );
}
