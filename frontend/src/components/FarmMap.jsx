import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom component to handle map centering when location changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function FarmMap() {
  const [mapCenter, setMapCenter] = useState([7.2906, 80.6337]); // Default Kandy
  const [userPos, setUserPos] = useState(null);
  const [locationName, setLocationName] = useState("Kandy, Sri Lanka");
  const [zoom, setZoom] = useState(16);

  useEffect(() => {
    // Detect User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setUserPos([latitude, longitude]);
          setZoom(15);
          
          // Reverse geocoding to get city name (optional but professional)
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            setLocationName(data.address.city || data.address.town || data.address.village || "Your Location");
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        },
        (error) => {
          console.warn("Geolocation denied or failed. Using default.");
        }
      );
    }
  }, []);

  const sensorLocations = [
    { id: 1, pos: [mapCenter[0] + 0.001, mapCenter[1] + 0.001], name: "North-Field-A", status: "Online" },
    { id: 2, pos: [mapCenter[0] - 0.001, mapCenter[1] - 0.001], name: "South-Cluster-B", status: "Online" },
    { id: 3, pos: [mapCenter[0] + 0.002, mapCenter[1] - 0.001], name: "Greenhouse-01", status: "Warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Location Badge */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm w-fit">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Navigation size={20} className="animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Detection</p>
          <p className="text-lg font-black text-slate-900">{locationName}</p>
        </div>
      </div>

      <div className="h-[500px] w-full rounded-[48px] overflow-hidden border border-white shadow-2xl shadow-slate-200/50 relative z-0">
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} zoom={zoom} />
          
          {/* Using CartoDB Voyager tiles for a cleaner, higher-end look */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* User Current Location Marker */}
          {userPos && (
            <Marker position={userPos}>
              <Popup>
                <div className="font-display">
                  <p className="font-black text-blue-600">You are here</p>
                  <p className="text-xs text-slate-400">Monitoring nearby clusters...</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Farm Sensor Locations */}
          {sensorLocations.map(sensor => (
            <Marker key={sensor.id} position={sensor.pos}>
              <Popup>
                <div className="font-display">
                  <p className="font-black text-slate-900">{sensor.name}</p>
                  <p className={`text-xs font-bold ${sensor.status === 'Online' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    Status: {sensor.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
