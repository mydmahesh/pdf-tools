import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { addWatermarkToPdf, type WatermarkOptions } from '../../services/watermarkPdf';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { Stamp, Loader2, FileText } from 'lucide-react';

interface WatermarkPdfViewProps {
  onBackToHome: () => void;
}

export const WatermarkPdfView: React.FC<WatermarkPdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [options, setOptions] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.35,
    rotationAngle: -45,
    colorHex: '#dc2626',
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

  const handleWatermark = async () => {
    if (!file) return;
    if (!options.text.trim()) {
      setError('Please provide watermark text.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await addWatermarkToPdf(file, options, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to add watermark to PDF.');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select PDF file to Watermark"
          subtitle="Stamp text watermark over your PDF pages"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Watermark Configuration</h2>
              <button
                onClick={() => setFile(null)}
                className="text-xs font-semibold text-slate-500 hover:text-red-600"
              >
                Change File
              </button>
            </div>

            {/* Watermark Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={options.text}
                onChange={(e) => setOptions({ ...options, text: e.target.value })}
                placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-2 mt-2">
                {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOptions({ ...options, text: preset })}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rotation Angle */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Rotation Angle</label>
                <select
                  value={options.rotationAngle}
                  onChange={(e) => setOptions({ ...options, rotationAngle: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value={-45}>-45° (Diagonal Upwards)</option>
                  <option value={45}>45° (Diagonal Downwards)</option>
                  <option value={0}>0° (Horizontal)</option>
                  <option value={90}>90° (Vertical)</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.colorHex}
                    onChange={(e) => setOptions({ ...options, colorHex: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-mono text-slate-600">{options.colorHex}</span>
                </div>
              </div>
            </div>

            {/* Sliders: Opacity & Font size */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Opacity</span>
                  <span>{Math.round(options.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={options.opacity}
                  onChange={(e) => setOptions({ ...options, opacity: Number(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Font Size</span>
                  <span>{options.fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="2"
                  value={options.fontSize}
                  onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
                  className="w-full accent-violet-600"
                />
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
                onClick={handleWatermark}
                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-violet-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Applying Watermark ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-5 h-5" />
                    <span>Apply Watermark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Live Preview
            </span>

            <div className="relative aspect-[3/4] w-full max-w-[240px] bg-slate-50 rounded-xl border border-slate-300 shadow-md overflow-hidden flex items-center justify-center select-none">
              {thumbnail ? (
                <img src={thumbnail} alt="preview" className="w-full h-full object-contain opacity-70" />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <FileText className="w-12 h-12" />
                  <span className="text-xs mt-1">Page 1</span>
                </div>
              )}

              {/* Watermark overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${options.rotationAngle}deg)`,
                }}
              >
                <span
                  style={{
                    color: options.colorHex,
                    opacity: options.opacity,
                    fontSize: `${Math.max(14, options.fontSize * 0.4)}px`,
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                  }}
                  className="font-bold text-center uppercase whitespace-nowrap"
                >
                  {options.text || 'WATERMARK'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Applied across all {pageCount} {pageCount === 1 ? 'page' : 'pages'} of your document
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
