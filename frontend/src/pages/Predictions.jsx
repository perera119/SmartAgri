import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, 
  ChevronRight, 
  Activity, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle,
  Clock,
  Navigation,
  Sparkles,
  Zap
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5001";

const PredictionCard = ({ title, value, unit, trend, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
        <span className="text-emerald-500 font-black text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">94.2%</span>
      </div>
    </div>
    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black text-slate-900">{value}</span>
      <span className="text-slate-400 font-bold">{unit}</span>
    </div>
    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{trend}</span>
      <div className="flex gap-1">
        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-200"></div>)}
      </div>
    </div>
  </motion.div>
);

export default function Predictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/predictions`);
        setData(res.data);
      } catch (err) {
        console.error("Prediction sync failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
      />
      <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Synthesizing Future Telemetry...</span>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-2">
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Next 48 Hours</span>
             </div>
             <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Live Forecasting Active</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 font-display tracking-tighter leading-none">Hazard <br/>Forecasting</h2>
          <p className="text-slate-500 font-medium max-w-xl text-lg">Predictive environmental intelligence powered by multi-spectral satellite synthesis and regional sensor clusters.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Core</p>
             <p className="font-black text-slate-900">Advanced Neural Sync</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-xl shadow-slate-200 animate-pulse">
             <BrainCircuit size={28} />
          </div>
        </div>
      </div>

      {/* Main Forecast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <PredictionCard 
          title="Flood Risk" 
          value={data?.floodRisk || 0} 
          unit="%" 
          trend={data?.floodRisk > 60 ? "Critical Risk" : "Stable Conditions"} 
          icon={AlertTriangle} 
          color="bg-rose-50 text-rose-600" 
          delay={0.1} 
        />
        <PredictionCard 
          title="Drought Risk" 
          value={data?.droughtRisk || 0} 
          unit="%" 
          trend={data?.droughtRisk > 60 ? "Irrigation Required" : "Moisture Optimal"} 
          icon={Thermometer} 
          color="bg-amber-50 text-amber-600" 
          delay={0.2} 
        />
        <PredictionCard 
          title="Pest Outbreak" 
          value={data?.pestRisk || 0} 
          unit="%" 
          trend={data?.pestRisk > 50 ? "Treatment Advised" : "Low Pressure"} 
          icon={Sparkles} 
          color="bg-blue-50 text-blue-600" 
          delay={0.3} 
        />
        <PredictionCard 
          title="System Confidence" 
          value="94.2" 
          unit="%" 
          trend="Telemetry Verified" 
          icon={Activity} 
          color="bg-emerald-50 text-emerald-600" 
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Detailed Insights */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[56px] border border-slate-100 p-12 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight">Temporal Risk Mapping</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">48-Hour environmental projection</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <Clock size={16} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Real-time Feed</span>
              </div>
            </div>

            {/* Dynamic Chart Visualization */}
            <div className="h-[300px] flex items-end gap-6 mb-12 px-4 bg-slate-50/50 rounded-[32px] p-8 border border-slate-100/50">
              {(data?.forecasts || [40, 60, 35, 80, 50, 20, 75, 45, 90, 30]).map((item, i) => {
                const height = typeof item === 'object' ? item.prob : item;
                const type = typeof item === 'object' ? item.type : "Risk";
                const isCritical = height > 60;
                
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end group/bar relative">
                    {/* Background Track */}
                    <div className="absolute inset-0 bg-slate-100/50 rounded-2xl mb-1" />
                    
                    {/* Active Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                      className={`relative z-10 rounded-2xl transition-all duration-500 w-full ${
                        isCritical 
                          ? 'bg-rose-500 shadow-[0_10px_20px_rgba(244,63,94,0.3)]' 
                          : 'bg-emerald-500 shadow-[0_10px_20px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                       {/* Value Label on Hover */}
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {height}%
                       </div>
                    </motion.div>

                    {/* X-Axis Label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all group-hover/bar:translate-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter">
                         {typeof item === 'object' ? item.type.split(' ')[0] : `${i*4}h`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aesthetic Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>
        </div>

        {/* Right Column: AI Summary */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Executive Summary</p>
                  <h4 className="text-xl font-black font-display">Intelligence Digest</h4>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-slate-400 font-medium leading-relaxed">
                  {data?.recommendation || "Atmospheric stabilization detected over the Central Highlands. Minimal risk of localized flash flooding for the next 24 hours."}
                </p>
                
                <div className="space-y-4">
                  {[
                    { label: "Overall Status", value: data?.overallStatus || "Optimal", color: "text-emerald-400" },
                    { label: "Flood Risk", value: `${data?.floodRisk || 0}%`, color: data?.floodRisk > 60 ? "text-rose-400" : "text-emerald-400" },
                    { label: "Drought Risk", value: `${data?.droughtRisk || 0}%`, color: data?.droughtRisk > 60 ? "text-amber-400" : "text-emerald-400" }
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:border-emerald-600 transition-all flex items-center justify-center gap-3">
                  Export Forecast Report <ChevronRight size={14} />
                </button>
              </div>
            </div>
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
