import { Settings, MapPin } from "lucide-react";
import { SettingsSection, ToggleRow } from "../components/UIHelpers";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-16 rounded-[60px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-4xl font-black font-display text-slate-900 mb-2">System Control</h2>
          <p className="text-slate-400 font-medium text-lg">Configure your global AgriWatch environmental preferences.</p>
        </div>
        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400">
          <Settings size={32} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-12">
          <SettingsSection title="Alert Protocols">
            <ToggleRow label="Push Intelligence" desc="Direct cluster notifications" checked />
            <ToggleRow label="Satellite SMS" desc="Global emergency relay" checked />
            <ToggleRow label="Executive Reports" desc="Weekly PDF farm synthesis" />
          </SettingsSection>

          <section>
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">Security Mode</h4>
             <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                <div className="flex items-center justify-between mb-4">
                   <p className="font-black font-display text-lg">Stealth Sync</p>
                   <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 flex items-center justify-end">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Encrypted data transmission between field sensors and satellite relay nodes.</p>
             </div>
          </section>
        </div>

        <div className="space-y-12">
          <section>
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">System Analytics</h4>
             <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Connectivity</p>
                <div className="flex items-center gap-3">
                   <div className="h-2 flex-1 bg-emerald-500 rounded-full"></div>
                   <div className="h-2 flex-1 bg-emerald-500 rounded-full"></div>
                   <div className="h-2 flex-1 bg-emerald-200 rounded-full"></div>
                   <span className="text-xs font-black text-emerald-600">68%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-4 leading-relaxed">Regional sensor synchronization is currently operating at high-fidelity levels.</p>
             </div>
          </section>

          <section>
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">Farm Location</h4>
             <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                <input 
                  type="text" 
                  defaultValue="Central Highlands, Sri Lanka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 font-black text-slate-900 focus:bg-white transition-all outline-none"
                />
             </div>
          </section>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
        <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">Last Sync: Oct 24, 2026 - 14:32:01</p>
        <button className="bg-emerald-900 text-white px-12 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-900/20">Apply Global Changes</button>
      </div>
    </div>
  );
}
