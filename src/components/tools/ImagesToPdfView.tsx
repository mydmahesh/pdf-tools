import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { SuccessDownload } from '../SuccessDownload';
import { convertImagesToPdf, type ImagesToPdfOptions } from '../../services/imagesToPdf';
import type { ProcessResult } from '../../types/pdf';
import { Images, MoveUp, MoveDown, Trash2, Plus, Loader2 } from 'lucide-react';

interface ImagesToPdfViewProps {
  onBackToHome: () => void;
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImagesToPdfView: React.FC<ImagesToPdfViewProps> = ({ onBackToHome }) => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [options, setOptions] = useState<ImagesToPdfOptions>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 'small',
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setError(null);
    const newItems: ImageItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const rawFiles = items.map((i) => i.file);
      const res = await convertImagesToPdf(rawFiles, options, (p) => setProgress(p));
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to convert images to PDF.');
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
          setItems([]);
        }}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {items.length === 0 ? (
        <FileUpload
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Select Images to Convert to PDF"
          subtitle="Combine JPG, PNG, and WebP images into a PDF"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Images to PDF ({items.length} {items.length === 1 ? 'image' : 'images'})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder your images to arrange the PDF page sequence.
              </p>
            </div>

            <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add more images</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {/* Options Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Page Size</label>
              <select
                value={options.pageSize}
                onChange={(e) => setOptions({ ...options, pageSize: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="a4">Standard A4</option>
                <option value="fit">Fit to Image Dimensions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Orientation</label>
              <select
                value={options.orientation}
                onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="auto">Auto (Detect per image)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Page Margins</label>
              <select
                value={options.margin}
                onChange={(e) => setOptions({ ...options, margin: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="small">Small Margin (20pt)</option>
                <option value="none">No Margin (Full Bleed)</option>
                <option value="large">Large Margin (40pt)</option>
              </select>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-red-400 transition-all"
              >
                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 relative">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 truncate mt-2">
                  {item.file.name}
                </p>

                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                  <button
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move left/up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move right/down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

          <div className="flex justify-end pt-2">
            <button
              disabled={isProcessing}
              onClick={handleConvert}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating PDF ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Images className="w-5 h-5" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
