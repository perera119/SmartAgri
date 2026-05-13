import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export default function Alerts({ data }) {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.5em] mb-4 block">Active Surveillance</span>
        <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight">Intelligence Alerts</h2>
        <p className="text-slate-400 mt-4 text-xl font-medium">Critical system notifications requiring farm manager oversight.</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-slate-100 p-24 rounded-[60px] text-center shadow-sm flex flex-col items-center">
          <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 size={64} className="text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-display">Atmosphere Is Clear</h3>
          <p className="text-slate-400 font-bold mt-3 text-lg">Your farm intelligence network reports zero anomalies.</p>
          <button className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg">Refresh Network Sync</button>
        </div>
      ) : (
        <div className="space-y-8">
          {data.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-12 items-center group hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
            >
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-6 ${
                alert.severity === "High" ? "bg-rose-50 text-rose-500 shadow-lg shadow-rose-500/10" : "bg-amber-50 text-amber-500 shadow-lg shadow-amber-500/10"
              }`}>
                <AlertTriangle size={40} />
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
                  <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    alert.severity === "High" ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {alert.severity} Priority
                  </span>
                  <span className="text-slate-300 font-black text-xs uppercase tracking-widest">Received {alert.time}</span>
                </div>
                <h3 className="text-4xl font-black text-slate-900 font-display mb-4 tracking-tight">{alert.type}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-6">{alert.message}</p>
                
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</span>
                  <span className="text-slate-900 font-black text-sm">{alert.recommendedAction}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button className={`px-10 py-5 rounded-[24px] font-black text-lg transition-all shadow-xl active:scale-95 ${
                  alert.severity === "High" ? "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600" : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-emerald-600"
                }`}>
                  Resolve Incident
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
