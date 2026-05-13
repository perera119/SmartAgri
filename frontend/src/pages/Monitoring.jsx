import { motion } from "framer-motion";
import { Activity, Settings } from "lucide-react";

export default function Monitoring() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Network Topology</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Sensor Grid</h2>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-sm font-black uppercase text-emerald-900">12 Online</span>
           </div>
           <div className="bg-white px-6 py-3 rounded-2xl border border-rose-100 flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
             <span className="text-sm font-black uppercase text-rose-900">1 Warning</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {["North-Field-A", "South-Cluster-B", "Greenhouse-01", "Orchard-Segment", "East-Zone-04", "Hydro-Vortex"].map((field, i) => (
          <motion.div 
            key={field}
            whileHover={{ y: -10 }}
            className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-10">
               <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-emerald-900 group-hover:text-white transition-all">
                  <Activity size={32} />
               </div>
               <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</div>
            </div>
            
            <h4 className="text-2xl font-black text-slate-900 font-display mb-2">{field}</h4>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Quantum Cluster S-{200 + i}</p>
            
            <div className="space-y-4 mb-10">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sync Uptime</span>
                  <span className="text-slate-900 font-black">99.98%</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Signal Latency</span>
                  <span className="text-slate-900 font-black">2.4ms</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Energy Cell</span>
                  <span className="text-emerald-600 font-black">88%</span>
               </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-slate-900/10 hover:bg-emerald-600 transition-all">Live Stream</button>
              <button className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"><Settings size={20} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
