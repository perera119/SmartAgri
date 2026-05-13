import { useState } from "react";
import { motion } from "framer-motion";
import { Wind, ChevronDown, Search, X } from "lucide-react";

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
  "Batticaloa":    { lat: 7.7170,  lon: 81.7000, asc: ["Eravur Pattu","Eravur Town","Kattankudy","Koralai Pattu","Manmunai North","Manmunai South"] },
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
  const [mapTarget,        setMapTarget]        = useState(SL_DEFAULT); // what the map shows
  const [windyKey,         setWindyKey]         = useState(0); // force iframe reload

  const districts = Object.keys(DISTRICT_DATA).sort();
  const ascList   = selectedDistrict ? DISTRICT_DATA[selectedDistrict].asc : [];

  const handleSearch = () => {
    if (!selectedDistrict) return;
    const { lat, lon } = DISTRICT_DATA[selectedDistrict];
    const name = selectedAsc ? `${selectedAsc}, ${selectedDistrict}` : selectedDistrict;
    setMapTarget({ lat, lon, zoom: selectedAsc ? 12 : 11, name });
    setWindyKey(k => k + 1); // force iframe to reload with new coords
  };

  const handleClearDistrict = () => {
    setSelectedDistrict("");
    setSelectedAsc("");
    setMapTarget(SL_DEFAULT);
    setWindyKey(k => k + 1);
  };

  const windyUrl = buildWindyUrl(mapTarget);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Field Intelligence</span>
          <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-none">Crop Monitoring</h2>
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
                Live Weather — {mapTarget.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {selectedDistrict ? `Zoomed to ${mapTarget.name}` : "Showing all of Sri Lanka · select a district to zoom in"}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* District */}
            <div className="flex-1 flex flex-col gap-2">
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
                    title="Clear & reset to Sri Lanka view"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* ASC */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agrarian Service Centre (ASC)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedAsc}
                    onChange={(e) => setSelectedAsc(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full appearance-none bg-slate-50 border-none rounded-2xl py-4 px-5 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">— All ASCs in District —</option>
                    {ascList.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                {selectedAsc && (
                  <button
                    onClick={() => setSelectedAsc("")}
                    className="p-[15px] bg-slate-100 hover:bg-rose-100 hover:text-rose-500 text-slate-400 rounded-2xl transition-all flex-shrink-0"
                    title="Clear ASC"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!selectedDistrict}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* The single Windy map */}
        <div style={{ height: "620px" }}>
          <iframe
            key={windyKey}
            title={`Live Weather — ${mapTarget.name}`}
            src={windyUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: "none", display: "block" }}
            allowFullScreen
          />
        </div>

        {/* Footer info strip */}
        <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>📍 {mapTarget.name}</span>
          <span>🌐 {mapTarget.lat.toFixed(4)}°N, {mapTarget.lon.toFixed(4)}°E</span>
          <span>📡 ECMWF · Windy.com</span>
        </div>
      </motion.div>

    </div>
  );
}
