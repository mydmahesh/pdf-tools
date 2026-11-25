import React from 'react';
import { ShieldCheck, Zap, Heart, Lock, FileText, CheckCircle2 } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Privacy Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Client-Side Privacy</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your files never leave your browser. All PDF conversions and edits happen right on your device.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Lightning Fast Processing</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  No queue, no file upload delays, no server timeouts. Instant client-side conversions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Completely Free & Unlimited</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  No file size restrictions, no daily quotas, no hidden subscriptions. Free forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800/80 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">PDFCraft</span>
            <span className="text-xs text-slate-500 ml-2">
              © {CURRENT_YEAR} • Built with React & Vite
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No server storage
            </span>
            <span className="flex items-center gap-1.5">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for PDF productivity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
