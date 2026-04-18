import mammoth from 'mammoth';

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*\/tr\s*>/gi, '\n')
    .replace(/<\s*\/?td\s*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ');
}

export async function extractDocxText(fileBuffer: Buffer): Promise<string> {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Empty DOCX file buffer received.');
  }

  const [rawResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer: fileBuffer }),
    mammoth.convertToHtml({ buffer: fileBuffer }),
  ]);

  const rawText = cleanExtractedText(rawResult.value || '');
  const htmlText = cleanExtractedText(stripHtml(htmlResult.value || ''));

  const finalText = htmlText.length > rawText.length ? htmlText : rawText;

  if (!finalText) {
    throw new Error('No readable text found in uploaded DOCX.');
  }

  return finalText;
}
