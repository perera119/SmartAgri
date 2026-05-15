import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Sprout, 
  Menu, 
  X, 
  ChevronDown, 
  Shield, 
  Bell, 
  Activity,
  LogOut,
  Settings,
  User as UserIcon,
  PhoneCall,
  Phone,
  Check,
  XCircle
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

const API_BASE = "http://127.0.0.1:5001";


export default function Navbar({ activePage, setActivePage, menuItems, setIsLoggedIn, user, alertsData }) {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || "");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
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

  // Calculate notifications
  const activeAlerts = alertsData?.filter(a => a.status?.toLowerCase() === "active") || [];
  const criticalAlertsCount = activeAlerts.filter(a => a.severity?.toLowerCase() === "critical").length;
  const hasNotifications = activeAlerts.length > 0;

  const handleSavePhone = async () => {
    setPhoneSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/api/profile`, {
        email: user?.email,
        phone: phoneInput
      });
      // Update localStorage
      const saved = JSON.parse(localStorage.getItem("user") || "{}");
      saved.phone = phoneInput;
      localStorage.setItem("user", JSON.stringify(saved));
      setPhoneSaved(true);
      setTimeout(() => { setPhoneSaved(false); setIsEditingPhone(false); }, 1200);
    } catch (err) {
      console.error("Failed to update phone", err);
    } finally {
      setPhoneSaving(false);
    }
  };

  const profileMenuItems = [
    {
      label: t('viewProfile'),
      desc: "See your account details",
      icon: UserIcon,
      action: () => { setActivePage("profile"); setIsProfileOpen(false); },
    },
    {
      label: "Change Alert Number",
      desc: user?.phone || "No number set",
      icon: Phone,
      action: () => { setIsEditingPhone(true); setPhoneInput(user?.phone || ""); },
    },
    {
      label: t('settings'),
      desc: "Manage your preferences",
      icon: Settings,
      action: () => { setActivePage("settings"); setIsProfileOpen(false); },
    },
  ];

  return (
    <div className={`sticky top-0 z-[100] px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 pb-4 pointer-events-none w-full ${activePage === "dashboard" ? "" : "bg-slate-50"}`}>
      <nav className="pointer-events-auto max-w-[1600px] mx-auto bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] lg:rounded-[2.5rem] px-3 lg:px-4 xl:px-5 py-2 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 transition-all duration-300 relative w-full">

        {/* ── Logo & Badge Area ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <div
            className="flex items-center gap-2 lg:gap-3 group cursor-pointer flex-shrink-0"
            onClick={() => setActivePage("dashboard")}
          >
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-2 lg:p-2.5 rounded-xl lg:rounded-[14px] group-hover:rotate-12 group-hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-900/20">
              <Sprout size={18} className="text-emerald-400 lg:w-5 lg:h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-xl font-black tracking-tight font-display text-slate-900 leading-none">AgriWatch</h1>
              <span className="text-[8px] lg:text-[10px] font-black tracking-[0.2em] lg:tracking-[0.25em] text-emerald-600 uppercase mt-0.5">Precision Systems</span>
            </div>
          </div>

        </div>

        {/* ── Main Navigation Links ──────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/40 flex-shrink min-w-0">
          {menuItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`relative px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full transition-all duration-300 font-bold text-[11px] xl:text-sm whitespace-nowrap overflow-hidden group flex-shrink-0 ${
                  isActive ? "text-emerald-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50 z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 xl:gap-2">
                  <item.icon size={14} className={`${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"} transition-colors xl:w-4 xl:h-4`} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Right Controls (Notifications & User) ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">

          {/* Notification Bell */}
          <button 
            onClick={() => setActivePage("alerts")}
            className="relative p-2 lg:p-2.5 rounded-full hover:bg-slate-100 transition-colors group flex-shrink-0"
          >
            <Bell size={18} className="text-slate-500 group-hover:text-slate-800 transition-colors lg:w-5 lg:h-5" />
            {hasNotifications && (
              <span className={`absolute top-1.5 right-1.5 lg:top-2 lg:right-2.5 w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full border-2 border-white ${criticalAlertsCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}></span>
            )}
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 lg:h-8 bg-slate-200/60"></div>

          {/* User Profile Dropdown */}
          <div className="relative flex-shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-1.5 lg:gap-2.5 pl-1 lg:pl-1.5 pr-2 lg:pr-3 py-1 lg:py-1.5 rounded-full border transition-all duration-200 overflow-hidden max-w-[120px] lg:max-w-[180px] xl:max-w-xs ${
                isProfileOpen
                  ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20"
                  : "bg-white border-slate-200/60 hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black shadow-inner flex-shrink-0 transition-colors ${
                isProfileOpen ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
              }`}>
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left overflow-hidden flex-1 min-w-0">
                <span className={`text-[10px] lg:text-xs font-black leading-none truncate ${isProfileOpen ? "text-white" : "text-slate-800"}`}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest mt-1 truncate ${isProfileOpen ? "text-emerald-400" : "text-slate-500"}`}>
                  {user?.role || "User"}
                </span>
              </div>
              <ChevronDown
                size={12}
                className={`ml-0.5 lg:ml-1 transition-transform duration-200 flex-shrink-0 lg:w-3.5 lg:h-3.5 ${isProfileOpen ? "rotate-180 text-slate-300" : "text-slate-400"}`}
              />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white rounded-[28px] border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden"
                >
                  <div className="bg-slate-900 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500 border border-emerald-400 flex items-center justify-center text-xl font-black text-white shadow-lg">
                        {initials}
                      </div>
                      <div>
                        <p className="text-white font-black text-base leading-tight">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">
                          {user?.role || "User"} Account
                        </p>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <Shield size={12} className="text-emerald-400" />
                          <span className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">Authenticated</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-left border-l-2 border-transparent hover:border-emerald-500 group"
                      >
                        <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors text-slate-500">
                          <item.icon size={16} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-800">{item.label}</span>
                          <span className="block text-[11px] text-slate-400 font-medium mt-0.5">{item.desc}</span>
                        </div>
                      </button>
                    ))}

                    {/* Inline Phone Editor */}
                    <AnimatePresence>
                      {isEditingPhone && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-2 mb-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Update Alert Number</p>
                            <div className="flex gap-2">
                              <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="+94 77 123 4567"
                                className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 outline-none"
                                autoFocus
                              />
                              <button
                                onClick={handleSavePhone}
                                disabled={phoneSaving || !phoneInput}
                                className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex-shrink-0"
                              >
                                {phoneSaved ? <Check size={16} /> : <Check size={16} />}
                              </button>
                              <button
                                onClick={() => setIsEditingPhone(false)}
                                className="bg-slate-200 text-slate-600 p-2.5 rounded-xl hover:bg-slate-300 transition-all flex-shrink-0"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                            {phoneSaved && (
                              <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                <Check size={12} /> Number updated successfully!
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="h-px bg-slate-100 my-2 mx-2"></div>
                    
                    <button
                      onClick={() => { setIsLoggedIn(false); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-50 transition-all text-left border-l-2 border-transparent hover:border-red-500 group"
                    >
                      <div className="bg-red-50 p-2 rounded-xl group-hover:bg-red-100 text-red-500 transition-colors">
                        <LogOut size={16} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-red-600">{t('logout')}</span>
                        <span className="block text-[11px] text-red-400 font-medium mt-0.5">End your current session</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      {/* ── Mobile Navigation Dropdown ──────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-[calc(100%+16px)] left-0 right-0 lg:hidden pointer-events-auto z-50"
          >
            <div className="bg-white/95 backdrop-blur-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 rounded-[2rem] p-4 mx-auto max-w-[calc(100vw-2rem)] space-y-1.5">
              {menuItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActivePage(item.key); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900 shadow-inner"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"} p-2 rounded-xl`}>
                      <item.icon size={18} />
                    </div>
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </div>
  );
}
