import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Globe, ShieldCheck, ChevronRight, Zap, BrainCircuit } from 'lucide-react';

const Dashboard = ({ setActivePage, data }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🌪️ DISASTER COMMAND HERO */}
      <section 
        className="relative pt-32 pb-40 px-6 lg:px-20 flex flex-col items-center justify-center text-center min-h-[90vh] border-b border-slate-800 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.98)), url("/hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Radar Pulse Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full animate-ping pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-500/20 rounded-full animate-pulse pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="bg-slate-800 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-slate-700 shadow-2xl">
              Live Regional Surveillance Active
            </span>
          </div>

          <h1 className="text-6xl md:text-[100px] font-black text-white tracking-tighter leading-[0.9] mb-8 font-display">
            Agricultural <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Early Warning</span> Hub
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium mb-12 leading-relaxed">
            Protecting Sri Lankan agriculture through high-fidelity satellite telemetry, advanced sensor forecasting, and official government broadcast integration.
          </p>

          {/* Disaster Readiness Level (DRL) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] text-left relative group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness Level</p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              <p className="text-4xl font-black text-white mb-2">OPERATIONAL</p>
              <p className="text-xs text-slate-500 font-medium italic">All sensor clusters reporting nominal telemetry.</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] text-left relative group hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Hazards</p>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              </div>
              <p className="text-4xl font-black text-white mb-2">WATCH</p>
              <p className="text-xs text-slate-500 font-medium italic">Colombo District showing elevated precipitation risk.</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] text-left relative group hover:border-rose-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Response Time</p>
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              </div>
              <p className="text-4xl font-black text-white mb-2">INSTANT</p>
              <p className="text-xs text-slate-500 font-medium italic">Global emergency satellite relay nodes online.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button
              onClick={() => setActivePage("alerts")}
              className="bg-emerald-500 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]"
            >
              Access Alert Center <ShieldCheck size={20} />
            </button>
            <button
              onClick={() => setActivePage("monitoring")}
              className="bg-white/5 backdrop-blur-md text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
            >
              Analyze Live Telemetry
            </button>
          </div>
        </motion.div>
      </section>

      {/* 🚀 EXPLANATION SECTION */}
      <section className="py-24 px-6 lg:px-20 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight font-display">
                Data-driven agriculture, <br/><span className="text-emerald-600">reimagined.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                AgriWatch brings enterprise-grade intelligence to your fingertips. Stop guessing and start knowing exactly what your crops need, exactly when they need it.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: BrainCircuit, title: "Hazard Forecasting", desc: "Predictive environmental intelligence powered by multi-spectral neural clusters.", action: "predictions" },
                  { icon: Zap, title: "Tactical Response Maps", desc: "Digital mitigation roadmaps for immediate field intervention.", action: "alerts" },
                  { icon: Globe, title: "Live Geospatial Mapping", desc: "Monitor your entire farm registry with real-time meteorological overlays.", action: "farms" },
                  { icon: Activity, title: "Continuous Monitoring", desc: "Track crucial metrics 24/7 with automated alerts for critical thresholds.", action: "monitoring" }
                ].map((feature, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActivePage(feature.action)}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <feature.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-[3rem] blur-3xl transform rotate-3"></div>
              <img 
                src="/drone.png" 
                alt="Drone scanning agricultural field" 
                className="relative rounded-[3rem] shadow-2xl w-full object-cover aspect-square border border-white/50"
              />
              
              {/* Floating Stat Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">System Status</p>
                  <p className="text-2xl font-black text-slate-900">100% Secure</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 📜 LUXURY FOOTER */}
      <footer className="bg-slate-950 pt-20 pb-10 px-6 lg:px-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <Globe size={24} />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">AgriWatch</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Empowering modern farmers with advanced insights, live geospatial telemetry, and enterprise-grade analytics. Built for the future of food security.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setActivePage("dashboard")} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Dashboard</button></li>
                <li><button onClick={() => setActivePage("monitoring")} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Live Monitoring</button></li>
                <li><button onClick={() => setActivePage("predictions")} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Predictions</button></li>
                <li><button onClick={() => setActivePage("farms")} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Farm Map</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Security</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs font-medium">
              &copy; {new Date().getFullYear()} AgriWatch Precision Systems. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors"><span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors"><span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
