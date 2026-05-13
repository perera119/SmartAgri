import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/60 py-12 px-8 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <Sprout size={24} className="text-emerald-600" />
            <h4 className="text-xl font-black text-slate-800 font-display">AgriWatch AI</h4>
          </div>
          <p className="text-slate-400 text-sm font-medium max-w-xs text-center md:text-left leading-relaxed">
            Leading the revolution in precision agriculture with real-time AI insights.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <h5 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-[10px]">Product</h5>
            <ul className="space-y-2 text-slate-400 font-bold">
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">API Docs</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">Hardware</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-[10px]">Company</h5>
            <ul className="space-y-2 text-slate-400 font-bold">
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors">Support</li>
            </ul>
          </div>
        </div>
        <div className="text-center md:text-right">
           <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">© 2026 AgriWatch Solutions</p>
           <p className="text-slate-400 text-xs mt-2 font-medium">All rights reserved. Patent Pending.</p>
        </div>
      </div>
    </footer>
  );
}
