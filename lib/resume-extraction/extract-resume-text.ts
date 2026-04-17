import { detectResumeFormat } from "./detect-resume-format";
import { fetchResumeFileBuffer } from "./fetch-resume-buffer";
import { parseDocBuffer } from "./parse-doc-buffer";
import { parseDocxBuffer } from "./parse-docx-buffer";
import { parsePdfBuffer } from "./parse-pdf-buffer";

/**
 * Downloads a resume from `fileUrl` (HTTPS public URL or Supabase object path)
 * and returns normalized plain text.
 */
export async function extractResumeText(fileUrl: string): Promise<string> {
  const { buffer, fileName } = await fetchResumeFileBuffer(fileUrl);
  const format = detectResumeFormat(fileName);

  switch (format) {
    case "pdf":
      return await parsePdfBuffer(buffer);
    case "docx":
      return await parseDocxBuffer(buffer);
    case "doc":
      return await parseDocBuffer(buffer);
    default:
      throw new Error(
        `Unsupported or unknown resume format (file: "${fileName}").`,
      );
  }
}
