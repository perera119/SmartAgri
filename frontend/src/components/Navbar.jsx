import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Bell, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Navbar({ activePage, setActivePage, menuItems, setIsLoggedIn, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 z-[100] px-8 py-4 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActivePage("dashboard")}>
          <div className="bg-emerald-900 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
            <Sprout size={24} className="text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight font-display text-emerald-900">AgriWatch</h1>
            <span className="text-[10px] font-black tracking-[0.3em] text-emerald-600 uppercase">Precision Systems</span>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                activePage === item.key
                  ? "bg-white text-emerald-900 shadow-md shadow-emerald-900/5"
                  : "text-slate-500 hover:text-emerald-700 hover:bg-white/40"
              }`}
            >
              <item.icon size={18} className={activePage === item.key ? "text-emerald-600" : "opacity-60"} />
              {item.label}
            </button>
          ))}
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right mr-2">
            <p className="text-sm font-black text-slate-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{user?.role} Portal</p>
          </div>
          <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
          </button>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden mt-4 overflow-hidden"
          >
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActivePage(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-colors ${
                    activePage === item.key ? "bg-emerald-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon size={20} />
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
