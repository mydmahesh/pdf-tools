import React from 'react';
import {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image as ImageIcon,
  Images,
  AlignLeft,
  PenTool,
  RotateCw,
  Stamp,
  Hash,
  Unlock,
  ScanText,
  ArrowRight,
} from 'lucide-react';
import type { ToolDefinition } from '../types/pdf';

const iconMap: Record<string, React.ElementType> = {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image: ImageIcon,
  Images,
  AlignLeft,
  PenTool,
  RotateCw,
  Stamp,
  Hash,
  Unlock,
  ScanText,
};

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const IconComponent = iconMap[tool.iconName] || FileText;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top subtle color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
        style={{ backgroundColor: tool.color }}
      />

      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 duration-200"
            style={{ backgroundColor: tool.color }}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          {tool.badge && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/60">
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 text-lg group-hover:text-red-600 transition-colors">
          {tool.title}
        </h3>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          {tool.shortDesc}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-red-600">
        <span>Use Tool</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
