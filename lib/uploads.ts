export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/** `accept` attribute for file inputs (PDF / Word). */
export const resumeAcceptAttribute =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const allowedMime = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

/**
 * Client- and server-side validation for resume uploads (PDF / Word only).
 */
export function validateResumeFile(file: File): string | null {
  if (file.size === 0) {
    return "That file is empty. Choose a different file.";
  }

  if (file.size > MAX_RESUME_BYTES) {
    return "That file is larger than 10 MB. Try compressing the PDF or trimming embedded images.";
  }

  const ext = fileExtension(file.name);
  if (!allowedExtensions.has(ext)) {
    return "Please upload a PDF or Word document (.pdf, .doc, .docx).";
  }

  if (file.type !== "" && !allowedMime.has(file.type)) {
    return "This file type does not match a PDF or Word document. Use .pdf, .doc, or .docx.";
  }

  return null;
}
