import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { compressPdf, type CompressionLevel } from '../../services/compressPdf';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { Minimize2, Check, Loader2, FileText, Zap } from 'lucide-react';

interface CompressPdfViewProps {
  onBackToHome: () => void;
}

export const CompressPdfView: React.FC<CompressPdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [level, setLevel] = useState<CompressionLevel>('recommended');
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

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await compressPdf(file, level, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compress PDF.');
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
          title="Select PDF file to Compress"
          subtitle="Reduce PDF file size while maintaining maximal quality"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Compression Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLevel('extreme')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  level === 'extreme'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Extreme
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      level === 'extreme'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {level === 'extreme' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Less quality, highest compression. Ideal for quick sharing and email.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLevel('recommended')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  level === 'recommended'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Recommended
                    </span>
                    <Zap className="w-3 h-3 text-green-600 fill-green-600" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      level === 'recommended'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {level === 'recommended' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Good quality, good compression. Best balance for standard documents.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLevel('low')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  level === 'low'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Less Compression
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      level === 'low'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {level === 'low' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  High quality, light compression. Preserves sharp images & vectors.
                </p>
              </button>
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
              onClick={handleCompress}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compressing PDF ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" />
                  <span>Compress PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
