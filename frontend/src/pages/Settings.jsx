import { useState, useEffect } from "react";
import { Eye, MapPin, CheckCircle2 } from "lucide-react";
import { SettingsSection, ToggleRow } from "../components/UIHelpers";

export default function SettingsPage({ user, setUser }) {
  // Initialize state from user profile or defaults
  const [settings, setSettings] = useState(() => {
    if (user?.settings) return user.settings;
    const saved = localStorage.getItem("agriWatchSettings");
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      enlargedText: false,
      colorBlind: false,
      reducedMotion: false,
      screenReader: false,
      audioAnnounce: true,
      pushSms: true,
      visualFlash: false,
      location: "Central Highlands, Sri Lanka"
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply visual changes globally
  useEffect(() => {
    const root = document.documentElement;
    if (settings.highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");
    
    if (settings.enlargedText) root.classList.add("enlarge-text");
    else root.classList.remove("enlarge-text");

    if (settings.reducedMotion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sync with Backend if logged in
      if (user?.email) {
        const res = await axios.put(`${API_BASE}/api/profile`, {
          email: user.email,
          settings: settings
        });
        // Update global user state
        const updatedUser = { ...user, settings: res.data.user.settings };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      localStorage.setItem("agriWatchSettings", JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to sync settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 rounded-[60px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-4xl font-black font-display text-slate-900 mb-2">Accessibility Settings</h2>
          <p className="text-slate-400 font-medium text-lg">Customize your AgriWatch experience for optimal readability and interaction.</p>
        </div>
        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400">
          <Eye size={32} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-16">
        {/* Visual & Interaction Column */}
        <div className="space-y-12">
          <SettingsSection title="Visual Assistance">
            <ToggleRow 
              label="High Contrast Mode" 
              desc="Enhance visibility for outdoor use" 
              checked={settings.highContrast} 
              onChange={() => handleToggle("highContrast")}
            />
            <ToggleRow 
              label="Enlarged Typography" 
              desc="Scale text for easier reading" 
              checked={settings.enlargedText}
              onChange={() => handleToggle("enlargedText")}
            />
            <ToggleRow 
              label="Color Blind Filters" 
              desc="Optimize interface for protanopia" 
              checked={settings.colorBlind}
              onChange={() => handleToggle("colorBlind")}
            />
          </SettingsSection>

          <SettingsSection title="Interaction">
            <ToggleRow 
              label="Reduced Motion" 
              desc="Minimize animations and transitions" 
              checked={settings.reducedMotion}
              onChange={() => handleToggle("reducedMotion")}
            />
            <ToggleRow 
              label="Screen Reader Sync" 
              desc="Optimized ARIA live regions" 
              checked={settings.screenReader}
              onChange={() => handleToggle("screenReader")}
            />
          </SettingsSection>
        </div>

        {/* Alerts & Location Column */}
        <div className="space-y-12">
          <SettingsSection title="Alert Preferences">
            <ToggleRow 
              label="Audio Announcements" 
              desc="Voice alerts for critical hazards" 
              checked={settings.audioAnnounce}
              onChange={() => handleToggle("audioAnnounce")}
            />
            <ToggleRow 
              label="Direct Push SMS" 
              desc="Global emergency relay" 
              checked={settings.pushSms}
              onChange={() => handleToggle("pushSms")}
            />
            <ToggleRow 
              label="Visual Flash Alerts" 
              desc="Screen flashing on critical risk" 
              checked={settings.visualFlash}
              onChange={() => handleToggle("visualFlash")}
            />
          </SettingsSection>

          <section>
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">Primary Operation Zone</h4>
             <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                <input 
                  type="text" 
                  value={settings.location}
                  onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 font-black text-slate-900 focus:bg-white transition-all outline-none"
                />
             </div>
          </section>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${saveSuccess ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}></div>
          <p className="text-slate-300 font-bold text-xs uppercase tracking-widest italic">
            {saveSuccess ? "Preferences Synchronized" : "Local Changes Pending"}
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Preferences"}
          {saveSuccess && <CheckCircle2 size={20} className="text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}
