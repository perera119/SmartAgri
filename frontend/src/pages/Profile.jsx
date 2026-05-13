import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = "http://127.0.0.1:5001";

export default function Profile({ user, onUserUpdate }) {
  const [mode, setMode]           = useState("view"); // "view" | "edit"
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName,  setLastName]  = useState(user?.lastName  || "");
  const [email,     setEmail]     = useState(user?.email     || "");
  const [password,  setPassword]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState("");
  const [error,     setError]     = useState("");

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        email: user.email,       // current email to identify user
        firstName,
        lastName,
        newEmail: email !== user.email ? email : undefined,
        password: password || undefined,
      };

      const res = await axios.put(`${API_BASE}/api/profile`, payload);

      // Update localStorage and parent state with the new user object
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      setMessage("Profile updated successfully!");
      setMode("view");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Account</span>
        <h2 className="text-5xl font-black text-slate-900 font-display tracking-tight leading-none">
          {mode === "edit" ? "Edit Profile" : "Your Profile"}
        </h2>
      </div>

      {/* Success / Error messages */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-sm font-semibold">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Avatar banner */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 px-10 py-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/30 flex items-center justify-center text-3xl font-black text-white shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-white text-2xl font-black">{user?.firstName} {user?.lastName}</h3>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-1">{user?.role} · AgriWatch AI</p>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="px-10 py-8 space-y-6">
          {mode === "view" ? (
            /* ── VIEW MODE ─────────────────────────────────── */
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</p>
                  <p className="text-base font-bold text-slate-900">{user?.firstName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</p>
                  <p className="text-base font-bold text-slate-900">{user?.lastName}</p>
                </div>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-base font-bold text-slate-900">{user?.email}</p>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</p>
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <button
                  onClick={() => setMode("edit")}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10"
                >
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            /* ── EDIT MODE ─────────────────────────────────── */
            <>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password <span className="normal-case font-normal text-slate-300">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setMode("view");
                    setFirstName(user?.firstName || "");
                    setLastName(user?.lastName || "");
                    setEmail(user?.email || "");
                    setPassword("");
                    setError("");
                  }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
