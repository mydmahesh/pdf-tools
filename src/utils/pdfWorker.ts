import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export { pdfjsLib };
