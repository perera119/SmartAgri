import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-100 h-[600px] flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight">{title}</h3>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">{subtitle}</p>
        </div>
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-900 group-hover:text-white transition-all">
           <Icon size={24} />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

export function ToggleRow({ label, desc, checked = false }) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="font-black text-slate-800 tracking-tight">{label}</p>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
      <div className={`w-16 h-9 rounded-full p-1.5 transition-colors cursor-pointer ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}>
        <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

export function DetailCard({ title, value, color, desc }) {
  return (
    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 group">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-slate-900">{title}</h4>
        <span className={`text-2xl font-black text-${color}-500`}>{value}%</span>
      </div>
      <p className="text-slate-500 font-medium leading-relaxed mb-6">{desc}</p>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full bg-${color}-500`}
        />
      </div>
    </div>
  );
}

export function SensorRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{label}</span>
      <span className="text-slate-900 font-black">{value}</span>
    </div>
  );
}

export function StatusBadge({ count, label, color }) {
  return (
    <div className={`flex items-center gap-3 bg-${color}-50 px-4 py-2 rounded-xl border border-${color}-100`}>
      <span className={`text-lg font-black text-${color}-600`}>{count}</span>
      <span className={`text-[10px] font-bold uppercase tracking-widest text-${color}-700/60`}>{label}</span>
    </div>
  );
}

export function SettingsSection({ title, children }) {
  return (
    <div>
       <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{title}</h4>
       <div className="space-y-6">
         {children}
       </div>
    </div>
  );
}

export function LangBtn({ label, active = false }) {
  return (
    <button className={`py-4 rounded-2xl font-bold transition-all ${
      active ? 'bg-emerald-900 text-white shadow-xl shadow-emerald-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
    }`}>
      {label}
    </button>
  );
}

export function BenefitItem({ text, icon: Icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-emerald-500 p-1.5 rounded-full">
        <Icon size={16} className="text-emerald-950" />
      </div>
      <p className="font-bold text-lg text-emerald-50">{text}</p>
    </div>
  );
}

export function DataNode({ angle, label }) {
  const x = Math.cos(angle * Math.PI / 180) * 160;
  const y = Math.sin(angle * Math.PI / 180) * 160;
  return (
    <div 
      className="absolute bg-white/20 backdrop-blur-xl border border-white/30 px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {label}
    </div>
  );
}
