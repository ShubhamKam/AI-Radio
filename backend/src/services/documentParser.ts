import { readFile } from 'fs/promises';
import path from 'path';

export async function extractTextFromDocument(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  try {
    switch (ext) {
      case '.txt':
        return extractFromTxt(filePath);
      case '.pdf':
        return extractFromPdf(filePath);
      case '.docx':
        return extractFromDocx(filePath);
      case '.pptx':
        return extractFromPptx(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
}

async function extractFromTxt(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8');
  return content;
}

async function extractFromPdf(filePath: string): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return 'Failed to extract PDF content';
  }
}

async function extractFromDocx(filePath: string): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return 'Failed to extract DOCX content';
  }
}

async function extractFromPptx(filePath: string): Promise<string> {
  try {
    // PPTX is a zip file containing XML
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(filePath);
    const slideEntries = zip.getEntries().filter((entry) =>
      entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')
    );

    let text = '';
    for (const entry of slideEntries) {
      const content = entry.getData().toString('utf-8');
      // Extract text from XML (simplified)
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      const slideText = textMatches
        .map((match) => match.replace(/<\/?a:t>/g, ''))
        .join(' ');
      text += slideText + '\n\n';
    }

    return text.trim() || 'No text content found in presentation';
  } catch (error) {
    console.error('PPTX parsing error:', error);
    return 'Failed to extract PPTX content';
  }
}
