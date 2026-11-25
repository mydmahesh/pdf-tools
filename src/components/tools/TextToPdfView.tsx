import React, { useState } from 'react';
import { SuccessDownload } from '../SuccessDownload';
import { convertTextToPdf, type TextToPdfOptions } from '../../services/textToPdf';
import type { ProcessResult } from '../../types/pdf';
import { PenTool, Upload, Loader2 } from 'lucide-react';

interface TextToPdfViewProps {
  onBackToHome: () => void;
}

export const TextToPdfView: React.FC<TextToPdfViewProps> = ({ onBackToHome }) => {
  const [text, setText] = useState<string>(
    '# Welcome to PDFCraft\n\nThis is a sample document created directly from plain text.\n\nYou can customize your document title, font size, and line height to generate clean, readable, professional PDF files.\n\nAll generation is processed 100% locally on your computer with complete privacy.'
  );
  const [docTitle, setDocTitle] = useState<string>('My Document');
  const [fontSize, setFontSize] = useState<number>(11);
  const [margin, setMargin] = useState<number>(50);
  const [fileName, setFileName] = useState<string>('document.pdf');
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setText(event.target.result);
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        setFileName(file.name.replace(/\.[^/.]+$/, '') + '.pdf');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text content.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const options: TextToPdfOptions = {
      title: docTitle.trim() || undefined,
      fontSize,
      lineHeight: Math.round(fontSize * 1.5),
      margin,
    };

    try {
      const res = await convertTextToPdf(text, fileName, options, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF from text.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (result) {
    return (
      <SuccessDownload
        result={result}
        onReset={() => setResult(null)}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Text to PDF Converter</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type or paste your text below, or upload a .txt file.
            </p>
          </div>

          <label className="cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import .txt File</span>
            <input
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Document Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Font Size (pt)</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={9}>9 pt (Small / Compact)</option>
              <option value={11}>11 pt (Standard)</option>
              <option value={14}>14 pt (Large)</option>
              <option value={18}>18 pt (Extra Large)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Margins (pt)</label>
            <select
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={30}>Compact (30 pt)</option>
              <option value={50}>Normal (50 pt)</option>
              <option value={70}>Wide (70 pt)</option>
            </select>
          </div>
        </div>

        {/* Text Input Editor */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full font-mono text-sm text-slate-800 bg-white p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner"
            placeholder="Write or paste your text content here..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            disabled={isProcessing}
            onClick={handleGenerate}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating PDF ({progress}%)...</span>
              </>
            ) : (
              <>
                <PenTool className="w-5 h-5" />
                <span>Create PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
