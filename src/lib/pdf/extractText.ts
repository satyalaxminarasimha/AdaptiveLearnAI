import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractText(fileBuffer: Buffer): Promise<string> {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Empty PDF file buffer received.');
  }

  const data = new Uint8Array(fileBuffer);
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    // pdfjs runs in fake-worker mode on server; force-disable worker to avoid worker module resolution.
    disableWorker: true,
  } as any);
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? String(item.str) : ''))
      .join(' ')
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  const fullText = cleanExtractedText(pages.join('\n\n'));

  if (!fullText) {
    throw new Error('No readable text found in the uploaded PDF.');
  }

  return fullText;
}
