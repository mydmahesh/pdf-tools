import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { unlockPdf } from '../../services/unlockPdf';
import type { ProcessResult } from '../../types/pdf';
import { Unlock, Lock, Loader2, FileText } from 'lucide-react';

interface UnlockPdfViewProps {
  onBackToHome: () => void;
}

export const UnlockPdfView: React.FC<UnlockPdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setError(null);
  };

  const handleUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await unlockPdf(file, password, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF. Please check the password.');
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
          setPassword('');
        }}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select Protected PDF to Unlock"
          subtitle="Remove PDF passwords and encryption restrictions securely"
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setPassword('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Change File
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              PDF Password (if required)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password if encrypted..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              If the document is owner-restricted or locked, enter the password to permanently unlock it.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleUnlock}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Unlocking PDF ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Unlock PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
