import React from 'react';
import { Download, CheckCircle2, RotateCcw, ArrowLeft, FileText, ArrowDown } from 'lucide-react';
import type { ProcessResult } from '../types/pdf';

interface SuccessDownloadProps {
  result: ProcessResult;
  onReset: () => void;
  onBackToHome: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const SuccessDownload: React.FC<SuccessDownloadProps> = ({
  result,
  onReset,
  onBackToHome,
}) => {
  const hasSavings = result.originalSize && result.originalSize > result.fileSize;
  const savingsPercent = hasSavings
    ? Math.round(((result.originalSize! - result.fileSize) / result.originalSize!) * 100)
    : 0;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-100 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Your document is ready!
      </h2>
      <p className="text-slate-500 text-sm mt-2 font-medium">
        Processed securely and privately on your device.
      </p>

      {/* File Details Box */}
      <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{result.fileName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatBytes(result.fileSize)}</p>
          </div>
        </div>

        {hasSavings && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
              Reduced by {savingsPercent}%
            </span>
            <span className="text-slate-700">
              <span className="line-through text-slate-400 mr-2">
                {formatBytes(result.originalSize!)}
              </span>
              <span className="text-emerald-700 font-bold">{formatBytes(result.fileSize)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Download Action */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download {result.fileName}</span>
        </button>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Convert another file</span>
          </button>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>All tools</span>
          </button>
        </div>
      </div>
    </div>
  );
};
