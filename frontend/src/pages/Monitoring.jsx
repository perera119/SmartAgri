import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, ChevronDown, Search, X, Thermometer, Droplets, CloudRain, Loader2, LineChart as ChartIcon } from "lucide-react";
import axios from "axios";
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

// ─── Sri Lanka Districts + ASCs + coordinates ──────────────────────────────────
const DISTRICT_DATA = {
  "Colombo":       { lat: 6.9271,  lon: 79.8612, asc: ["Homagama","Kaduwela","Kesbewa","Kolonnawa","Moratuwa","Thimbirigasyaya"] },
  "Kandy":         { lat: 7.2906,  lon: 80.6337, asc: ["Akurana","Doluwa","Gampola","Harispattuwa","Kundasale","Tumpane","Udunuwara"] },
  "Galle":         { lat: 6.0535,  lon: 80.2210, asc: ["Akmeemana","Baddegama","Bentota","Elpitiya","Hikkaduwa","Imaduwa"] },
  "Jaffna":        { lat: 9.6615,  lon: 80.0255, asc: ["Chavakachcheri","Delft","Island North","Island South","Jaffna","Kopay","Nallur","Vaddukoddai"] },
  "Kurunegala":    { lat: 7.4863,  lon: 80.3647, asc: ["Bingiriya","Galgamuwa","Ibbagamuwa","Kuliyapitiya","Maho","Narammala","Nikaweratiya"] },
  "Anuradhapura":  { lat: 8.3114,  lon: 80.4037, asc: ["Eppawala","Galnewa","Horowpothana","Kekirawa","Mahavilachchiya","Mihintale","Padaviya"] },
  "Ratnapura":     { lat: 6.6828,  lon: 80.3992, asc: ["Balangoda","Eheliyagoda","Kalawana","Kuruwita","Pelmadulla","Rakwana"] },
  "Matale":        { lat: 7.4675,  lon: 80.6234, asc: ["Ambanganga Korale","Dambulla","Galewela","Laggala","Naula","Pallepola","Ukuwela"] },
  "Nuwara Eliya":  { lat: 6.9497,  lon: 80.7891, asc: ["Ambagamuwa","Hanguranketha","Kothmale","Nuwara Eliya","Walapane"] },
  "Badulla":       { lat: 6.9934,  lon: 81.0550, asc: ["Badulla","Bandarawela","Ella","Haldummulla","Haputale","Mahiyanganaya","Passara","Welimada"] },
  "Hambantota":    { lat: 6.1246,  lon: 81.1185, asc: ["Ambalantota","Beliatta","Hambantota","Katuwana","Lunugamvehera","Thissamaharama","Weeraketiya"] },
  "Trincomalee":   { lat: 8.5874,  lon: 81.2152, asc: ["Gomarankadawala","Kanthale","Kuchchaveli","Morawewa","Muttur","Seruvila","Trincomalee"] },
  "Batticaloa":    { lat: 7.7170,  lon: 81.7000, asc: ["Eravur Pattu","Eravur Pattu","Kattankudy","Koralai Pattu","Manmunai North","Manmunai South"] },
  "Ampara":        { lat: 7.2914,  lon: 81.6748, asc: ["Addalaichenai","Alaiadivembu","Ampara","Damana","Dehiattakandiya","Kalmunai","Mahaoya","Uhana"] },
  "Polonnaruwa":   { lat: 7.9403,  lon: 81.0188, asc: ["Dimbulagala","Elahera","Lankapura","Medirigiriya","Thamankaduwa","Welikanda"] },
  "Gampaha":       { lat: 7.0912,  lon: 80.0119, asc: ["Attanagalla","Biyagama","Divulapitiya","Dompe","Gampaha","Ja-Ela","Katana","Mahara","Minuwangoda","Mirigama","Negombo","Wattala"] },
  "Kalutara":      { lat: 6.5854,  lon: 79.9607, asc: ["Agalawatta","Bandaragama","Beruwala","Bulathsinhala","Dodangoda","Horana","Kalutara","Madurawela","Mathugama","Millaniya","Palindanuwara"] },
  "Matara":        { lat: 5.9485,  lon: 80.5353, asc: ["Akuressa","Athuraliya","Devinuwara","Hakmana","Kamburupitiya","Kotapola","Malimbada","Matara","Mulatiyana","Pasgoda","Pitabeddara","Thihagoda"] },
  "Moneragala":    { lat: 6.8730,  lon: 81.3450, asc: ["Badalkumbura","Bibile","Buttala","Katharagama","Medagama","Moneragala","Siyambalanduwa","Wellawaya"] },
  "Puttalam":      { lat: 8.0360,  lon: 79.8280, asc: ["Anamaduwa","Chilaw","Dankotuwa","Kalpitiya","Mundalama","Nattandiya","Pallama","Puttalam","Wennappuwa"] },
  "Mannar":        { lat: 8.9810,  lon: 79.9040, asc: ["Madhu","Mannar","Manthai West","Musalai","Nanaddan"] },
  "Vavuniya":      { lat: 8.7714,  lon: 80.4977, asc: ["Vavuniya","Vavuniya North","Vavuniya South","Vengalacheddikulam"] },
  "Mullaitivu":    { lat: 9.2671,  lon: 80.8125, asc: ["Manthai East","Maritimepattu","Oddusuddan","Puthukudiyiruppu","Thunukkai","Welioya"] },
  "Kilinochchi":   { lat: 9.3803,  lon: 80.3770, asc: ["Karachchi","Kandavalai","Pachchilaipalli","Poonakary"] },
};

// Default — whole Sri Lanka view
const SL_DEFAULT = { lat: 7.873, lon: 80.771, zoom: 8, name: "Sri Lanka" };

function buildWindyUrl({ lat, lon, zoom }) {
  return (
    `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}` +
    `&detailLat=${lat}&detailLon=${lon}&zoom=${zoom}` +
    `&level=surface&overlay=wind&product=ecmwf&menu=&message=true` +
    `&marker=&calendar=now&pressure=&type=map&location=coordinates` +
    `&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`
  );
}

export default function Monitoring() {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedAsc,      setSelectedAsc]      = useState("");
  const [mapTarget,        setMapTarget]        = useState(SL_DEFAULT);
  const [windyKey,         setWindyKey]         = useState(0);
  const [forecastData,     setForecastData]     = useState([]);
  const [isSearching,       setIsSearching]       = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  const districts = Object.keys(DISTRICT_DATA).sort();
  const ascList   = selectedDistrict ? DISTRICT_DATA[selectedDistrict].asc : [];

  // Fetch 24h forecast data when district changes
  useEffect(() => {
    async function fetchForecast() {
      setIsFetchingWeather(true);
      try {
        const { lat, lon } = mapTarget;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&forecast_days=1&timezone=Asia%2FColombo`;
        const res = await axios.get(url);
        
        const hourly = res.data.hourly;
        const formatted = hourly.time.map((t, i) => ({
          time: new Date(t).toLocaleTimeString("en-US", { hour: 'numeric' }),
          temp: hourly.temperature_2m[i],
          humidity: hourly.relative_humidity_2m[i],
          rain: hourly.precipitation_probability[i],
        }));
        
        setForecastData(formatted);
      } catch (error) {
        console.error("Failed to fetch forecast:", error);
      } finally {
        setIsFetchingWeather(false);
      }
    }
    fetchForecast();
  }, [mapTarget]);

  const handleSearch = async () => {
    if (!selectedDistrict) return;
    setIsSearching(true);

    try {
      let lat = DISTRICT_DATA[selectedDistrict].lat;
      let lon = DISTRICT_DATA[selectedDistrict].lon;
      const name = selectedAsc ? `${selectedAsc}, ${selectedDistrict}` : selectedDistrict;

      // If a specific city/ASC is selected, try to get its exact coordinates
      if (selectedAsc) {
        const query = `${selectedAsc}, ${selectedDistrict}, Sri Lanka`;
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        
        if (geoRes.data && geoRes.data.length > 0) {
          lat = parseFloat(geoRes.data[0].lat);
          lon = parseFloat(geoRes.data[0].lon);
        }
      }

      setMapTarget({ lat, lon, zoom: selectedAsc ? 13 : 11, name });
      setWindyKey(k => k + 1);
    } catch (error) {
      console.error("Geocoding failed:", error);
      // Fallback to district defaults if geocoding fails
      const { lat, lon } = DISTRICT_DATA[selectedDistrict];
      setMapTarget({ lat, lon, zoom: 11, name: selectedDistrict });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearDistrict = () => {
    setSelectedDistrict("");
    setSelectedAsc("");
    setMapTarget(SL_DEFAULT);
    setWindyKey(k => k + 1);
  };

  const windyUrl = buildWindyUrl(mapTarget);

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Field Intelligence</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Monitoring</h2>
        </div>
        <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          Live Data · Windy.com
        </span>
      </div>

      {/* Single map card with search controls inside */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Search bar row */}
        <div className="px-10 pt-10 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Wind size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Live Environment — {mapTarget.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {selectedDistrict ? `Zoomed to ${mapTarget.name}` : "Showing all of Sri Lanka · select a district to zoom in"}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 flex flex-col gap-2 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">District</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedAsc(""); }}
                    className="w-full appearance-none bg-slate-50 border-none rounded-2xl py-4 px-5 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                  >
                    <option value="">— Select District —</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                {selectedDistrict && (
                  <button
                    onClick={handleClearDistrict}
                    className="p-[15px] bg-slate-100 hover:bg-rose-100 hover:text-rose-500 text-slate-400 rounded-2xl transition-all flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ASC Centre</label>
              <div className="relative">
                <select
                  value={selectedAsc}
                  onChange={(e) => setSelectedAsc(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full appearance-none bg-slate-50 border-none rounded-2xl py-4 px-5 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all disabled:opacity-40"
                >
                  <option value="">— All Centres —</option>
                  {ascList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!selectedDistrict || isSearching}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-40 w-full lg:w-auto justify-center min-w-[160px]"
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {isSearching ? "Locating..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* The single Windy map */}
        <div style={{ height: "550px" }}>
          <iframe
            key={windyKey}
            title={`Live Weather — ${mapTarget.name}`}
            src={windyUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
          />
        </div>

        <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>📍 {mapTarget.name}</span>
          <span>🌐 {mapTarget.lat.toFixed(4)}°N, {mapTarget.lon.toFixed(4)}°E</span>
          <span>📡 ECMWF · Windy.com</span>
        </div>
      </motion.div>

      {/* 📊 Weather Analytics Section */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Environmental Data</span>
            <h3 className="text-4xl font-black text-slate-900">Weather Analytics</h3>
          </div>
          {isFetchingWeather && <Loader2 className="animate-spin text-emerald-500" size={24} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Temperature Graph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <Thermometer size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Temperature</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">24-Hour Forecast (°C)</p>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#94a3b8' }} interval={4} />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', fontSize:'12px', fontWeight:'700' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Rainfall Graph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CloudRain size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Rain Probability</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Next 24h chances (%)</p>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#94a3b8' }} interval={4} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', fontSize:'12px', fontWeight:'700' }}
                  />
                  <Area type="step" dataKey="rain" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Humidity Graph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Droplets size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Relative Humidity</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Air Moisture levels (%)</p>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize:9, fill:'#94a3b8' }} interval={4} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', fontSize:'12px', fontWeight:'700' }}
                  />
                  <Area type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
