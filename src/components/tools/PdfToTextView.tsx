import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { convertPdfToText } from '../../services/pdfToText';
import { convertScannedPdfToTextPdf } from '../../services/ocrPdfService';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { AlignLeft, Download, Copy, Check, Loader2, FileText, ArrowLeft, Sparkles, ScanText } from 'lucide-react';

interface PdfToTextViewProps {
  onBackToHome: () => void;
}

export const PdfToTextView: React.FC<PdfToTextViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [useOcr, setUseOcr] = useState<boolean>(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setExtractedText(null);
    setResult(null);

    try {
      const info = await getPdfInfo(f);
      setPageCount(info.pageCount);
      setThumbnail(info.thumbnail);
    } catch (e) {
      console.warn('PDF info error', e);
    }
  };

  const handleExtract = async (forceOcr: boolean = useOcr) => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (forceOcr) {
        setStatusMessage('Initializing OCR engine...');
        const ocrRes = await convertScannedPdfToTextPdf(
          file,
          { language: 'eng', mode: 'text-pdf' },
          (p, status) => {
            setProgress(p);
            setStatusMessage(status);
          }
        );
        setExtractedText(ocrRes.extractedText || 'No text could be recognized from the images.');
        setResult(ocrRes.pdfResult);
      } else {
        const res = await convertPdfToText(file, (p) => setProgress(p));
        setExtractedText(res.text);
        setResult(res.result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!result || !file) return;
    const textBlob = new Blob([extractedText || ''], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const isTextEmpty = extractedText !== null && (!extractedText.trim() || extractedText.replace(/--- PAGE \d+ ---/g, '').trim().length < 5);

  if (extractedText !== null && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Extracted Text Content</h2>
            <p className="text-xs text-slate-500 mt-1">
              Extracted from {file?.name} • {extractedText.length.toLocaleString()} characters
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={downloadTxt}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

        {/* If little or no text found, show OCR prompt */}
        {isTextEmpty && !useOcr && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Scanned Document or Image PDF Detected
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  This document seems to contain images instead of digital text. Run in-browser OCR to recognize text from scanned images!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleExtract(true)}
              disabled={isProcessing}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 shrink-0 transition-colors"
            >
              <ScanText className="w-4 h-4" />
              <span>Run OCR Text Recognition</span>
            </button>
          </div>
        )}

        {/* Text Preview Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <textarea
            readOnly
            value={extractedText}
            rows={16}
            className="w-full font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none resize-y leading-relaxed"
          />

          <div className="mt-4 flex justify-between items-center text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setExtractedText(null);
                  setResult(null);
                }}
                className="text-slate-500 hover:text-red-600 font-semibold"
              >
                Convert Another File
              </button>
              <button
                onClick={onBackToHome}
                className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Tools</span>
              </button>
            </div>

            <span className="text-slate-400">
              {(result.fileSize / 1024).toFixed(1)} KB file size
            </span>
          </div>
        </div>
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
          title="Select PDF file to Extract Text"
          subtitle="Extract all textual data and content from your PDF document"
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

          {/* OCR Checkbox Toggle */}
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={useOcr}
              onChange={(e) => setUseOcr(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 accent-cyan-600 focus:ring-cyan-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Enable OCR Text Recognition
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Check this if your PDF is a scanned document or has images instead of selectable text.
              </p>
            </div>
          </label>

          {isProcessing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{statusMessage || 'Extracting text...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
              onClick={() => handleExtract()}
              className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-cyan-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting Text ({progress}%)...</span>
                </>
              ) : (
                <>
                  <AlignLeft className="w-5 h-5" />
                  <span>{useOcr ? 'Extract with OCR' : 'Extract Text'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

