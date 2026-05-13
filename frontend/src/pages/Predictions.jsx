import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend, ReferenceLine
} from "recharts";

const API_BASE = "http://127.0.0.1:5001";
const AI_BASE  = "http://127.0.0.1:8000";
const POLL_MS  = 3600000; // 1 hour

// ── Risk helpers ──────────────────────────────────────────────────────────────
const riskMeta = (v) => {
  if (v >= 60) return { label:"High",   color:"#ef4444", bg:"bg-rose-50",    text:"text-rose-600",    border:"border-rose-200",   track:"bg-rose-200"   };
  if (v >= 30) return { label:"Medium", color:"#f59e0b", bg:"bg-amber-50",   text:"text-amber-600",   border:"border-amber-200",  track:"bg-amber-200"  };
  return             { label:"Low",    color:"#10b981", bg:"bg-emerald-50",  text:"text-emerald-600", border:"border-emerald-200", track:"bg-emerald-200" };
};
const riskToNum = { Low: 15, Medium: 46, High: 80 };

// ── Real live sensor from Open-Meteo (free, no API key) ───────────────────────
async function fetchLiveSensor() {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=7.8731&longitude=80.7718" +
      "&current=temperature_2m,relative_humidity_2m,precipitation,soil_moisture_0_to_1cm" +
      "&timezone=Asia%2FColombo";
    const res = await axios.get(url, { timeout: 8000 });
    const c   = res.data.current;
    return {
      temperature:  Math.round(c.temperature_2m),
      humidity:     Math.round(c.relative_humidity_2m),
      soilMoisture: Math.min(100, Math.round(c.soil_moisture_0_to_1cm * 200)),
      rainfall:     Math.min(150, Math.round(c.precipitation * 10) / 10),
      source:       "Open-Meteo · Sri Lanka Live",
    };
  } catch {
    return { temperature: 29, humidity: 78, soilMoisture: 45, rainfall: 12, source: "Fallback data" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Predictions() {
  const [sensor,      setSensor]      = useState({ temperature:"-", humidity:"-", soilMoisture:"-", rainfall:"-", source:"" });
  const [result,      setResult]      = useState(null);
  const [history,     setHistory]     = useState([]);
  const [tick,        setTick]        = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const intervalRef = useRef(null);

  // ── Get prediction from AI service ─────────────────────────────────────────
  const fetchPrediction = async (sensorData) => {
    try {
      const res = await axios.post(`${AI_BASE}/api/ai/predict`, sensorData, { timeout: 4000 });
      return res.data;
    } catch {
      try {
        const res2 = await axios.get(`${API_BASE}/api/predict`, { timeout: 4000 });
        return res2.data;
      } catch {
        const { temperature: t, humidity: h, soilMoisture: m, rainfall: r } = sensorData;
        const dr = t > 35 && m < 20 ? "High" : t > 30 || m < 30 ? "Medium" : "Low";
        const fr = r > 100 || (r > 50 && m > 85) ? "High" : r > 30 || m > 70 ? "Medium" : "Low";
        const pr = h > 80 && t >= 20 && t <= 30 ? "High" : h > 60 ? "Medium" : "Low";
        const rec =
          dr === "High"   ? "Critical drought risk. Activate irrigation immediately."  :
          fr === "High"   ? "Flood warning. Check drainage systems urgently."          :
          pr === "High"   ? "High pest risk. Apply preventive pest control."           :
          dr === "Medium" ? "Slightly low soil moisture. Schedule irrigation."         :
          pr === "Medium" ? "Humidity rising. Monitor for fungal growth."              :
          "All conditions stable. Continue regular monitoring.";
        return { droughtRisk: dr, floodRisk: fr, pestRisk: pr, recommendation: rec };
      }
    }
  };

  // ── Polling loop ────────────────────────────────────────────────────────────
  const refresh = async () => {
    const newSensor = await fetchLiveSensor();
    setSensor(newSensor);
    const pred = await fetchPrediction(newSensor);
    setResult(pred);
    setLastUpdated(new Date());
    setLoading(false);
    setTick(t => t + 1);
    const d = riskToNum[pred?.droughtRisk] ?? 15;
    const f = riskToNum[pred?.floodRisk]   ?? 15;
    const p = riskToNum[pred?.pestRisk]    ?? 15;
    setHistory(prev => {
      const now   = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
      const entry = { time: now, Drought: d, Flood: f, Pest: p };
      const upd   = [...prev, entry];
      return upd.length > 20 ? upd.slice(upd.length - 20) : upd;
    });
  };

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const drought = riskToNum[result?.droughtRisk] ?? 15;
  const flood   = riskToNum[result?.floodRisk]   ?? 15;
  const pest    = riskToNum[result?.pestRisk]     ?? 15;
  const dm = riskMeta(drought);
  const fm = riskMeta(flood);
  const pm = riskMeta(pest);
  const overall = Math.round((drought + flood + pest) / 3);
  const om      = riskMeta(overall);

  const barData = [
    { name:"Drought", value: drought, color:"#f59e0b" },
    { name:"Flood",   value: flood,   color:"#3b82f6" },
    { name:"Pest",    value: pest,    color:"#ef4444" },
  ];

  const radarData = [
    { subject:"Drought",     value: drought },
    { subject:"Flood",       value: flood   },
    { subject:"Pest",        value: pest    },
    { subject:"Soil Health", value: Math.max(0, 100 - drought) },
    { subject:"Crop Yield",  value: Math.max(0, 100 - overall) },
  ];

  const risks = [
    {
      label:"Drought Risk", value: drought, meta: dm,
      sensor: `Temp ${sensor.temperature}°C · Moisture ${sensor.soilMoisture}%`,
      desc: drought >= 60 ? "Critical soil deficit. Irrigation required immediately."
           : drought >= 30 ? "Moderate dryness. Schedule irrigation within 48 hours."
           : "Soil moisture is within safe range. No action needed.",
    },
    {
      label:"Flood Risk", value: flood, meta: fm,
      sensor: `Rainfall ${sensor.rainfall}mm · Moisture ${sensor.soilMoisture}%`,
      desc: flood >= 60 ? "High accumulation. Check drainage channels urgently."
           : flood >= 30 ? "Elevated levels. Monitor field drainage closely."
           : "Drainage conditions are stable. No flood risk.",
    },
    {
      label:"Pest Risk", value: pest, meta: pm,
      sensor: `Humidity ${sensor.humidity}% · Temp ${sensor.temperature}°C`,
      desc: pest >= 60 ? "Optimal pest breeding conditions. Apply preventive control."
           : pest >= 30 ? "Humidity rising — monitor for early infestation signs."
           : "Conditions unfavourable for pest activity.",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-bold">Fetching live Sri Lanka weather data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Predictive Modeling</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Risk Forecasting</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-[28px] border border-slate-200 px-6 py-3 flex items-center gap-3 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Live · refreshing every 1 hour</span>
          </div>
          <div className={`px-6 py-3 rounded-[28px] border ${om.border} ${om.bg}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall</p>
            <p className={`text-base font-black ${om.text}`}>{overall}% — {om.label}</p>
          </div>
        </div>
      </div>

      {/* Live Sensor Readings */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:"Temperature",  value:`${sensor.temperature}°C`, color:"text-orange-600",  bg:"bg-orange-50",  border:"border-orange-100"  },
            { label:"Humidity",     value:`${sensor.humidity}%`,     color:"text-blue-600",    bg:"bg-blue-50",    border:"border-blue-100"    },
            { label:"Soil Moisture",value:`${sensor.soilMoisture}%`, color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
            { label:"Rainfall",     value:`${sensor.rainfall} mm`,   color:"text-slate-600",   bg:"bg-slate-50",   border:"border-slate-100"   },
          ].map((s) => (
            <motion.div
              key={`${s.label}-${tick}`}
              initial={{ opacity: 0.5, y: -4 }}
              animate={{ opacity: 1,   y:  0 }}
              className={`rounded-[28px] border ${s.border} ${s.bg} px-6 py-5`}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
        {sensor.source && (
          <p className="text-[10px] font-bold text-slate-400 text-right tracking-widest uppercase">
            📡 {sensor.source} {lastUpdated ? `· Updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </p>
        )}
      </div>

      {/* Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {risks.map((r) => (
          <motion.div
            key={`${r.label}-${tick}`}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1,   scale: 1    }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-[40px] border ${r.meta.border} p-8 shadow-sm`}
          >
            <div className="flex justify-between items-start mb-5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{r.label}</p>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${r.meta.bg} ${r.meta.text} uppercase tracking-widest`}>
                {r.meta.label}
              </span>
            </div>
            <p className={`text-5xl font-black mb-4 ${r.meta.text}`}>{r.value}%</p>
            <div className={`h-2 ${r.meta.track} rounded-full overflow-hidden mb-4`}>
              <motion.div
                animate={{ width: `${r.value}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: r.meta.color }}
              />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{r.sensor}</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{r.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Reading</p>
          <h3 className="text-lg font-black text-slate-900 mb-6">Risk Distribution</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top:10, right:10, left:-20, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:12, fontWeight:700, fill:'#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#94a3b8' }} domain={[0,100]} />
                <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value:"High", fill:"#ef4444", fontSize:10 }} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value:"Med",  fill:"#f59e0b", fontSize:10 }} />
                <Tooltip
                  cursor={{ fill:'#f8fafc', radius:12 }}
                  contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 40px rgba(0,0,0,0.1)', padding:'10px 16px' }}
                  formatter={(v) => [`${v}%`, "Risk"]}
                />
                <Bar dataKey="value" radius={[12,12,0,0]} barSize={64}>
                  {barData.map((e,i) => <Cell key={i} fill={e.color} fillOpacity={0.9} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Multi-Factor</p>
          <h3 className="text-lg font-black text-slate-900 mb-6">Crop Health Radar</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fontWeight:700, fill:'#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize:9, fill:'#94a3b8' }} />
                <Radar name="Risk Level" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Trend */}
      <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session History</p>
            <h3 className="text-lg font-black text-slate-900">Risk Trend</h3>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {history.length} reading{history.length !== 1 ? "s" : ""} recorded
            </span>
          </div>
        </div>
        <div className="h-[220px]">
          {history.length < 2 ? (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm font-bold">
              Trend will appear after next refresh
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top:5, right:20, left:-20, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#94a3b8' }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize:10, fill:'#94a3b8' }} domain={[0,100]} />
                <Tooltip
                  contentStyle={{ borderRadius:'14px', border:'none', boxShadow:'0 8px 30px rgba(0,0,0,0.1)', padding:'10px 14px', fontSize:'12px' }}
                  formatter={(v,n) => [`${v}%`, n]}
                />
                <Legend wrapperStyle={{ paddingTop:'16px', fontSize:'11px', fontWeight:'700' }} />
                <Line type="monotone" dataKey="Drought" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Flood"   stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Pest"    stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recommendation Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={result?.recommendation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y:  0 }}
          exit={{ opacity: 0 }}
          className={`rounded-[40px] border ${om.border} ${om.bg} p-8 flex items-start gap-5`}
        >
          <div className="text-2xl mt-0.5 flex-shrink-0">
            {overall >= 60 ? "⚠️" : overall >= 30 ? "📋" : "✅"}
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${om.text}`}>AI Recommendation</p>
            <p className="text-base font-bold text-slate-800 leading-relaxed">
              {result?.recommendation || "All conditions stable. Continue regular monitoring."}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
