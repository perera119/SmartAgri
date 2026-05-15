import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend, ReferenceLine
} from "recharts";
import {
  Thermometer,
  CloudRain,
  Bug,
  Zap,
  Loader2,
  AlertTriangle,
  Info,
  ChevronDown,
  Droplets,
  Wind,
  MapPin,
  ShieldAlert
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5001";
const AI_BASE  = "http://127.0.0.1:8000";
const POLL_MS  = 3600000; // 1 hour

// ── Risk helpers ──────────────────────────────────────────────────────────────
const riskToNum = { Low: 15, Medium: 46, High: 80 };

const riskMeta = (v) => {
  if (v >= 60) return { label:"High",   color:"#ef4444", bg:"bg-rose-50",    text:"text-rose-600",    border:"border-rose-200",   track:"bg-rose-200"   };
  if (v >= 30) return { label:"Medium", color:"#f59e0b", bg:"bg-amber-50",   text:"text-amber-600",   border:"border-amber-200",  track:"bg-amber-200"  };
  return             { label:"Low",    color:"#10b981", bg:"bg-emerald-50",  text:"text-emerald-600", border:"border-emerald-200", track:"bg-emerald-200" };
};

// Sri Lanka district coordinates for weather lookups
const SRI_LANKA_DISTRICTS = {
  "Colombo":       { lat: 6.9271, lon: 79.8612 },
  "Gampaha":       { lat: 7.0840, lon: 80.0098 },
  "Kalutara":      { lat: 6.5854, lon: 80.1144 },
  "Kandy":         { lat: 7.2906, lon: 80.6337 },
  "Matale":        { lat: 7.4675, lon: 80.6234 },
  "Nuwara Eliya":  { lat: 6.9497, lon: 80.7891 },
  "Galle":         { lat: 6.0535, lon: 80.2210 },
  "Matara":        { lat: 5.9485, lon: 80.5353 },
  "Hambantota":    { lat: 6.1429, lon: 81.1212 },
  "Jaffna":        { lat: 9.6615, lon: 80.0255 },
  "Kilinochchi":   { lat: 9.3803, lon: 80.3770 },
  "Mannar":        { lat: 8.9810, lon: 79.9044 },
  "Mullaitivu":    { lat: 9.2671, lon: 80.8142 },
  "Vavuniya":      { lat: 8.7514, lon: 80.4971 },
  "Trincomalee":   { lat: 8.5874, lon: 81.2152 },
  "Batticaloa":    { lat: 7.7310, lon: 81.6747 },
  "Ampara":        { lat: 7.2978, lon: 81.6720 },
  "Kurunegala":    { lat: 7.4867, lon: 80.3647 },
  "Puttalam":      { lat: 8.0362, lon: 79.8283 },
  "Anuradhapura":  { lat: 8.3114, lon: 80.4037 },
  "Polonnaruwa":   { lat: 7.9403, lon: 81.0188 },
  "Badulla":       { lat: 6.9934, lon: 81.0550 },
  "Monaragala":    { lat: 6.8728, lon: 81.3507 },
  "Ratnapura":     { lat: 6.6828, lon: 80.3992 },
  "Kegalle":       { lat: 7.2513, lon: 80.3464 },
};

// ── Real live sensor from Open-Meteo ───────────────────────
async function fetchLiveSensor(lat = 7.8731, lon = 80.7718, districtName = "Sri Lanka") {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,soil_moisture_0_to_1cm` +
      `&timezone=Asia%2FColombo`;
    const res = await axios.get(url, { timeout: 8000 });
    const c   = res.data.current;
    return {
      temperature:  Math.round(c.temperature_2m),
      humidity:     Math.round(c.relative_humidity_2m),
      soilMoisture: Math.min(100, Math.round(c.soil_moisture_0_to_1cm * 200)),
      rainfall:     Math.min(150, Math.round(c.precipitation * 10) / 10),
      source:       `Open-Meteo · ${districtName} Live`,
    };
  } catch {
    return { temperature: 29, humidity: 78, soilMoisture: 45, rainfall: 12, source: "Fallback data" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Predictions() {
  const [selectedDistrict, setSelectedDistrict] = useState("Colombo");
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
    try {
      const coords = SRI_LANKA_DISTRICTS[selectedDistrict] || { lat: 7.8731, lon: 80.7718 };
      const newSensor = await fetchLiveSensor(coords.lat, coords.lon, selectedDistrict);
      setSensor(newSensor);
      const pred = await fetchPrediction(newSensor);
      setResult(pred);
      setLastUpdated(new Date());
      setTick(t => t + 1);
      
      const d = pred?.probabilities?.drought ?? (riskToNum[pred?.droughtRisk] || 15);
      const f = pred?.probabilities?.flood   ?? (riskToNum[pred?.floodRisk]   || 15);
      const p = pred?.probabilities?.pest    ?? (riskToNum[pred?.pestRisk]    || 15);

      setHistory(prev => {
        const now   = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
        const entry = { time: now, Drought: d, Flood: f, Pest: p };
        const upd   = [...prev, entry];
        return upd.length > 20 ? upd.slice(upd.length - 20) : upd;
      });
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [selectedDistrict]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const drought = result?.probabilities?.drought ?? (riskToNum[result?.droughtRisk] || 15);
  const flood   = result?.probabilities?.flood   ?? (riskToNum[result?.floodRisk]   || 15);
  const pest    = result?.probabilities?.pest    ?? (riskToNum[result?.pestRisk]    || 15);
  
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
      sensor: `Temperature ${sensor.temperature}°C · Humidity ${sensor.humidity}%`,
      desc: drought >= 60 ? "Critical heat stress. Significant irrigation required immediately."
           : drought >= 30 ? "Elevated temperatures. Monitor crop hydration levels."
           : "Temperature and humidity are within safe farming range.",
    },
    {
      label:"Flood Risk", value: flood, meta: fm,
      sensor: `Rainfall ${sensor.rainfall}mm · Humidity ${sensor.humidity}%`,
      desc: flood >= 60 ? "Heavy rain accumulation. Check drainage channels urgently."
           : flood >= 30 ? "Moderate rainfall. Monitor field drainage closely."
           : "Rainfall conditions are stable. No flood risk.",
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-8">
        <div className="flex-1">
          <span className="text-rose-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Predictive Modeling</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 font-display tracking-tight leading-none mb-4">Risk Forecasting</h2>
          <p className="text-slate-500 font-medium max-w-2xl text-lg">AI-powered disaster detection utilizing live meteorological telemetry and multi-spectral analysis.</p>
        </div>

        <div className="w-full lg:w-auto space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setLoading(true);
                  setSelectedDistrict(e.target.value);
                }}
                className="w-full sm:w-[260px] bg-white border border-slate-200 rounded-2xl py-4 pl-11 pr-10 font-bold text-slate-900 text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer shadow-sm transition-all"
              >
                {Object.keys(SRI_LANKA_DISTRICTS).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className={`px-6 py-4 rounded-2xl border ${om.border} ${om.bg} flex items-center gap-4`}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Risk</p>
                <p className={`text-xl font-black ${om.text}`}>{overall}% — {om.label}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${om.bg} border ${om.border}`}>
                <ShieldAlert size={20} className={om.text} />
              </div>
            </div>
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

      {/* 🚀 Disaster Forecast Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Forecast Cards */}
        <div className="space-y-6">
          <div className="mb-4">
            <span className="text-rose-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Analytical Intelligence</span>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">AI Disaster Forecast</h3>
            <p className="text-slate-400 text-sm font-bold mt-1">Projected risks for the next {result?.predictionWindow || "48-72"} hours</p>
          </div>

          {(result?.forecasts || [
            { type: "Drought", prob: 0, intensity: "Low" },
            { type: "Flood", prob: 0, intensity: "Low" },
            { type: "Pest Outbreak", prob: 0, intensity: "Low" }
          ]).map((f, i) => (
            <motion.div
              key={f.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    f.prob > 70 ? "bg-rose-50 text-rose-600" : f.prob > 30 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {f.type === "Drought" ? <Thermometer size={24} /> : f.type === "Flood" ? <CloudRain size={24} /> : <Bug size={24} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{f.type}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      f.prob > 70 ? "text-rose-500" : f.prob > 30 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {f.intensity} Intensity Expected
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{f.prob}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Probability</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${f.prob}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    f.prob > 70 ? "bg-rose-500" : f.prob > 30 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              {/* Animated Background Pulse for High Risk */}
              {f.prob > 70 && (
                <motion.div 
                  animate={{ opacity: [0, 0.05, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-rose-500"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Right: Risk Radar + Summary */}
        <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900">Threat Vector Analysis</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-dimensional risk mapping</p>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fontWeight:700, fill:'#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize:9, fill:'#94a3b8' }} />
                <Radar 
                  name="Risk Level" 
                  dataKey="value" 
                  stroke={overall > 70 ? "#ef4444" : "#10b981"} 
                  fill={overall > 70 ? "#ef4444" : "#10b981"} 
                  fillOpacity={0.15} 
                  strokeWidth={3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className={`mt-8 p-6 rounded-3xl border ${
            overall > 60 ? "bg-rose-50 border-rose-100 text-rose-900" : "bg-emerald-50 border-emerald-100 text-emerald-900"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Zap size={16} className={overall > 60 ? "text-rose-600" : "text-emerald-600"} />
              <span className="text-[10px] font-black uppercase tracking-widest">Strategic Recommendation</span>
            </div>
            <p className="text-sm font-bold leading-relaxed italic">
              {result?.recommendation || "All conditions stable. Continue regular monitoring."}
            </p>
          </div>
        </div>
      </div>



      {/* 📘 Disaster Awareness Section */}
      <div className="pt-12 border-t border-slate-100">
        <div className="mb-10">
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Educational Insights</span>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Disaster Awareness</h2>
          <p className="text-slate-500 mt-4 max-w-2xl font-medium">Understanding the mechanics of agricultural disasters is the first step toward effective mitigation and food security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Flood Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="group bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-64 overflow-hidden relative">
              <img 
                src="/assets/disasters/flood.png" 
                alt="Flood Disaster" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Flood Risk</span>
              </div>
            </div>
            <div className="p-8 flex-1">
              <h4 className="text-xl font-black text-slate-900 mb-4">Hydrological Flooding</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Flooding occurs when intense rainfall exceeds the soil's absorption capacity and the local drainage system's limit. In Sri Lanka, this often impacts low-lying paddy fields, causing root rot and total crop loss if water remains stagnant for over 48 hours.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-50">
                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Prevention Tip</h5>
                <p className="text-[11px] text-slate-400 font-bold italic">Maintain clear drainage channels and consider raised seedbeds in high-risk zones.</p>
              </div>
            </div>
          </motion.div>

          {/* Drought Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="group bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-64 overflow-hidden relative">
              <img 
                src="/assets/disasters/drought.png" 
                alt="Drought Disaster" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Drought Risk</span>
              </div>
            </div>
            <div className="p-8 flex-1">
              <h4 className="text-xl font-black text-slate-900 mb-4">Meteorological Drought</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Drought is a prolonged period of moisture deficiency. It begins with high temperatures and low rainfall, leading to soil moisture depletion. Crops experience wilting and stunted growth, significantly reducing yield and quality.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-50">
                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Prevention Tip</h5>
                <p className="text-[11px] text-slate-400 font-bold italic">Implement drip irrigation and mulching to conserve critical soil moisture levels.</p>
              </div>
            </div>
          </motion.div>

          {/* Pest Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="group bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-64 overflow-hidden relative">
              <img 
                src="/assets/disasters/pest.png" 
                alt="Pest Outbreak" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Biological Risk</span>
              </div>
            </div>
            <div className="p-8 flex-1">
              <h4 className="text-xl font-black text-slate-900 mb-4">Pest Outbreaks</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                High humidity and moderate temperatures often create the perfect environment for rapid pest multiplication. Locusts, caterpillars, and fungal diseases can devastate entire fields in days if not detected in the early 'incubation' phase.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-50">
                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Prevention Tip</h5>
                <p className="text-[11px] text-slate-400 font-bold italic">Monitor humidity levels daily and use preventive organic biopesticides.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
