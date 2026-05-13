import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

export default function Predictions({ data }) {
  const chartData = [
    { name: "Drought", value: data?.droughtRisk || 0, color: "#f59e0b" },
    { name: "Flood", value: data?.floodRisk || 0, color: "#3b82f6" },
    { name: "Pest", value: data?.pestRisk || 0, color: "#ef4444" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Predictive Modeling</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Risk Forecasting</h2>
        </div>
        <div className="bg-emerald-900 text-emerald-400 px-8 py-5 rounded-[32px] shadow-xl flex items-center gap-4">
          <BrainCircuit size={24} />
          <span className="text-sm font-black uppercase tracking-[0.2em]">Quantum Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black text-slate-900 font-display">Probability Distribution</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 14, fontWeight: 800, fill: '#64748b'}} dy={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dx={-20} />
                <Tooltip 
                   cursor={{fill: '#f8fafc', radius: 24}}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                />
                <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={100}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[48px] text-white flex flex-col justify-between shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4 font-display">AI Synthesis</h3>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-12">Composite Intelligence Report</p>
            
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4">
                <span className="text-4xl font-black text-white">{Math.max(...chartData.map(d => d.value))}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Risk Coefficient</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(...chartData.map(d => d.value))}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">Verdict</h4>
                <p className="text-xl font-bold">{data?.prediction || "Stable Environment"}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">Prescription</h4>
                <p className="text-slate-300 font-medium italic leading-relaxed">
                  "{data?.recommendation || "All metabolic markers are within expected luxury farm tolerances."}"
                </p>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-emerald-500 text-emerald-950 py-5 rounded-2xl font-black text-lg mt-12 hover:bg-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
            Export Analytics PDF
          </button>

          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-all"></div>
        </div>
      </div>
    </div>
  );
}
