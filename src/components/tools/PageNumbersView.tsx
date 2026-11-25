import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { addPageNumbersToPdf, type PageNumberOptions } from '../../services/pageNumbersPdf';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { Hash, Loader2, FileText, Check } from 'lucide-react';

interface PageNumbersViewProps {
  onBackToHome: () => void;
}

export const PageNumbersView: React.FC<PageNumbersViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [options, setOptions] = useState<PageNumberOptions>({
    position: 'bottom-center',
    format: 'page-of-total',
    fontSize: 10,
    margin: 30,
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setError(null);

    try {
      const info = await getPdfInfo(f);
      setPageCount(info.pageCount);
      setThumbnail(info.thumbnail);
    } catch (e) {
      console.warn('PDF info error', e);
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await addPageNumbersToPdf(file, options, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to add page numbers.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (result) {
    return (
      <SuccessDownload
        result={result}
        onReset={() => {
          setResult(null);
          setFile(null);
        }}
        onBackToHome={onBackToHome}
      />
    );
  }

  const positions: { id: PageNumberOptions['position']; label: string }[] = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select PDF file to Add Page Numbers"
          subtitle="Insert clean, sequential page numbering into your PDF document"
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {thumbnail ? (
                  <img src={thumbnail} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'} • {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Numbering Position
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setOptions({ ...options, position: pos.id })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    options.position === pos.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{pos.label}</span>
                  {options.position === pos.id && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Numbering Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Numbering Format</label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="page-of-total">Page 1 of {pageCount} (Recommended)</option>
                <option value="page-number">Page 1</option>
                <option value="number-only">1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Font Size</label>
              <select
                value={options.fontSize}
                onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={8}>8 pt (Small)</option>
                <option value={10}>10 pt (Standard)</option>
                <option value={12}>12 pt (Large)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleApply}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Adding Page Numbers ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>Insert Page Numbers</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
