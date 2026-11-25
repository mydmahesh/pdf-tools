import { PDFDocument } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export interface ImagesToPdfOptions {
  pageSize: 'fit' | 'a4';
  orientation: 'auto' | 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'large';
}

const A4_PORTRAIT: [number, number] = [595.28, 841.89];
const A4_LANDSCAPE: [number, number] = [841.89, 595.28];

export async function convertImagesToPdf(
  files: File[],
  options: ImagesToPdfOptions = { pageSize: 'a4', orientation: 'auto', margin: 'small' },
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  if (files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const pdfDoc = await PDFDocument.create();
  let totalOriginalSize = 0;

  const marginValues = {
    none: 0,
    small: 20,
    large: 40,
  };
  const margin = marginValues[options.margin] || 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOriginalSize += file.size;

    const fileBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let image;
    if (isPng) {
      image = await pdfDoc.embedPng(fileBuffer);
    } else {
      // JPEG or convert other formats via canvas
      if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(fileBuffer);
      } else {
        // Fallback: draw image on canvas and export as JPEG
        const imgUrl = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const buf = await (await fetch(dataUrl)).arrayBuffer();
          image = await pdfDoc.embedJpg(buf);
        } else {
          throw new Error('Could not process image');
        }
        URL.revokeObjectURL(imgUrl);
      }
    }

    const imgWidth = image.width;
    const imgHeight = image.height;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'fit') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      // A4
      let useLandscape = false;
      if (options.orientation === 'auto') {
        useLandscape = imgWidth > imgHeight;
      } else if (options.orientation === 'landscape') {
        useLandscape = true;
      }
      [pageWidth, pageHeight] = useLandscape ? A4_LANDSCAPE : A4_PORTRAIT;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate scaled dimensions to fit within margins
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const widthScale = availWidth / imgWidth;
    const heightScale = availHeight / imgHeight;
    const scale = Math.min(widthScale, heightScale, options.pageSize === 'fit' ? 1 : Math.max(widthScale, heightScale));

    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;

    // Center image in the page
    const x = margin + (availWidth - finalWidth) / 2;
    const y = margin + (availHeight - finalHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: finalWidth,
      height: finalHeight,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 90));
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  return {
    blob,
    downloadUrl,
    fileName: 'images-converted.pdf',
    fileSize: blob.size,
    originalSize: totalOriginalSize,
  };
}
