export type ResumeFileFormat = "pdf" | "docx" | "doc" | "unknown";

const MIME_MAP: Record<string, ResumeFileFormat> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/msword": "doc",
};

export function extensionFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

export function detectResumeFormat(
  fileName: string,
  contentType?: string | null,
): ResumeFileFormat {
  const ext = extensionFromFileName(fileName);
  if (ext === "pdf") {
    return "pdf";
  }
  if (ext === "docx") {
    return "docx";
  }
  if (ext === "doc") {
    return "doc";
  }
  if (contentType) {
    const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    return MIME_MAP[normalized] ?? "unknown";
  }
  return "unknown";
}
