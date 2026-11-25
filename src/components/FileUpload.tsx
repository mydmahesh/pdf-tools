import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  multiple: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple,
  onFilesSelected,
  title = 'Select PDF files',
  subtitle = 'or drop PDF files here',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    if (!multiple && droppedFiles.length > 1) {
      setError('Please select only a single file for this tool.');
      onFilesSelected([droppedFiles[0]]);
      return;
    }

    onFilesSelected(droppedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    onFilesSelected(files);

    // Reset input so re-selecting same file triggers change
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-red-500 bg-red-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-red-400 bg-white hover:bg-slate-50/70 shadow-xs hover:shadow-lg'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 mb-6 ${
              isDragging
                ? 'bg-red-500 text-white'
                : 'bg-red-600 text-white shadow-red-500/25'
            }`}
          >
            {isDragging ? (
              <UploadCloud className="w-10 h-10 animate-bounce" />
            ) : (
              <FileUp className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>

          <button
            type="button"
            className="mt-6 px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40 transition-all pointer-events-none"
          >
            Choose {multiple ? 'Files' : 'File'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
