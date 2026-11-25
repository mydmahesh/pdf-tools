import JSZip from 'jszip';
import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export interface ImageResult {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  fileName: string;
}

export async function convertPdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  dpiScale: number = 1.5,
  onProgress?: (progress: number) => void
): Promise<{ images: ImageResult[]; zipResult: ProcessResult }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const images: ImageResult[] = [];
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context failed');

    // Fill white background for JPEG
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await (page.render({
      canvasContext: ctx as any,
      viewport: viewport,
    } as any).promise);

    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    const imgBlob = await (await fetch(dataUrl)).blob();
    const fileName = `${baseName}_page_${i}.${ext}`;

    images.push({
      pageNumber: i,
      dataUrl,
      blob: imgBlob,
      fileName,
    });

    zip.file(fileName, imgBlob);

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 85));
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) onProgress(85 + Math.round(metadata.percent * 0.15));
  });

  const downloadUrl = URL.createObjectURL(zipBlob);

  return {
    images,
    zipResult: {
      blob: zipBlob,
      downloadUrl,
      fileName: `${baseName}_images.zip`,
      fileSize: zipBlob.size,
      originalSize: file.size,
    },
  };
}
