import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Globe, BrainCircuit, ShieldCheck, ChevronRight } from 'lucide-react';
import ChatAssistant from '../components/ChatAssistant';

const Dashboard = ({ setActivePage, data }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🌟 HERO SECTION */}
      <section 
        className="relative pt-32 pb-48 px-6 lg:px-20 flex flex-col items-center justify-center text-center min-h-[85vh] md:min-h-[95vh] border-b border-slate-800"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.95)), url("/hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background glow effects over the image */}
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -z-0 pointer-events-none mix-blend-screen"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto z-10"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-widest uppercase mb-6">
            The Future of Agriculture
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8 font-display">
            Precision Intelligence for <span className="text-emerald-400 drop-shadow-lg">Smart Farming</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium mb-10 leading-relaxed drop-shadow-md">
            Harness the power of AI, real-time meteorological data, and geospatial analytics to maximize crop yield, monitor field health, and prevent risks before they happen.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* We don't have setActivePage passed as a prop from App.jsx easily unless we modify App.jsx. Let's assume the user will use the top navbar, or we can use a standard anchor tag styled as a button if we don't have routing setup yet. Wait, I can pass setActivePage if I edit App.jsx. Or just make it a link to #explore or similar. But wait, in App.jsx:
                <Dashboard data={dashboardData} history={historyData} onSimulate={handleSimulate} />
                So setActivePage is NOT passed. Let's just make it a cool decorative button, or I will update App.jsx to pass setActivePage. */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] border border-emerald-400/50"
            >
              Explore the System <ArrowRight size={20} />
            </motion.button>
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
                  { icon: BrainCircuit, title: "AI-Powered Predictions", desc: "Machine learning algorithms forecast disease risks and yield outcomes." },
                  { icon: Globe, title: "Live Geospatial Mapping", desc: "Monitor your entire farm registry with real-time meteorological overlays." },
                  { icon: Activity, title: "Continuous Monitoring", desc: "Track crucial metrics 24/7 with automated alerts for critical thresholds." }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
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
                Empowering modern farmers with AI-driven insights, live geospatial telemetry, and enterprise-grade analytics. Built for the future of food security.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Dashboard</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Predictions</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Live Monitoring</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Farm Map</a></li>
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

      {/* 🤖 AI CHAT ASSISTANT (Final Year Project Feature) */}
      <ChatAssistant farmData={data} />
    </div>
  );
};

export default Dashboard;
