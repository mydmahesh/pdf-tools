import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { convertPdfToText } from '../../services/pdfToText';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { AlignLeft, Download, Copy, Check, Loader2, FileText, ArrowLeft } from 'lucide-react';

interface PdfToTextViewProps {
  onBackToHome: () => void;
}

export const PdfToTextView: React.FC<PdfToTextViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [progress, setProgress] = useState<number | null>(null);
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

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await convertPdfToText(file, (p) => setProgress(p));
      setExtractedText(res.text);
      setResult(res.result);
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
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleExtract}
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
                  <span>Extract Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
