import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { splitPdfExtractPages, splitPdfIntoAllPagesZip, parsePageRanges } from '../../services/splitPdf';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { Scissors, Loader2, FileText, Check } from 'lucide-react';

interface SplitPdfViewProps {
  onBackToHome: () => void;
}

export const SplitPdfView: React.FC<SplitPdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1-2');
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
      setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : '1');
    } catch (e) {
      console.warn('PDF info error', e);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (splitMode === 'all') {
        const res = await splitPdfIntoAllPagesZip(file, (p) => setProgress(p));
        setResult(res);
      } else {
        const pages = parsePageRanges(rangeInput, pageCount);
        if (pages.length === 0) {
          throw new Error('Please enter a valid page range (e.g. 1-3, 5).');
        }
        const res = await splitPdfExtractPages(file, pages, (p) => setProgress(p));
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to split PDF.');
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

  return (
    <div className="max-w-3xl mx-auto">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select PDF file to Split"
          subtitle="Separate one page or page ranges into independent PDF files"
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* File summary */}
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

          {/* Split Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Split Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('range')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  splitMode === 'range'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    splitMode === 'range'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {splitMode === 'range' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Extract by Range</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Extract custom page numbers or ranges (e.g. 1-3, 5)
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  splitMode === 'all'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    splitMode === 'all'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {splitMode === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Extract All Pages</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save every page as a single PDF inside a ZIP file
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Range input if range mode */}
          {splitMode === 'range' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pages to Extract (Total {pageCount} pages)
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Example: <code>1-3, 5</code> will extract pages 1, 2, 3 and 5 into a new PDF.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Trigger button */}
          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleSplit}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Splitting PDF ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>Split PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
