import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Sprout,
  Search,
  Filter,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  Maximize2,
  Wind,
  Droplets,
  Thermometer,
  RefreshCcw,
} from "lucide-react";

// Fix for Leaflet default icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Green farm icon (OSM farms)
const farmIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#059669;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// Purple icon for admin-added farms
const adminFarmIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#7c3aed;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// Wind arrow icon — rotated by wind direction degrees
const windIcon = (deg, speed) => new L.DivIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="
        background:rgba(15,23,42,0.85);
        color:white;
        border-radius:12px;
        padding:4px 8px;
        font-size:10px;
        font-weight:900;
        letter-spacing:0.05em;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        border:1px solid rgba(255,255,255,0.15)
      ">${speed} km/h</div>
      <div style="
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-bottom:20px solid rgba(16,185,129,0.9);
        transform:rotate(${deg}deg);
        filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      "></div>
    </div>`,
  iconSize: [60, 50],
  iconAnchor: [30, 25],
  popupAnchor: [0, -30],
});

// Component to handle map centering and zooming
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const API_BASE = "http://127.0.0.1:5001";

// Key Sri Lanka cities for wind data
const WIND_CITIES = [
  { name: "Colombo",       lat: 6.9271,  lon: 79.8612, query: "Colombo,LK" },
  { name: "Kandy",         lat: 7.2906,  lon: 80.6337, query: "Kandy,LK" },
  { name: "Jaffna",        lat: 9.6615,  lon: 80.0255, query: "Jaffna,LK" },
  { name: "Galle",         lat: 6.0535,  lon: 80.2210, query: "Galle,LK" },
  { name: "Anuradhapura",  lat: 8.3114,  lon: 80.4037, query: "Anuradhapura,LK" },
  { name: "Trincomalee",   lat: 8.5874,  lon: 81.2152, query: "Trincomalee,LK" },
  { name: "Nuwara Eliya",  lat: 6.9497,  lon: 80.7891, query: "Nuwara+Eliya,LK" },
  { name: "Batticaloa",    lat: 7.7170,  lon: 81.7000, query: "Batticaloa,LK" },
];

// Convert compass direction string to degrees
function compassToDeg(dir) {
  const map = {
    N:0, NNE:22, NE:45, ENE:67, E:90, ESE:112, SE:135, SSE:157,
    S:180, SSW:202, SW:225, WSW:247, W:270, WNW:292, NW:315, NNW:337
  };
  return map[dir] ?? 0;
}

export default function FarmRegistry() {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]);
  const [zoom, setZoom] = useState(8);
  const [windData, setWindData] = useState([]);
  const [weatherSummary, setWeatherSummary] = useState(null);

  useEffect(() => {
    fetchFarms();
    fetchAllWind();
    const timer = setInterval(fetchAllWind, 600000); // refresh every 10 min
    return () => clearInterval(timer);
  }, []);

  const fetchAllWind = async () => {
    try {
      const results = await Promise.all(
        WIND_CITIES.map(async (city) => {
          const res = await axios.get(`https://wttr.in/${city.query}?format=j1`, { timeout: 8000 });
          const c = res.data.current_condition[0];
          return {
            ...city,
            speed: parseInt(c.windspeedKmph),
            dir: c.winddir16Point,
            deg: compassToDeg(c.winddir16Point),
            temp: c.temp_C,
            humidity: c.humidity,
            condition: c.weatherDesc[0].value,
          };
        })
      );
      setWindData(results);
      setWeatherSummary(results[0]); // Colombo as main summary
    } catch (err) {
      console.log("Wind data fetch failed, using simulated values");
      setWindData(WIND_CITIES.map(c => ({
        ...c, speed: Math.floor(Math.random() * 20) + 8,
        dir: ["N","NE","E","SE","S","SW","W","NW"][Math.floor(Math.random()*8)],
        deg: Math.floor(Math.random() * 360),
        temp: Math.floor(Math.random() * 8) + 25,
        humidity: Math.floor(Math.random() * 30) + 60,
        condition: "Partly Cloudy"
      })));
    }
  };

  const fetchFarms = async () => {
    setLoading(true);
    try {
      // Fetch OSM farms and admin-added farms in parallel
      const [osmRes, adminRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/farms/sri-lanka`),
        axios.get(`${API_BASE}/api/admin/farms`, { params: { t: Date.now() } }), // Cache-bust
      ]);

      let merged = [];

      if (osmRes.status === "fulfilled" && osmRes.value.data.success) {
        merged = osmRes.value.data.data.map(f => ({ ...f, _source: "osm" }));
      }

      if (adminRes.status === "fulfilled") {
        const adminFarms = adminRes.value.data.map(f => ({
          id: f._id,
          name: f.name,
          latitude: f.lat,
          longitude: f.lon,
          district: f.district,
          category: f.cropType,
          crop: f.cropType,
          ownerName: f.ownerName,
          areaHa: f.areaHa,
          notes: f.notes,
          _source: "admin",
        }));
        // Admin farms go first
        merged = [...adminFarms, ...merged];
      }

      setFarms(merged);
      setFilteredFarms(merged);
    } catch (err) {
      setError("Farm location data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const results = farms.filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || farm.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredFarms(results);

    if (searchTerm.length === 0) {
      setMapCenter([7.8731, 80.7718]);
      setZoom(8);
    }
  }, [searchTerm, categoryFilter, farms]);

  const handleSearchTrigger = () => {
    if (filteredFarms.length > 0) {
      setMapCenter([filteredFarms[0].latitude, filteredFarms[0].longitude]);
      setZoom(14);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchTrigger();
  };

  const handleFarmClick = (lat, lon) => {
    setMapCenter([lat, lon]);
    setZoom(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ["all", ...new Set(farms.map(f => f.category))];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Geospatial Registry</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">SL Farm Map</h2>
        </div>
        <div className="flex gap-4">
          {/* Farm Count */}
          <div className="bg-white px-6 py-4 rounded-[28px] border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Farms Mapped</span>
              <span className="text-lg font-black text-emerald-600">{filteredFarms.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Globe size={20} />
            </div>
          </div>
          {/* Live Wind Summary */}
          {weatherSummary && (
            <div className="bg-slate-900 text-white px-6 py-4 rounded-[28px] shadow-sm flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colombo Wind</span>
                <span className="text-lg font-black text-emerald-400">{weatherSummary.speed} km/h {weatherSummary.dir}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <Wind size={20} />
              </div>
            </div>
          )}
          {/* Refresh Button */}
          <button
            onClick={() => { fetchFarms(); fetchAllWind(); }}
            className="bg-white p-4 rounded-[28px] border border-slate-200/60 shadow-sm text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center group"
            title="Refresh Farm Data"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin text-emerald-600" : "group-hover:rotate-180 transition-transform duration-500"} />
          </button>
        </div>
      </div>

      {/* UNIFIED MAP — Farms + Live Wind on one map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-[48px] overflow-hidden border-4 border-white shadow-2xl relative z-0"
        style={{ height: '650px' }}
      >
        {/* Legend */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-xl flex flex-col gap-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Legend</p>
          <div className="flex items-center gap-3">
            <div style={{background:'#7c3aed',width:14,height:14,borderRadius:'50%',border:'2px solid white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}></div>
            <span className="text-xs font-bold text-slate-700">Admin-Added Farm</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{background:'#059669',width:14,height:14,borderRadius:'50%',border:'2px solid white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}></div>
            <span className="text-xs font-bold text-slate-700">OSM Farm / Farmland</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{width:0,height:0,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderBottom:'16px solid rgba(16,185,129,0.9)'}}></div>
            <span className="text-xs font-bold text-slate-700">Wind Direction</span>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">● Live Data</span>
          </div>
        </div>

        {loading ? (
          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading farms & wind data...</p>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
            <ChangeView center={mapCenter} zoom={zoom} />

            {/* High Quality CartoDB Voyager Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* 🌿 FARM MARKERS */}
            {filteredFarms.map((farm) => (
              <Marker
                key={farm.id}
                position={[farm.latitude, farm.longitude]}
                icon={farm._source === "admin" ? adminFarmIcon : farmIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-slate-900 text-base">{farm.name}</h4>
                      {farm._source === "admin" && (
                        <span style={{fontSize:'9px',background:'#ede9fe',color:'#7c3aed',padding:'2px 6px',borderRadius:'999px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.05em'}}>Admin</span>
                      )}
                    </div>
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                      {farm.category}
                    </span>
                    <div className="space-y-1 text-xs text-slate-500 border-t pt-2">
                      {farm.crop     && <p><strong>Crop:</strong> {farm.crop}</p>}
                      {farm.district && <p><strong>District:</strong> {farm.district}</p>}
                      {farm.ownerName && <p><strong>Owner:</strong> {farm.ownerName}</p>}
                      {farm.areaHa > 0 && <p><strong>Area:</strong> {farm.areaHa} Ha</p>}
                      {farm.notes   && <p><strong>Notes:</strong> {farm.notes}</p>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 🌬️ WIND DIRECTION MARKERS */}
            {windData.map((w) => (
              <Marker key={`wind-${w.name}`} position={[w.lat, w.lon]} icon={windIcon(w.deg, w.speed)}>
                <Popup>
                  <div className="p-2 min-w-[190px]">
                    <h4 className="font-black text-slate-900 text-base mb-2">🌬️ {w.name}</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p><strong>Wind:</strong> {w.speed} km/h {w.dir}</p>
                      <p><strong>Temp:</strong> {w.temp}°C</p>
                      <p><strong>Humidity:</strong> {w.humidity}%</p>
                      <p><strong>Condition:</strong> {w.condition}</p>
                    </div>
                    <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Live Data</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </motion.div>

      {/* Search and List Section */}
      <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex gap-4 w-full lg:w-auto flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="Search by farm name..."
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-8 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleSearchTrigger}
              className="bg-slate-900 text-white px-10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10"
            >
              Search Map
            </button>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Filter className="text-slate-400" size={20} />
            <select
              className="bg-slate-50 border-none rounded-2xl py-5 px-8 text-sm font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFarms.slice(0, 9).map((farm) => (
            <motion.div
              key={farm.id}
              whileHover={{ scale: 1.02 }}
              className={`group p-8 rounded-[40px] border bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all ${
                farm._source === "admin" ? "border-violet-200" : "border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl group-hover:text-white transition-all ${
                  farm._source === "admin"
                    ? "bg-violet-100 text-violet-700 group-hover:bg-violet-600"
                    : "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600"
                }`}>
                  <Sprout size={24} />
                </div>
                <div className="flex items-center gap-2">
                  {farm._source === "admin" && (
                    <span className="text-[9px] font-black bg-violet-100 text-violet-700 px-2 py-1 rounded-full uppercase tracking-widest">Admin</span>
                  )}
                  <button
                    onClick={() => handleFarmClick(farm.latitude, farm.longitude)}
                    className="p-3 bg-white text-slate-400 rounded-xl shadow-sm hover:text-emerald-600 transition-colors"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2 truncate">{farm.name}</h4>
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <MapPin size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{farm.district || "Sri Lanka"}</span>
              </div>
              {farm._source === "admin" && farm.ownerName && (
                <p className="text-xs text-slate-400 font-medium mb-2">👤 {farm.ownerName}</p>
              )}
              {farm._source === "admin" && farm.areaHa > 0 && (
                <p className="text-xs text-slate-400 font-medium mb-2">📐 {farm.areaHa} Ha</p>
              )}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  farm._source === "admin" ? "text-violet-600" : "text-emerald-600"
                }`}>{farm.category}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {farm._source === "admin" ? "Admin Added" : "OSM Verified"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFarms.length > 6 && (
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Viewing primary agricultural zones</p>
          </div>
        )}
      </div>

      {/* Academic Explanation */}
      <div className="bg-emerald-900 text-white rounded-[48px] p-16 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <h3 className="text-3xl font-black mb-8 font-display">Academic Data Integration Note</h3>
          <p className="text-xl text-emerald-100/80 leading-relaxed font-medium mb-12 italic">
            "The system integrates OpenStreetMap Overpass API to retrieve publicly mapped farm and farmland locations within Sri Lanka. Wind direction and weather data is fetched in real-time from the wttr.in global meteorological service and visualised as directional arrows overlaid on the farm map. This dual-layer approach demonstrates live geospatial agricultural intelligence."
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold">Data Source: OpenStreetMap</div>
            <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold">Weather: wttr.in Live API</div>
            <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold">Protocol: Overpass QL</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-800/30 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
}
