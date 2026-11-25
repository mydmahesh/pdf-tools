import { createWorker } from 'tesseract.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export interface OcrOptions {
  language: string; // 'eng', 'spa', 'fra', 'deu', etc.
  mode: 'searchable-pdf' | 'text-pdf';
}

export interface OcrResult {
  pdfResult: ProcessResult;
  extractedText: string;
  pageCount: number;
}

export async function convertScannedPdfToTextPdf(
  file: File,
  options: OcrOptions = { language: 'eng', mode: 'searchable-pdf' },
  onProgress?: (percent: number, statusText: string) => void
): Promise<OcrResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (onProgress) onProgress(5, 'Initializing OCR engine...');

  // Initialize Tesseract worker
  const worker = await createWorker(options.language, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        // sub progress
      }
    },
  });

  const newPdf = await PDFDocument.create();
  const font = await newPdf.embedFont(StandardFonts.Helvetica);
  let allExtractedText = '';

  try {
    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        const percent = Math.round(10 + ((i - 1) / numPages) * 80);
        onProgress(percent, `Processing page ${i} of ${numPages} with OCR...`);
      }

      const page = await pdfDoc.getPage(i);
      // High resolution scale for accurate OCR
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await (page.render({
        canvasContext: ctx as any,
        viewport: viewport,
      } as any).promise);

      // Run OCR on the page canvas
      const ocrResult = await worker.recognize(canvas);
      const pageText = ocrResult.data.text || '';
      allExtractedText += (numPages > 1 ? `\n--- Page ${i} ---\n` : '') + pageText;

      const origViewport = page.getViewport({ scale: 1.0 });
      const pageWidth = origViewport.width;
      const pageHeight = origViewport.height;

      if (options.mode === 'searchable-pdf') {
        // Embed the scanned image
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const imgBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
        const embeddedImg = await newPdf.embedJpg(imgBytes);

        const newPage = newPdf.addPage([pageWidth, pageHeight]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });

        // Overlay invisible selectable text at word coordinates
        const scaleX = pageWidth / canvas.width;
        const scaleY = pageHeight / canvas.height;

        const words = (ocrResult.data as any).words || [];
        for (const w of words) {
          const rawWord = w.text?.trim();
          if (!rawWord) continue;

          // Replace characters not supported by standard winansi Helvetica
          const sanitizedWord = rawWord.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');

          const boxX = w.bbox.x0 * scaleX;
          const boxY = pageHeight - (w.bbox.y1 * scaleY);
          const boxH = (w.bbox.y1 - w.bbox.y0) * scaleY;
          const fontSize = Math.max(7, Math.min(32, boxH * 0.85));

          try {
            newPage.drawText(sanitizedWord, {
              x: boxX,
              y: Math.max(0, boxY),
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
              opacity: 0.001, // Invisible selectable text layer
            });
          } catch {
            // Skip word if drawing fails
          }
        }
      } else {
        // 'text-pdf' clean digital page layout
        const newPage = newPdf.addPage([pageWidth, pageHeight]);
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;
        const lineHeight = 16;
        const fontSize = 10;

        let y = pageHeight - margin;

        const paragraphs = pageText.split(/\r?\n/);
        for (const para of paragraphs) {
          if (!para.trim()) {
            y -= lineHeight * 0.75;
            continue;
          }

          const words = para.split(/\s+/);
          let currentLine = '';

          for (const word of words) {
            const cleanWord = word.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
            const testLine = currentLine ? `${currentLine} ${cleanWord}` : cleanWord;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > contentWidth && currentLine) {
              if (y < margin + lineHeight) {
                // Next page if text exceeds
                break;
              }
              newPage.drawText(currentLine, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: rgb(0.15, 0.15, 0.15),
              });
              y -= lineHeight;
              currentLine = cleanWord;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine && y >= margin + lineHeight) {
            newPage.drawText(currentLine, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0.15, 0.15, 0.15),
            });
            y -= lineHeight;
          }
        }
      }

      if (onProgress) {
        onProgress(Math.round(10 + (i / numPages) * 80), `Completed page ${i}...`);
      }
    }
  } finally {
    await worker.terminate();
  }

  if (onProgress) onProgress(95, 'Finalizing PDF document...');

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100, 'Complete!');

  const baseName = file.name.replace(/\.pdf$/i, '');
  const suffix = options.mode === 'searchable-pdf' ? '-searchable' : '-text';

  return {
    pdfResult: {
      blob,
      downloadUrl,
      fileName: `${baseName}${suffix}.pdf`,
      fileSize: blob.size,
      originalSize: file.size,
    },
    extractedText: allExtractedText.trim(),
    pageCount: numPages,
  };
}
