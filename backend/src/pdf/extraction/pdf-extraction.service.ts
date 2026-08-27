import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import pdfParse from 'pdf-parse';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  characterCount: number;
}

export interface ExtractionResult {
  text: string;
  pages: ExtractedPage[];
  pageCount: number;
  characterCount: number;
  extractionDurationMs: number;
}

export interface ExtractionError {
  success: false;
  error: string;
  code: 'FILE_NOT_FOUND' | 'CORRUPTED_PDF' | 'NO_TEXT' | 'EXTRACTION_FAILED' | 'INVALID_PATH';
}

export type ExtractionOutcome = ExtractionResult | ExtractionError;

const EXTRACTION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NO_TEXT: 'NO_TEXT',
} as const;

export type ExtractionStatus = (typeof EXTRACTION_STATUS)[keyof typeof EXTRACTION_STATUS];

/**
 * Fallback stream-level extractor for PDFs where pdf-parse encounters xref/flate format issues
 */
function fallbackExtractPdfText(buf: Buffer): string {
  const content = buf.toString('latin1');
  const textBlocks: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(content)) !== null) {
    let decomp = '';
    const raw = Buffer.from(match[1], 'latin1');
    try { decomp = zlib.inflateSync(raw).toString('latin1'); } catch {}
    if (!decomp) {
      try { decomp = zlib.inflateRawSync(raw).toString('latin1'); } catch {}
    }
    if (!decomp) {
      decomp = raw.toString('latin1');
    }

    const btRegex = /BT[\s\S]*?ET/g;
    let btMatch;
    while ((btMatch = btRegex.exec(decomp)) !== null) {
      const block = btMatch[0];
      // Match hex strings: <48656C6C6F>
      const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|\'|\"|TJ)/g;
      let hMatch;
      while ((hMatch = hexRegex.exec(block)) !== null) {
        try {
          const decoded = Buffer.from(hMatch[1], 'hex').toString('utf-8');
          if (decoded && decoded.trim().length > 0) {
            textBlocks.push(decoded);
          }
        } catch {}
      }
      // Match literal strings: (Hello World) Tj
      const litRegex = /\(([^)]+)\)\s*(?:Tj|\'|\"|TJ)/g;
      let lMatch;
      while ((lMatch = litRegex.exec(block)) !== null) {
        if (lMatch[1] && lMatch[1].trim().length > 0) {
          textBlocks.push(lMatch[1]);
        }
      }
    }
  }

  return textBlocks.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Validates that the file path is within the allowed storage directory
 * to prevent path traversal attacks.
 */
function validateFilePath(filePath: string, allowedBaseDir: string): boolean {
  const resolvedFilePath = path.resolve(filePath);
  const resolvedBaseDir = path.resolve(allowedBaseDir);
  
  // Ensure the file path is within the allowed base directory
  return resolvedFilePath.startsWith(resolvedBaseDir);
}

/**
 * Cleans and normalizes extracted text.
 * Removes excessive whitespace, normalizes line endings, etc.
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\r/g, '\n')             // Handle old Mac line endings
    .replace(/\t/g, ' ')              // Replace tabs with spaces
    .replace(/[ \f\v]+/g, ' ')        // Collapse multiple spaces/form feeds
    .replace(/\n{3,}/g, '\n\n')       // Collapse excessive newlines to double
    .trim();                          // Trim leading/trailing whitespace
}

/**
 * Extracts text from a PDF file page by page.
 * 
 * @param filePath - Absolute path to the PDF file
 * @param allowedBaseDir - Base directory that filePath must be within (security)
 * @returns ExtractionResult with text, pages array, and metadata
 */
export async function extractPdfText(
  filePath: string,
  allowedBaseDir: string
): Promise<ExtractionOutcome> {
  const startTime = Date.now();

  try {
    // Security: Validate file path is within allowed directory
    if (!validateFilePath(filePath, allowedBaseDir)) {
      return {
        success: false,
        error: 'Invalid file path: path traversal attempt detected',
        code: 'INVALID_PATH',
      };
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'PDF file not found on disk',
        code: 'FILE_NOT_FOUND',
      };
    }

    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return {
        success: false,
        error: 'Path is not a file',
        code: 'INVALID_PATH',
      };
    }

    // Check file size (optional safety check)
    if (stats.size === 0) {
      return {
        success: false,
        error: 'PDF file is empty',
        code: 'CORRUPTED_PDF',
      };
    }

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Extract text using pdf-parse with fallback
    let rawText = '';
    let pageCount = 1;

    try {
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } catch (parseError) {
      console.log(`[PDF Extraction] pdf-parse warning: ${(parseError as Error).message}. Trying stream fallback...`);
      rawText = fallbackExtractPdfText(dataBuffer);
    }

    if (!rawText || rawText.trim().length === 0) {
      rawText = fallbackExtractPdfText(dataBuffer);
    }

    const cleanedText = cleanText(rawText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      return {
        success: false,
        error: 'No extractable text found in PDF',
        code: 'NO_TEXT',
      };
    }


    // Extract page-by-page text
    // Note: pdf-parse doesn't natively provide page-by-page text easily
    // We'll use the numpages and try to split, or use a different approach
    const pages: ExtractedPage[] = [];


    // For pdf-parse, we get the full text. We can attempt to split by page
    // but it's not always reliable. We'll create a single page entry for now
    // with the full text, or try to split if possible.
    
    // Try to extract page-by-page using pdf-parse's page rendering
    // pdf-parse returns text for all pages combined by default
    // We'll create one page entry per detected page with the full text
    // (This is a limitation of pdf-parse; for true page-by-page, pdfjs-dist would be needed)
    
    // Simple approach: split text by form feed character which pdf-parse sometimes uses
    const pageTexts = cleanedText.split(/\f/).filter(t => t.trim().length > 0);
    
    if (pageTexts.length === pageCount && pageCount > 1) {
      // Good match - we have page-by-page text
      pageTexts.forEach((pageText, index) => {
        const cleaned = cleanText(pageText);
        pages.push({
          pageNumber: index + 1,
          text: cleaned,
          characterCount: cleaned.length,
        });
      });
    } else {
      // Fallback: single entry with all text, or distribute evenly
      if (pageCount === 1) {
        pages.push({
          pageNumber: 1,
          text: cleanedText,
          characterCount: cleanedText.length,
        });
      } else {
        // Distribute text across pages as best effort
        const charsPerPage = Math.ceil(cleanedText.length / pageCount);
        for (let i = 0; i < pageCount; i++) {
          const start = i * charsPerPage;
          const end = Math.min(start + charsPerPage, cleanedText.length);
          const pageText = cleanedText.slice(start, end);
          pages.push({
            pageNumber: i + 1,
            text: pageText,
            characterCount: pageText.length,
          });
        }
      }
    }

    const extractionDurationMs = Date.now() - startTime;

    return {
      text: cleanedText,
      pages,
      pageCount,
      characterCount: cleanedText.length,
      extractionDurationMs,
    };
  } catch (error) {
    return {
      success: false,
      error: `Extraction failed: ${(error as Error).message}`,
      code: 'EXTRACTION_FAILED',
    };
  }
}

export { EXTRACTION_STATUS };