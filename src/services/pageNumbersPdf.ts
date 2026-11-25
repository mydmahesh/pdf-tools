import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'page-of-total' | 'number-only' | 'page-number';
  fontSize: number;
  margin: number;
}

export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const totalPages = pdfDoc.getPageCount();

  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageNum = i + 1;
    const { width, height } = page.getSize();

    let text = `${pageNum}`;
    if (options.format === 'page-of-total') {
      text = `Page ${pageNum} of ${totalPages}`;
    } else if (options.format === 'page-number') {
      text = `Page ${pageNum}`;
    }

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x = 0;
    let y = 0;

    // Horizontal position
    if (options.position.includes('center')) {
      x = (width - textWidth) / 2;
    } else if (options.position.includes('right')) {
      x = width - options.margin - textWidth;
    } else {
      // left
      x = options.margin;
    }

    // Vertical position
    if (options.position.startsWith('top')) {
      y = height - options.margin - textHeight;
    } else {
      // bottom
      y = options.margin;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pages.length) * 90));
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob,
    downloadUrl,
    fileName: `${baseName}-numbered.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}
