import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ProcessResult } from '../types/pdf';

export interface TextToPdfOptions {
  title?: string;
  fontSize: number;
  lineHeight: number;
  margin: number;
}

export async function convertTextToPdf(
  text: string,
  fileName: string = 'document.pdf',
  options: TextToPdfOptions = { fontSize: 11, lineHeight: 16, margin: 50 },
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = options.margin;
  const contentWidth = pageWidth - margin * 2;

  // Split text into lines, handling word wrapping
  const rawParagraphs = text.split(/\r?\n/);
  const wrappedLines: { text: string; isTitle?: boolean }[] = [];

  if (options.title) {
    wrappedLines.push({ text: options.title, isTitle: true });
    wrappedLines.push({ text: '' }); // spacer
  }

  for (const para of rawParagraphs) {
    if (para.trim() === '') {
      wrappedLines.push({ text: '' });
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, options.fontSize);

      if (textWidth > contentWidth && currentLine) {
        wrappedLines.push({ text: currentLine });
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      wrappedLines.push({ text: currentLine });
    }
  }

  // Draw lines onto pages
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (let i = 0; i < wrappedLines.length; i++) {
    const item = wrappedLines[i];

    if (y < margin + options.lineHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (item.isTitle) {
      currentPage.drawText(item.text, {
        x: margin,
        y: y - 10,
        size: options.fontSize + 8,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= options.lineHeight * 2;
    } else if (item.text) {
      currentPage.drawText(item.text, {
        x: margin,
        y,
        size: options.fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= options.lineHeight;
    } else {
      y -= options.lineHeight * 0.75;
    }

    if (onProgress && i % 20 === 0) {
      onProgress(Math.min(90, Math.round((i / wrappedLines.length) * 90)));
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const cleanName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  return {
    blob,
    downloadUrl,
    fileName: cleanName,
    fileSize: blob.size,
    originalSize: text.length,
  };
}
