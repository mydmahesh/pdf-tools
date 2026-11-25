import React, { useState } from 'react';
import { FileUpload } from '../FileUpload';
import { convertPdfToImages, type ImageResult } from '../../services/pdfToImages';
import { getPdfInfo } from '../../services/thumbnailService';
import type { ProcessResult } from '../../types/pdf';
import { Image as ImageIcon, Download, Loader2, FileText, Archive, ArrowLeft } from 'lucide-react';

interface PdfToImagesViewProps {
  onBackToHome: () => void;
}

export const PdfToImagesView: React.FC<PdfToImagesViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [dpi, setDpi] = useState<number>(1.5);
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [zipResult, setZipResult] = useState<ProcessResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setImages([]);
    setZipResult(null);

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
      const res = await convertPdfToImages(file, format, dpi, (p) => setProgress(p));
      setImages(res.images);
      setZipResult(res.zipResult);
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleImage = (img: ImageResult) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = img.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadZip = () => {
    if (!zipResult) return;
    const a = document.createElement('a');
    a.href = zipResult.downloadUrl;
    a.download = zipResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (images.length > 0 && zipResult) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Extracted {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Download individual pages or save all images in a compressed ZIP archive.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Tools</span>
            </button>

            <button
              onClick={downloadZip}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-2 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>Download All (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Grid of Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.pageNumber}
              className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="bg-slate-100 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-slate-200/60">
                <img
                  src={img.dataUrl}
                  alt={`Page ${img.pageNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Page {img.pageNumber}</span>
                  <p className="text-[10px] text-slate-400">{(img.blob.size / 1024).toFixed(0)} KB</p>
                </div>

                <button
                  onClick={() => downloadSingleImage(img)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
          title="Select PDF file to Convert to Images"
          subtitle="Extract high-resolution JPG or PNG images from your PDF"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'png'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'jpeg'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  JPEG (Compact)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Resolution Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDpi(1.5)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    dpi === 1.5
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Standard (150 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setDpi(2.5)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    dpi === 2.5
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  High (300 DPI)
                </button>
              </div>
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
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting Pages ({progress}%)...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Convert to Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
