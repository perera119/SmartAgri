import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  AlertTriangle,
  ThermometerSun,
  CloudRain,
  Bug,
  Droplets,
  Wind,
  CheckCircle2,
  Clock,
  MapPin,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Info,
  Loader2,
  Bell,
  ChevronDown,
  Zap
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5001";

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

// Generate smart alerts based on real weather data
function generateAlerts(weather, district, farmName) {
  const alerts = [];
  const now = new Date();
  const location = farmName ? `${farmName} — ${district}` : district;

  // Flood Risk
  if (weather.precipitation > 20) {
    alerts.push({
      id: `flood-${district}`,
      type: "Flood Warning",
      severity: weather.precipitation > 50 ? "Critical" : "High",
      message: `Heavy rainfall of ${weather.precipitation}mm detected in ${district}. Risk of waterlogging and crop damage.`,
      action: "Activate drainage systems immediately. Move livestock to higher ground.",
      location,
      icon: "flood",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
  } else if (weather.precipitation > 8) {
    alerts.push({
      id: `rain-${district}`,
      type: "Heavy Rain Advisory",
      severity: "Medium",
      message: `Moderate rainfall of ${weather.precipitation}mm recorded in ${district}. Monitor field drainage.`,
      action: "Check drainage channels and protect sensitive seedlings.",
      location,
      icon: "rain",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // Heat Wave / Drought Risk
  if (weather.temperature > 35) {
    alerts.push({
      id: `heat-${district}`,
      type: "Heat Wave Alert",
      severity: weather.temperature > 38 ? "Critical" : "High",
      message: `Extreme temperature of ${weather.temperature}°C detected in ${district}. Crops at risk of heat stress.`,
      action: "Increase irrigation frequency. Apply mulch to retain soil moisture.",
      location,
      icon: "heat",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // Wind / Storm Risk
  if (weather.windSpeed > 40) {
    alerts.push({
      id: `wind-${district}`,
      type: "Storm Warning",
      severity: weather.windSpeed > 60 ? "Critical" : "High",
      message: `Strong winds of ${weather.windSpeed} km/h in ${district}. Structural damage possible.`,
      action: "Secure greenhouses and polytunnels. Harvest mature crops immediately.",
      location,
      icon: "wind",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // Pest Risk (high humidity + warm)
  if (weather.humidity > 80 && weather.temperature > 25 && weather.temperature < 33) {
    alerts.push({
      id: `pest-${district}`,
      type: "Pest Risk Advisory",
      severity: weather.humidity > 90 ? "High" : "Medium",
      message: `High humidity (${weather.humidity}%) with warm temperatures in ${district}. Ideal conditions for pest breeding.`,
      action: "Inspect crops for early signs of infestation. Apply preventative organic treatment.",
      location,
      icon: "pest",
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
  }



  return alerts;
}

const RESPONSE_PROTOCOLS = {
  "Flood Warning": [
    "Activate all perimeter drainage pumps and clear spillways.",
    "Relocate mobile agricultural machinery to high-elevation zones.",
    "Secure livestock in designated flood-safe shelters.",
    "Monitor live water-level telemetry every 30 minutes."
  ],
  "Heat Wave Alert": [
    "Implement high-frequency drip irrigation cycles.",
    "Apply organic mulch to exposed soil to minimize evaporation.",
    "Erect temporary shade netting for sensitive seedlings.",
    "Hydrate livestock and monitor for heat stress symptoms."
  ],
  "Storm Warning": [
    "Reinforce greenhouse structures and polytunnel anchor points.",
    "Harvest all mature or near-mature crops immediately.",
    "Prune overhanging branches near critical infrastructure.",
    "Secure all loose outdoor equipment and field tools."
  ],
  "Pest Risk Advisory": [
    "Conduct a high-density field inspection for early egg clusters.",
    "Apply preventative organic pheromone traps across the boundary.",
    "Optimize canopy ventilation to reduce localized humidity.",
    "Prepare biocontrol agents for rapid deployment."
  ],
  "Government Official Warning": [
    "Adhere strictly to instructions provided in the official broadcast.",
    "Contact regional agricultural officers for localized support.",
    "Monitor emergency radio channels for evacuation orders.",
    "Coordinate with neighboring farms for community response."
  ]
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [userFarms, setUserFarms] = useState([]);
  const [acknowledged, setAcknowledged] = useState([]);
  const [filter, setFilter] = useState("Active");
  const [currentUser, setCurrentUser] = useState(null);
  const [weatherSource, setWeatherSource] = useState("");

  // Load user and their farms
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
    }
  }, []);

  // Fetch user's farms
  useEffect(() => {
    async function loadFarms() {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/farms`);
        const farms = res.data || [];

        if (currentUser) {
          const myFarms = farms.filter(
            (f) =>
              f.addedBy?.toLowerCase().includes(currentUser.firstName?.toLowerCase()) ||
              f.addedBy?.toLowerCase().includes(currentUser.lastName?.toLowerCase())
          );
          setUserFarms(myFarms);

          // Auto-select first farm's district
          if (myFarms.length > 0 && !selectedDistrict) {
            const farmDistrict = myFarms[0].district;
            const match = Object.keys(SRI_LANKA_DISTRICTS).find(
              (d) => d.toLowerCase() === farmDistrict?.toLowerCase()
            );
            setSelectedDistrict(match || farmDistrict || "");
          }
        }
      } catch (err) {
        console.error("Failed to load farms:", err);
      }
    }
    if (currentUser) loadFarms();
  }, [currentUser]);

  // Fetch weather and generate alerts
  useEffect(() => {
    if (!selectedDistrict) {
      setIsLoading(false);
      return;
    }

    async function fetchWeatherAlerts() {
      setIsLoading(true);
      try {
        const coords = SRI_LANKA_DISTRICTS[selectedDistrict];
        let lat = coords?.lat || 7.8731;
        let lon = coords?.lon || 80.7718;

        if (!coords) {
          try {
            const geoRes = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(selectedDistrict + ", Sri Lanka")}`
            );
            if (geoRes.data?.length > 0) {
              lat = parseFloat(geoRes.data[0].lat);
              lon = parseFloat(geoRes.data[0].lon);
            }
          } catch (geoErr) {
            console.warn("Geocoding failed for", selectedDistrict, geoErr);
          }
        }

        // Fetch from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=Asia%2FColombo`;
        const weatherRes = await axios.get(weatherUrl, { timeout: 8000 });
        const c = weatherRes.data.current;

        const weather = {
          temperature: Math.round(c.temperature_2m),
          humidity: Math.round(c.relative_humidity_2m),
          precipitation: Math.round(c.precipitation * 10) / 10,
          windSpeed: Math.round(c.wind_speed_10m),
        };

        setWeatherSource("Open-Meteo Live");

        const farmInDistrict = userFarms.find(
          (f) => f.district?.toLowerCase().includes(selectedDistrict.toLowerCase())
        );

        // Generate local sensor alerts
        const generated = generateAlerts(
          weather,
          selectedDistrict,
          farmInDistrict?.name || null
        );

        // Fetch official alerts from backend
        let official = [];
        try {
          const alertsRes = await axios.get(`${API_BASE}/api/alerts`);
          console.log("Fetched Alerts:", alertsRes.data);
          official = alertsRes.data.map(a => ({
            id: a._id,
            type: a.type,
            severity: a.severity,
            message: a.message,
            action: a.recommendedAction,
            location: a.region || "National",
            isOfficial: a.isOfficial,
            icon: a.type?.toLowerCase().includes("flood") ? "flood" : 
                  a.type?.toLowerCase().includes("heat") ? "heat" :
                  a.type?.toLowerCase().includes("pest") ? "pest" : "official",
            time: a.time || "Just Now"
          }));
        } catch (alertErr) {
          console.error("Official alerts fetch failed:", alertErr);
        }

        // Filter official alerts by region
        const filteredOfficial = official.filter(a => {
          if (a.location === "National" || !a.location) return true;
          const loc = a.location.toLowerCase();
          const sel = selectedDistrict.toLowerCase();
          // Support broad matching (e.g. "Colombo" matches "Colombo - Kotte")
          return loc.includes(sel) || sel.includes(loc);
        });

        console.log("Filtered Official:", filteredOfficial);
        setAlerts([...filteredOfficial, ...generated]);
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setWeatherSource("Fallback");
        setAlerts([{
          id: "fallback-1",
          type: "System Notice",
          severity: "Low",
          message: `Unable to fetch live weather for ${selectedDistrict}. Showing general advisory.`,
          action: "Check your internet connection and try again.",
          location: selectedDistrict,
          icon: "safe",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeatherAlerts();
    const interval = setInterval(fetchWeatherAlerts, 60000);
    return () => clearInterval(interval);
  }, [selectedDistrict, userFarms]);

  const handleAcknowledge = (id) => {
    setAcknowledged((prev) => [...prev, id]);
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case "flood":    return CloudRain;
      case "rain":     return Droplets;
      case "heat":     return ThermometerSun;
      case "wind":     return Wind;
      case "pest":     return Bug;
      case "safe":     return CheckCircle2;
      case "official": return ShieldCheck;
      default:         return AlertTriangle;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-600 text-white", text: "text-red-900", icon: "bg-red-100 text-red-600", dot: "bg-red-500" };
      case "high":     return { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500 text-white", text: "text-orange-900", icon: "bg-orange-100 text-orange-600", dot: "bg-orange-500" };
      case "medium":   return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-400 text-slate-900", text: "text-amber-900", icon: "bg-amber-100 text-amber-600", dot: "bg-amber-500" };
      case "low":      return { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-500 text-white", text: "text-blue-900", icon: "bg-blue-100 text-blue-600", dot: "bg-blue-500" };
      case "safe":     return { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500 text-white", text: "text-emerald-900", icon: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" };
      default:         return { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-500 text-white", text: "text-slate-900", icon: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
    }
  };

  const filteredAlerts = useMemo(() => {
    if (filter === "All") return alerts;
    if (filter === "Active") return alerts.filter((n) => !acknowledged.includes(n.id));
    if (filter === "Acknowledged") return alerts.filter((n) => acknowledged.includes(n.id));
    return alerts.filter((n) => n.severity?.toLowerCase() === filter.toLowerCase());
  }, [alerts, filter, acknowledged]);

  const stats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter((n) => ["critical", "high"].includes(n.severity?.toLowerCase())).length,
    active: alerts.filter((n) => !acknowledged.includes(n.id) && n.severity?.toLowerCase() !== "safe").length,
  }), [alerts, acknowledged]);

  const tabs = ["All", "Critical", "High", "Medium", "Active", "Acknowledged"];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-100 pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-rose-100">
              <Zap size={12} className="fill-rose-700" />
              Live Disaster Surveillance
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight font-display mb-3">
              Disaster Alerts
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl font-medium leading-relaxed">
              Real-time monitoring of agricultural hazards. Stay ahead of floods, droughts, and pest outbreaks with precision telemetry.
            </p>
          </div>

          {/* District Selector */}
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Monitoring Region
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full sm:w-[260px] bg-white border border-slate-200 rounded-2xl py-4 pl-11 pr-10 font-bold text-slate-900 text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer shadow-sm transition-all"
              >
                <option value="">Select Monitoring Zone...</option>
                {Object.keys(SRI_LANKA_DISTRICTS).map((d) => (
                  <option key={d} value={d}>
                    {d} {userFarms.some((f) => f.district?.toLowerCase() === d.toLowerCase()) ? "🌱" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            {selectedDistrict && userFarms.some(f => f.district === selectedDistrict) && (
              <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                <Leaf size={10} />
                Precision monitoring active for {selectedDistrict}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoading && selectedDistrict && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Alerts", value: stats.total, color: "bg-white text-slate-900 border-slate-100", icon: Bell },
            { label: "Critical Risk", value: stats.critical, color: "bg-rose-50 text-rose-700 border-rose-100", icon: ShieldAlert },
            { label: "Pending Actions", value: stats.active, color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-6 rounded-[32px] border ${stat.color} shadow-sm flex items-center justify-between`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{stat.label}</p>
                <p className="text-4xl font-black">{stat.value}</p>
              </div>
              <stat.icon size={32} className="opacity-20" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Tabs & Clear All */}
      {!isLoading && alerts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  filter === tab
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const allIds = alerts.map(a => a.id);
              setAcknowledged(prev => [...new Set([...prev, ...allIds])]);
              setFilter("Active");
            }}
            className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all self-start sm:self-auto"
          >
            Clear All Alerts
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-4">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-emerald-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={16} className="text-emerald-600 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-500 font-bold text-lg">Analyzing environmental vectors in {selectedDistrict}...</p>
          </motion.div>
        )}

        {!isLoading && !selectedDistrict && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-slate-50 rounded-[48px] border border-dashed border-slate-200"
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <MapPin size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Select a Monitoring Zone</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto text-lg">
              Deployment of real-time disaster detection requires a regional selection. Choose your district to begin satellite-assisted surveillance.
            </p>
          </motion.div>
        )}

        {!isLoading && selectedDistrict && filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-emerald-50/50 rounded-[48px] border border-emerald-100"
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm relative">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 rounded-full"
              />
            </div>
            <h3 className="text-3xl font-black text-emerald-900 mb-4">System Secure</h3>
            <p className="text-emerald-700/70 font-bold max-w-md mx-auto text-lg">
              No active disaster vectors detected in {selectedDistrict}. Environmental parameters are within optimal agricultural thresholds.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live Monitoring
              </span>
            </div>
          </motion.div>
        )}

        {!isLoading && filteredAlerts.length > 0 && (
          <AnimatePresence>
            {filteredAlerts.map((notif, i) => {
              const Icon = getIcon(notif.icon);
              const style = getSeverityStyle(notif.severity);
              const isAck = acknowledged.includes(notif.id);

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.06 }}
                  className={`${style.bg} border ${style.border} rounded-[32px] p-8 transition-all hover:shadow-lg hover:shadow-slate-200/50 ${
                    isAck ? "opacity-60 grayscale-[0.5]" : ""
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`${style.icon} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon size={28} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <span className={`${style.badge} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                          {notif.severity}
                        </span>
                        {notif.isOfficial && (
                          <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            Official Broadcast
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Clock size={14} /> {notif.time}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <MapPin size={14} /> {notif.location}
                        </span>
                      </div>

                      <h3 className={`text-2xl font-black ${style.text} mb-3 tracking-tight`}>{notif.type}</h3>
                      <p className="text-slate-700 font-medium text-base leading-relaxed mb-6">{notif.message}</p>

                      <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert size={14} className="text-emerald-600" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Directive</span>
                        </div>
                        <p className="text-slate-900 font-bold text-sm leading-relaxed">{notif.action}</p>
                      </div>

                      {/* Tactical Response Roadmap */}
                      <div className="mt-8 pt-8 border-t border-slate-100/50">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                            <Zap size={14} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Response Roadmap</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(RESPONSE_PROTOCOLS[notif.type] || RESPONSE_PROTOCOLS[notif.isOfficial ? "Government Official Warning" : "Pest Risk Advisory"]).map((step, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group">
                              <div className="text-emerald-500 font-black text-xs pt-0.5">{idx + 1}.</div>
                              <p className="text-[11px] font-bold text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      {isAck ? (
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl">
                          <CheckCircle2 size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Logged</span>
                        </div>
                      ) : notif.severity?.toLowerCase() !== "safe" ? (
                        <button
                          onClick={() => handleAcknowledge(notif.id)}
                          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                        >
                          Acknowledge
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!isLoading && selectedDistrict && weatherSource && (
          <div className="text-center pt-8">
            <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-400 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Intelligence Node: {weatherSource} · {selectedDistrict} · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>

      {/* 🏛️ Government & Emergency Resources Section */}
      <div className="pt-16 border-t border-slate-100">
        <div className="mb-10">
          <span className="text-rose-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Escalation Protocols</span>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Emergency Resources</h2>
          <p className="text-slate-500 mt-5 max-w-2xl font-medium text-lg leading-relaxed">Official government channels for critical intervention and disaster relief coordination.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* DMC Card */}
          <motion.div 
            whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.05)" }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group transition-all"
          >
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <ShieldAlert size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">National Hotline</p>
              <h4 className="text-2xl font-black text-slate-900">DMC 117</h4>
              <p className="text-red-600 font-black text-xs mt-1">Disaster Management</p>
            </div>
          </motion.div>

          {/* Agriculture Card */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group transition-all"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <Leaf size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agri Advisory</p>
              <h4 className="text-2xl font-black text-slate-900">ASG 1920</h4>
              <p className="text-emerald-600 font-black text-xs mt-1">Dept. of Agriculture</p>
            </div>
          </motion.div>

          {/* Suwaseriya Card */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group transition-all"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Relief</p>
              <h4 className="text-2xl font-black text-slate-900">EMS 1990</h4>
              <p className="text-blue-600 font-black text-xs mt-1">Free Ambulance Service</p>
            </div>
          </motion.div>

          {/* MET Card */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group transition-all"
          >
            <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
              <Wind size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weather Auth</p>
              <h4 className="text-2xl font-black text-slate-900 font-display tracking-tight">Met Dept</h4>
              <p className="text-slate-500 font-bold text-xs mt-1">Official Forecasting</p>
            </div>
          </motion.div>

          {/* Police Card */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group transition-all"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800 group-hover:text-white transition-all duration-500 shadow-sm">
              <Bell size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</p>
              <h4 className="text-2xl font-black text-slate-900">Police 119</h4>
              <p className="text-blue-800 font-black text-xs mt-1">General Emergency</p>
            </div>
          </motion.div>

          {/* Web Links Card */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-900/20 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="text-emerald-400" size={20} />
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Digital Resources</h4>
            </div>
            <div className="space-y-4">
              <a href="http://www.dmc.gov.lk" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 text-sm font-bold block transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> dmc.gov.lk
              </a>
              <a href="http://www.agriculture.gov.lk" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 text-sm font-bold block transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> agriculture.gov.lk
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
