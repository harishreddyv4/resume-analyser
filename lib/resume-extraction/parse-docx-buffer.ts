import mammoth from "mammoth";

/**
 * Raw text from DOCX using Mammoth (focused on clean text, not layout fidelity).
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const messages = result.messages?.filter((m) => m.type === "error") ?? [];
  if (messages.length > 0) {
    throw new Error(
      messages.map((m) => m.message).join("; ") || "DOCX parse error",
    );
  }
  return result.value?.trim() ?? "";
}
