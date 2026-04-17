/* eslint-disable @typescript-eslint/no-require-imports */
const WordExtractor = require("word-extractor") as new () => {
  extract(source: string | Buffer): Promise<{ getBody(): string }>;
};

/**
 * Legacy `.doc` (OLE) text via `word-extractor` (accepts `Buffer` directly).
 */
export async function parseDocBuffer(buffer: Buffer): Promise<string> {
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  const body = doc.getBody();
  return body?.trim() ?? "";
}
