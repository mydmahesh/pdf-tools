import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export async function convertPdfToText(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ text: string; result: ProcessResult }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // Sort items by Y descending, then X ascending
    const sorted = [...items].sort((a, b) => {
      const yA = a.transform ? a.transform[5] : 0;
      const yB = b.transform ? b.transform[5] : 0;
      if (Math.abs(yA - yB) > 4) return yB - yA;
      const xA = a.transform ? a.transform[4] : 0;
      const xB = b.transform ? b.transform[4] : 0;
      return xA - xB;
    });

    let pageText = '';
    let lastY: number | null = null;

    for (const item of sorted) {
      const y = item.transform ? Math.round(item.transform[5]) : 0;
      const str = item.str || '';

      if (lastY === null) {
        pageText += str;
      } else if (Math.abs(lastY - y) > 4) {
        pageText += '\n' + str;
      } else {
        pageText += (pageText.endsWith(' ') || str.startsWith(' ') ? '' : ' ') + str;
      }
      lastY = y;
    }

    if (numPages > 1) {
      fullText += `--- PAGE ${i} ---\n\n` + pageText.trim() + '\n\n';
    } else {
      fullText += pageText.trim() + '\n';
    }

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 90));
    }
  }

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    text: fullText,
    result: {
      blob,
      downloadUrl,
      fileName: `${baseName}.txt`,
      fileSize: blob.size,
      originalSize: file.size,
    },
  };
}
