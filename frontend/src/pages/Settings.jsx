import { Settings, Eye, Volume2, Move, MapPin } from "lucide-react";
import { SettingsSection, ToggleRow } from "../components/UIHelpers";

export default function SettingsPage() {
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
            <ToggleRow label="High Contrast Mode" desc="Enhance visibility for outdoor use" checked />
            <ToggleRow label="Enlarged Typography" desc="Scale text for easier reading" />
            <ToggleRow label="Color Blind Filters" desc="Optimize interface for protanopia" />
          </SettingsSection>

          <SettingsSection title="Interaction">
            <ToggleRow label="Reduced Motion" desc="Minimize animations and transitions" checked />
            <ToggleRow label="Screen Reader Sync" desc="Optimized ARIA live regions" />
          </SettingsSection>
        </div>

        {/* Alerts & Location Column */}
        <div className="space-y-12">
          <SettingsSection title="Alert Preferences">
            <ToggleRow label="Audio Announcements" desc="Voice alerts for critical hazards" checked />
            <ToggleRow label="Direct Push SMS" desc="Global emergency relay" checked />
            <ToggleRow label="Visual Flash Alerts" desc="Screen flashing on critical risk" />
          </SettingsSection>

          <section>
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">Primary Operation Zone</h4>
             <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                <input 
                  type="text" 
                  defaultValue="Central Highlands, Sri Lanka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 font-black text-slate-900 focus:bg-white transition-all outline-none"
                />
             </div>
             <p className="text-[10px] text-slate-400 font-bold mt-4 leading-relaxed">
                Localized telemetry is prioritized based on your primary zone coordinates.
             </p>
          </section>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-slate-300 font-bold text-xs uppercase tracking-widest italic">Accessibility engine active</p>
        </div>
        <button className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
