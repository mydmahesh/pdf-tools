import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { convertScannedPdfToTextPdf, type OcrOptions, type OcrResult } from '../../services/ocrPdfService';
import { getPdfInfo } from '../../services/thumbnailService';
import { ScanText, Loader2, FileText, Check, Copy, Download, Sparkles } from 'lucide-react';

interface OcrPdfViewProps {
  onBackToHome: () => void;
}

export const OcrPdfView: React.FC<OcrPdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [language, setLanguage] = useState<string>('eng');
  const [mode, setMode] = useState<OcrOptions['mode']>('searchable-pdf');
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setOcrResult(null);

    try {
      const info = await getPdfInfo(f);
      setPageCount(info.pageCount);
      setThumbnail(info.thumbnail);
    } catch (e) {
      console.warn('PDF info error', e);
    }
  };

  const handleRunOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusText('Starting OCR engine...');
    setError(null);

    try {
      const res = await convertScannedPdfToTextPdf(
        file,
        { language, mode },
        (p, status) => {
          setProgress(p);
          setStatusText(status);
        }
      );
      setOcrResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to perform OCR on this PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => {
    if (!ocrResult?.extractedText) return;
    navigator.clipboard.writeText(ocrResult.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    if (!ocrResult?.extractedText || !file) return;
    const blob = new Blob([ocrResult.extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-ocr-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (ocrResult) {
    return (
      <div className="space-y-6">
        <SuccessDownload
          result={ocrResult.pdfResult}
          onReset={() => {
            setOcrResult(null);
            setFile(null);
          }}
          onBackToHome={onBackToHome}
        />

        {/* OCR Text Review and Copy Section */}
        {ocrResult.extractedText && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Recognized OCR Text</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyText}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={downloadTextFile}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 mb-2 flex items-center gap-1"
              >
                {showExtractedText ? 'Hide extracted text preview' : 'View extracted text preview'}
              </button>

              {showExtractedText && (
                <textarea
                  readOnly
                  rows={8}
                  value={ocrResult.extractedText}
                  className="w-full font-mono text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select Scanned PDF or Image PDF"
          subtitle="Convert image pages into searchable, copyable text PDF"
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

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Conversion Output
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('searchable-pdf')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  mode === 'searchable-pdf'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    mode === 'searchable-pdf'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {mode === 'searchable-pdf' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-slate-800">Searchable PDF</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Retains exact original scanned visuals, pictures & signatures, but embeds selectable, copyable, and searchable text over it.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('text-pdf')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  mode === 'text-pdf'
                    ? 'border-red-500 bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    mode === 'text-pdf'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {mode === 'text-pdf' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Clean Digital Text PDF</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Replaces scanned images with clean, uniform typed typography on fresh pages.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* OCR Language Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Document Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="eng">English</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="ita">Italian (Italiano)</option>
              <option value="por">Portuguese (Português)</option>
              <option value="hin">Hindi (हिन्दी)</option>
              <option value="chi_sim">Chinese Simplified (简体中文)</option>
              <option value="jpn">Japanese (日本語)</option>
              <option value="rus">Russian (Русский)</option>
              <option value="ara">Arabic (العربية)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Select the primary language appearing in the scanned pages for best recognition accuracy.
            </p>
          </div>

          {/* Progress / Status banner */}
          {isProcessing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{statusText || 'Processing OCR...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Running in-browser WebAssembly OCR. Please keep this tab open.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleRunOcr}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting PDF ({progress}%)...</span>
                </>
              ) : (
                <>
                  <ScanText className="w-5 h-5" />
                  <span>Convert to PDF with Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
