import { motion, AnimatePresence } from "framer-motion";
import { 
  Sprout, LogOut, Menu, X, ChevronDown, Shield
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ activePage, setActivePage, menuItems, setIsLoggedIn, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen,    setIsProfileOpen]    = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials from user name
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const profileMenuItems = [
    {
      label: "View Profile",
      desc: "See your account details",
      action: () => { setActivePage("profile"); setIsProfileOpen(false); },
    },
    {
      label: "Edit Profile",
      desc: "Update your information",
      action: () => { setActivePage("profile"); setIsProfileOpen(false); },
    },
    {
      label: "Settings",
      desc: "Manage your preferences",
      action: () => { setActivePage("settings"); setIsProfileOpen(false); },
    },
  ];

  return (
    <nav className="sticky top-0 bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 z-[100] shadow-sm">
      <div className="max-w-[1600px] mx-auto px-8 py-3 flex items-center justify-between gap-6">

        {/* ── Logo ───────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 group cursor-pointer flex-shrink-0"
          onClick={() => setActivePage("dashboard")}
        >
          <div className="bg-emerald-900 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
            <Sprout size={18} className="text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight font-display text-emerald-900 leading-none">AgriWatch</h1>
            <span className="text-[9px] font-black tracking-[0.3em] text-emerald-600 uppercase">Precision Systems</span>
          </div>
        </div>

        {/* ── Nav Links ──────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50 flex-1 justify-center">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`px-5 py-2 rounded-xl transition-all duration-200 font-semibold text-sm whitespace-nowrap ${
                activePage === item.key
                  ? "bg-white text-emerald-900 shadow-md shadow-emerald-900/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Right Controls ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* ── Profile Dropdown ─────────────────────────────────── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-2xl border transition-all duration-200 ${
                isProfileOpen
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner flex-shrink-0 ${
                isProfileOpen ? "bg-emerald-500 text-white" : "bg-emerald-900 text-emerald-300"
              }`}>
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className={`text-xs font-black leading-none ${isProfileOpen ? "text-white" : "text-slate-800"}`}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isProfileOpen ? "text-emerald-400" : "text-emerald-600"}`}>
                  {user?.role || "User"}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-slate-300" : "text-slate-400"}`}
              />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white rounded-[28px] border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-xl font-black text-white shadow-lg">
                        {initials}
                      </div>
                      <div>
                        <p className="text-white font-black text-base leading-tight">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                          {user?.role || "User"} Portal
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Shield size={10} className="text-emerald-400" />
                          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Verified Account</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-3 space-y-0.5">
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex flex-col px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all text-left border-l-2 border-transparent hover:border-emerald-500 hover:pl-5"
                      >
                        <span className="text-sm font-bold text-slate-800">{item.label}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Divider + Logout */}
                  <div className="px-3 pb-3">
                    <div className="border-t border-slate-100 mb-3"></div>
                    <button
                      onClick={() => { setIsLoggedIn(false); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 transition-all text-left border-l-2 border-transparent hover:border-rose-400 hover:pl-5"
                    >
                      <div>
                        <p className="text-sm font-bold text-rose-600">Log Out</p>
                        <p className="text-[11px] text-rose-400 font-medium">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2.5 text-slate-600 bg-slate-100 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation ──────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 space-y-1 bg-slate-50">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActivePage(item.key); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    activePage === item.key
                      ? "bg-emerald-900 text-white"
                      : "text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
