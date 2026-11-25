import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotationAngle: number;
  colorHex: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0.5;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0.5;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0.5;
  return { r, g, b };
}

export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { r, g, b } = hexToRgb(options.colorHex);

  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    // Center point of page
    const centerX = width / 2;
    const centerY = height / 2;

    page.drawText(options.text, {
      x: centerX - textWidth / 2,
      y: centerY - textHeight / 4,
      size: options.fontSize,
      font,
      color: rgb(r, g, b),
      opacity: options.opacity,
      rotate: degrees(options.rotationAngle),
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
    fileName: `${baseName}-watermarked.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}
