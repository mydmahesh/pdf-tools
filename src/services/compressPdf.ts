import { PDFDocument } from 'pdf-lib';
import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export type CompressionLevel = 'extreme' | 'recommended' | 'low';

export async function compressPdf(
  file: File,
  level: CompressionLevel = 'recommended',
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Settings based on compression level
  let scale = 1.2;
  let quality = 0.72;

  if (level === 'extreme') {
    scale = 0.95;
    quality = 0.55;
  } else if (level === 'low') {
    scale = 1.5;
    quality = 0.85;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Failed to create canvas context');

    await (page.render({
      canvasContext: ctx as any,
      viewport: viewport,
    } as any).promise);

    // Convert page canvas to compressed JPEG
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const jpegImageBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());
    const embeddedImage = await newPdf.embedJpg(jpegImageBytes);

    // Add page with original viewport dimensions (point size = viewport at scale 1)
    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 95));
    }
  }

  const compressedBytes = await newPdf.save({ useObjectStreams: true });
  const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob,
    downloadUrl,
    fileName: `${baseName}-compressed.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}
