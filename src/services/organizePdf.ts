import { PDFDocument, degrees } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export interface PageAction {
  originalPageIndex: number; // 0-based
  rotationOffset: number; // 0, 90, 180, 270
}

export async function organizePdfPages(
  file: File,
  pages: PageAction[],
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  if (pages.length === 0) {
    throw new Error('At least one page must be included in the organized PDF.');
  }

  const fileBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < pages.length; i++) {
    const pageAction = pages[i];
    const [copiedPage] = await newPdf.copyPages(srcPdf, [pageAction.originalPageIndex]);

    if (pageAction.rotationOffset !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + pageAction.rotationOffset) % 360));
    }

    newPdf.addPage(copiedPage);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pages.length) * 90));
    }
  }

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob,
    downloadUrl,
    fileName: `${baseName}-organized.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}
