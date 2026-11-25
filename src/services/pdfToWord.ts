import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';
import { pdfjsLib } from '../utils/pdfWorker';
import type { ProcessResult } from '../types/pdf';

export async function convertPdfToWord(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const docParagraphs: Paragraph[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();

    // Group items into lines based on vertical transform coordinates
    const items = textContent.items as any[];
    if (items.length === 0) continue;

    // Optional page header
    if (numPages > 1) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${i} ---`,
              color: '888888',
              size: 20,
              italics: true,
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
    }

    // Sort items by vertical position descending, then horizontal position ascending
    const sortedItems = [...items].sort((a, b) => {
      const yA = a.transform ? a.transform[5] : 0;
      const yB = b.transform ? b.transform[5] : 0;
      if (Math.abs(yA - yB) > 4) {
        return yB - yA; // descending
      }
      const xA = a.transform ? a.transform[4] : 0;
      const xB = b.transform ? b.transform[4] : 0;
      return xA - xB;
    });

    // Group into lines
    const lines: { y: number; text: string; fontSize: number }[] = [];
    let currentLine: { y: number; text: string; fontSize: number } | null = null;

    for (const item of sortedItems) {
      const text = item.str || '';
      if (!text.trim() && !text.includes(' ')) continue;

      const y = item.transform ? Math.round(item.transform[5]) : 0;
      const fontSize = item.height || 12;

      if (!currentLine || Math.abs(currentLine.y - y) > 4) {
        if (currentLine && currentLine.text.trim()) {
          lines.push(currentLine);
        }
        currentLine = { y, text, fontSize };
      } else {
        currentLine.text += (currentLine.text.endsWith(' ') || text.startsWith(' ') ? '' : ' ') + text;
      }
    }
    if (currentLine && currentLine.text.trim()) {
      lines.push(currentLine);
    }

    // Convert lines to docx paragraphs
    for (const line of lines) {
      const isHeader = line.fontSize > 16;
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.text,
              size: Math.min(36, Math.max(20, Math.round(line.fontSize * 1.8))),
              bold: isHeader,
            }),
          ],
          heading: isHeader ? HeadingLevel.HEADING_2 : undefined,
          spacing: { after: 120 },
        })
      );
    }

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 75));
    }
  }

  if (docParagraphs.length === 0) {
    docParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: 'No extractable text found in this PDF document.' })],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(docxBlob);

  if (onProgress) onProgress(100);

  const baseName = file.name.replace(/\.pdf$/i, '');
  return {
    blob: docxBlob,
    downloadUrl,
    fileName: `${baseName}.docx`,
    fileSize: docxBlob.size,
    originalSize: file.size,
  };
}
