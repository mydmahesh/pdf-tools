import { PDFDocument } from 'pdf-lib';
import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export async function unlockPdf(
  file: File,
  password?: string,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Test loading with pdfjs using provided password
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    password: password || '',
  });

  let pdfDoc;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err.name === 'PasswordException') {
      throw new Error('Invalid or missing password for this protected PDF.');
    }
    throw err;
  }

  // Render pages to canvas and reconstruct an unrestricted PDF
  const numPages = pdfDoc.numPages;
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context failed');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render({
      canvasContext: ctx as any,
      viewport: viewport,
    } as any).promise);

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const imgBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
    const embeddedImg = await newPdf.embedJpg(imgBytes);

    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 90));
    }
  }

  const unlockedBytes = await newPdf.save();
  const blob = new Blob([unlockedBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob,
    downloadUrl,
    fileName: `${baseName}-unlocked.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
  };
}
