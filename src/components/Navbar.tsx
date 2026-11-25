import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import type { ToolCategory, ToolId } from '../types/pdf';

interface NavbarProps {
  currentCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  onSelectTool: (toolId: ToolId | null) => void;
  activeToolId: ToolId | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onSelectTool,
  activeToolId,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onSelectTool(null)}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  PDF<span className="text-red-600">Craft</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                  Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium hidden sm:block">
                All-in-one PDF tools & conversions
              </p>
            </div>
          </div>

          {/* Center Navigation Categories */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => {
                onSelectTool(null);
                onSelectCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeToolId && currentCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => {
                onSelectTool(null);
                onSelectCategory('organize');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeToolId && currentCategory === 'organize'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Organize
            </button>
            <button
              onClick={() => {
                onSelectTool(null);
                onSelectCategory('convert-to-pdf');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeToolId && currentCategory === 'convert-to-pdf'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Convert to PDF
            </button>
            <button
              onClick={() => {
                onSelectTool(null);
                onSelectCategory('convert-from-pdf');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeToolId && currentCategory === 'convert-from-pdf'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Convert from PDF
            </button>
            <button
              onClick={() => {
                onSelectTool(null);
                onSelectCategory('security-edit');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeToolId && currentCategory === 'security-edit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Security & Edit
            </button>
          </nav>

          {/* Right badges & links */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Private (Local)</span>
            </div>

            <a
              href="https://github.com/mydmahesh/pdf-tools"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
