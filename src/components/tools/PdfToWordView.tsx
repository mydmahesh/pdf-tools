import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { convertPdfToWord } from '../../services/pdfToWord';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { FileText, Loader2, Sparkles } from 'lucide-react';

interface PdfToWordViewProps {
  onBackToHome: () => void;
}

export const PdfToWordView: React.FC<PdfToWordViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
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

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await convertPdfToWord(file, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to Word document.');
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
          title="Select PDF file to Convert to Word"
          subtitle="Convert PDF documents into editable Microsoft Word (.docx) files"
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

          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">High Fidelity Text & Layout Extraction</p>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                Extracts headings, paragraphs, and reading order directly into a standard Microsoft Word .docx file format.
              </p>
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
              onClick={handleConvert}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting to DOCX ({progress}%)...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Convert to Word (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
