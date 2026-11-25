import { pdfjsLib } from '../utils/pdfWorker';

export async function renderPdfPageThumbnail(file: File, pageNumber: number = 1, scale: number = 0.5): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get 2d context for thumbnail canvas');

  // pdfjs-dist render takes canvasContext or canvas
  await (page.render({
    canvasContext: ctx as any,
    viewport: viewport,
  } as any).promise);

  return canvas.toDataURL('image/jpeg', 0.8);
}

export async function getPdfInfo(file: File): Promise<{ pageCount: number; thumbnail: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  let thumbnail = '';
  try {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await (page.render({
        canvasContext: ctx as any,
        viewport: viewport,
      } as any).promise);
      thumbnail = canvas.toDataURL('image/jpeg', 0.8);
    }
  } catch (e) {
    console.warn('Failed to render page thumbnail', e);
  }

  return { pageCount, thumbnail };
}

export async function renderAllPdfPages(file: File, scale: number = 0.4): Promise<{ pageNumber: number; thumbnailUrl: string; rotation: number }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const results: { pageNumber: number; thumbnailUrl: string; rotation: number }[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await (page.render({
        canvasContext: ctx as any,
        viewport: viewport,
      } as any).promise);
      results.push({
        pageNumber: i,
        thumbnailUrl: canvas.toDataURL('image/jpeg', 0.8),
        rotation: 0,
      });
    }
  }

  return results;
}
