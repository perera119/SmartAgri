import { Settings, MapPin } from "lucide-react";
import { SettingsSection, ToggleRow } from "../components/UIHelpers";
import { useLanguage } from "../context/LanguageContext";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 rounded-[60px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-4xl font-black font-display text-slate-900 mb-2">{t('systemControl')}</h2>
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
             <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.4em] mb-8">{t('regionalInterface')}</h4>
             <div className="grid grid-cols-1 gap-4 mt-6">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`w-full py-5 rounded-2xl font-black transition-all ${language === 'en' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  English (Global)
                </button>
                <button 
                  onClick={() => setLanguage('si')}
                  className={`w-full py-5 rounded-2xl font-black transition-all ${language === 'si' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  Sinhala (සිංහල)
                </button>
                <button 
                  onClick={() => setLanguage('ta')}
                  className={`w-full py-5 rounded-2xl font-black transition-all ${language === 'ta' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  Tamil (தமிழ்)
                </button>
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
        <button className="bg-emerald-900 text-white px-12 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-900/20">{t('applyChanges')}</button>
      </div>
    </div>
  );
}
