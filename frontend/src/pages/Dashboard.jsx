import { motion } from "framer-motion";
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  CloudRain, 
  Activity, 
  MapPin,
  BrainCircuit
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { ChartCard, DataNode } from "../components/UIHelpers";

export default function Dashboard({ data, history }) {
  const metrics = [
    { title: "Temperature", value: data?.metrics?.temperature, unit: "°C", icon: Thermometer, color: "orange", trend: "+2.1%" },
    { title: "Humidity", value: data?.metrics?.humidity, unit: "%", icon: Droplets, color: "blue", trend: "-1.2%" },
    { title: "Soil Moisture", value: data?.metrics?.soilMoisture, unit: "%", icon: Sprout, color: "emerald", trend: "-0.5%" },
    { title: "Rainfall", value: data?.metrics?.rainfall, unit: "mm", icon: CloudRain, color: "indigo", trend: "0.0%" },
  ];

  return (
    <div className="space-y-12">
      {/* High-End Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">System Intelligence</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Operational Status</h2>
        </div>
        <div className="bg-white px-8 py-5 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Cluster</span>
            <span className="text-lg font-black text-slate-800">Field-Omega-01</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <MapPin size={24} />
          </div>
        </div>
      </div>

      {/* Luxury Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 p-1 rounded-[44px] shadow-2xl shadow-slate-900/20 overflow-hidden relative"
      >
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-12 rounded-[40px] relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-black text-white mb-6 font-display leading-tight">Farm Health <br/>Real-Time Summary</h2>
              <p className="text-2xl text-emerald-50/70 font-medium leading-relaxed mb-10">
                {data?.farmStatus || "Syncing sensor data from the field..."}
              </p>
              <div className="flex gap-6">
                <button className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Optimize Irrigation</button>
                <button className="bg-emerald-500/20 text-white border border-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl font-black hover:bg-emerald-500/30 transition-all">Deep Diagnostics</button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                className="w-80 h-80 border-4 border-white/10 rounded-full flex items-center justify-center relative"
               >
                  <div className="w-60 h-60 border-2 border-emerald-400/30 rounded-full flex items-center justify-center">
                    <Activity size={100} className="text-white opacity-40" />
                  </div>
                  <DataNode angle={0} label="AI Active" />
                  <DataNode angle={120} label="Sensors Up" />
                  <DataNode angle={240} label="Network Secure" />
               </motion.div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
             <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[150px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-teal-400 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50"
          >
            <div className={`w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-8 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6`}>
              <m.icon size={32} />
            </div>
            <h3 className="text-slate-400 font-black tracking-widest uppercase text-[10px] mb-2">{m.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 font-display tracking-tighter">{m.value ?? "--"}</span>
              <span className="text-xl font-bold text-slate-400">{m.unit}</span>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className={`text-xs font-black px-3 py-1 rounded-full ${m.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : m.trend.startsWith('-') ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                {m.trend}
              </span>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">60m Trend</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <ChartCard title="Atmospheric Trends" subtitle="Hyper-local temperature variance" icon={Thermometer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#065f46" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-15} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="url(#lineGradient)" 
                strokeWidth={6} 
                dot={{ r: 6, fill: '#fff', stroke: '#065f46', strokeWidth: 3 }}
                activeDot={{ r: 10, strokeWidth: 0, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hydration Analysis" subtitle="Soil moisture saturation levels" icon={Droplets}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-15} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
              />
              <Area 
                type="monotone" 
                dataKey="soilMoisture" 
                stroke="#10b981" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#areaGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
