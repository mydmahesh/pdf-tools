import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import type { ProcessResult } from '../types/pdf';

export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(maxPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPdfExtractPages(
  file: File,
  pagesToExtract: number[],
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  // 0-indexed page indices
  const pageIndices = pagesToExtract.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  if (onProgress) onProgress(80);

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob,
    downloadUrl,
    fileName: `${baseName}-extracted.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}

export async function splitPdfIntoAllPagesZip(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pageCount = srcPdf.getPageCount();

  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');

  for (let i = 0; i < pageCount; i++) {
    const singlePdf = await PDFDocument.create();
    const [page] = await singlePdf.copyPages(srcPdf, [i]);
    singlePdf.addPage(page);
    const bytes = await singlePdf.save();
    zip.file(`${baseName}-page-${i + 1}.pdf`, bytes);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pageCount) * 90));
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) onProgress(90 + Math.round(metadata.percent / 10));
  });

  const downloadUrl = URL.createObjectURL(zipBlob);

  return {
    blob: zipBlob,
    downloadUrl,
    fileName: `${baseName}-split-pages.zip`,
    fileSize: zipBlob.size,
    originalSize: file.size,
  };
}
