import { PDFDocument } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();
  let totalOriginalSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOriginalSize += file.size;

    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100));
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  return {
    blob,
    downloadUrl,
    fileName: 'merged-document.pdf',
    fileSize: blob.size,
    originalSize: totalOriginalSize,
  };
}
