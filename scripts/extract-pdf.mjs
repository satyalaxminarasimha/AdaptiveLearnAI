import { readFileSync, writeFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const files = [
  { path: 'c:/Users/chand/Downloads/20-21-CSM-SYLLABUS.pdf', out: 'c:/Users/chand/Downloads/csm-syllabus-text.txt' },
  { path: 'c:/Users/chand/Downloads/cse_aiml_r20_aut_sys_y2.pdf', out: 'c:/Users/chand/Downloads/cse-aiml-y2-text.txt' },
];

for (const f of files) {
  try {
    const data = new Uint8Array(readFileSync(f.path));
    const doc = await getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += `\n--- PAGE ${i} ---\n${pageText}\n`;
    }
    writeFileSync(f.out, text);
    console.log(`${f.path}: ${doc.numPages} pages, ${text.length} chars`);
  } catch (e) {
    console.error(`Error with ${f.path}:`, e.message);
  }
}
