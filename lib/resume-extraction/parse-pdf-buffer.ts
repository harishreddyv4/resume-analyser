import { PDFParse } from "pdf-parse";

/**
 * Plain text from a PDF buffer using `pdf-parse` (pdf.js–based, Node-friendly in v2).
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
