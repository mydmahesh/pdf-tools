import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { renderAllPdfPages } from '../../services/thumbnailService';
import { organizePdfPages, type PageAction } from '../../services/organizePdf';
import type { ProcessResult } from '../../types/pdf';
import { RotateCw, MoveLeft, MoveRight, Trash2, Loader2 } from 'lucide-react';

interface OrganizePdfViewProps {
  onBackToHome: () => void;
}

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export const OrganizePdfView: React.FC<OrganizePdfViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setLoadingPages(true);

    try {
      const rendered = await renderAllPdfPages(f);
      setPages(
        rendered.map((r, i) => ({
          id: `page-${i}`,
          originalIndex: i,
          thumbnailUrl: r.thumbnailUrl,
          rotation: 0,
        }))
      );
    } catch (err: any) {
      setError('Could not render PDF pages: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingPages(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index].rotation = (copy[index].rotation + 90) % 360;
      return copy;
    });
  };

  const rotateAll = () => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + 90) % 360,
      }))
    );
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setError('A PDF must contain at least one page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const pageActions: PageAction[] = pages.map((p) => ({
      originalPageIndex: p.originalIndex,
      rotationOffset: p.rotation,
    }));

    try {
      const res = await organizePdfPages(file, pageActions, (prog) => setProgress(prog));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to organize PDF pages.');
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
          setPages([]);
        }}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!file ? (
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select PDF file to Organize & Rotate"
          subtitle="Visually sort, rotate, or remove pages from your PDF"
        />
      ) : loadingPages ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Generating page previews...</h3>
          <p className="text-xs text-slate-500 mt-1">Rendering high resolution page previews</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Organize Pages ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rotate individual pages, shift order, or delete unwanted pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateAll}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Grid of Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((p, index) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between group hover:border-amber-400 transition-all"
              >
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-slate-700">Page {index + 1}</span>
                  {p.rotation !== 0 && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                      {p.rotation}°
                    </span>
                  )}
                </div>

                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative">
                  <img
                    src={p.thumbnailUrl}
                    alt={`Page ${index + 1}`}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="w-full h-full object-contain transition-transform duration-200"
                  />
                </div>

                {/* Page Controls */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => movePage(index, 'left')}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move left"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === pages.length - 1}
                      onClick={() => movePage(index, 'right')}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move right"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => rotatePage(index)}
                      className="p-1 rounded text-slate-400 hover:text-amber-600"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePage(index)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 ml-0.5"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing || pages.length === 0}
              onClick={handleSave}
              className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Changes ({progress}%)...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" />
                  <span>Save & Export PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
