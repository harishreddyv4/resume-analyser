import pdfParse from "pdf-parse";

/**
 * Plain text from a PDF buffer using `pdf-parse` v1.x (Node-friendly; no pdfjs DOM/canvas).
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return (data.text ?? "").trim();
}
