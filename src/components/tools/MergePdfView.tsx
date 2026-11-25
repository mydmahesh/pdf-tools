import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { mergePdfFiles } from '../../services/mergePdf';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult, UploadedFile } from '../../types/pdf';
import { MoveUp, MoveDown, Trash2, Plus, Combine, Loader2 } from 'lucide-react';

interface MergePdfViewProps {
  onBackToHome: () => void;
}

export const MergePdfView: React.FC<MergePdfViewProps> = ({ onBackToHome }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setError(null);
    const addedList: UploadedFile[] = [];

    for (const f of newFiles) {
      const id = Math.random().toString(36).substring(2, 9);
      let pageCount: number | undefined;
      let previewUrl: string | undefined;

      try {
        const info = await getPdfInfo(f);
        pageCount = info.pageCount;
        previewUrl = info.thumbnail;
      } catch (e) {
        console.warn('Could not extract PDF info', e);
      }

      addedList.push({
        id,
        file: f,
        name: f.name,
        size: f.size,
        pageCount,
        previewUrl,
      });
    }

    setFiles((prev) => [...prev, ...addedList]);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await mergePdfFiles(rawFiles, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to merge PDF files.');
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
          setFiles([]);
        }}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {files.length === 0 ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Select PDF files to Merge"
          subtitle="Combine multiple PDFs in your desired order"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Merge PDFs ({files.length} {files.length === 1 ? 'file' : 'files'})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder files by moving them up or down. Merged PDF will follow this sequence.
              </p>
            </div>

            <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add more files</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {/* Files Grid / List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-red-400 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail / Page preview */}
                  <div className="w-16 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">PDF</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.pageCount ? `${item.pageCount} pages • ` : ''}
                      {(item.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                {/* Actions: Move Up, Move Down, Delete */}
                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-100">
                  <button
                    disabled={index === 0}
                    onClick={() => moveFile(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === files.length - 1}
                    onClick={() => moveFile(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Merge Trigger Button */}
          <div className="flex justify-end pt-4">
            <button
              disabled={isProcessing || files.length < 2}
              onClick={handleMerge}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merging PDFs ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Combine className="w-5 h-5" />
                  <span>Merge PDF ({files.length} files)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
