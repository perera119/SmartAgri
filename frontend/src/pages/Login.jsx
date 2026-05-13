import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5001";

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("sanjula@agriwatch.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/login`, { email, password });
      // In a real app, you'd store the token/user in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your connection.");
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
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Centered Login Card */}
      <div className="max-w-[480px] w-full bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-emerald-950/20 border border-white/20 p-12 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 font-display mb-3 tracking-tight">Login</h2>
          <p className="text-slate-500 font-medium px-4">Sign in to your AgriWatch account to continue</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
              <button type="button" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Forgot Password?</button>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 px-1 mb-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-emerald-600 cursor-pointer" />
            <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Keep me signed in</label>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full bg-emerald-900 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-400">
            Don't have an account? 
            <button onClick={onSwitch} className="text-emerald-600 ml-2 hover:underline">Register</button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">© 2026 AgriWatch Solutions • Secure Portal</p>
      </div>
    </motion.div>
  );
}
