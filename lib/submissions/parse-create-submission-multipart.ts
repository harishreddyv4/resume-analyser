import { multipartSubmissionFieldsSchema } from "@/lib/submissions/multipart-schema";
import type { MultipartSubmissionFields } from "@/lib/submissions/multipart-schema";
import type { ApiErrorBody } from "@/types/submission";

export type ParsedCreateSubmissionMultipart =
  | { ok: true; resume: File; fields: MultipartSubmissionFields }
  | { ok: false; status: number; body: ApiErrorBody };

function formDataString(fd: FormData, key: string): string {
  const v = fd.get(key);
  if (v == null) {
    return "";
  }
  return typeof v === "string" ? v : "";
}

/**
 * Reads and validates a multipart create-submission request.
 */
export async function parseCreateSubmissionMultipart(
  request: Request,
): Promise<ParsedCreateSubmissionMultipart> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return {
      ok: false,
      status: 415,
      body: { error: "Expected multipart/form-data." },
    };
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return {
      ok: false,
      status: 400,
      body: { error: "Could not read form data." },
    };
  }

  const resume = fd.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return {
      ok: false,
      status: 400,
      body: { error: "Resume file is required." },
    };
  }

  const fields = {
    fullName: formDataString(fd, "fullName"),
    email: formDataString(fd, "email"),
    rolePreset: formDataString(fd, "rolePreset"),
    roleCustom: formDataString(fd, "roleCustom") || undefined,
    jobDescription: formDataString(fd, "jobDescription") || undefined,
    plan: formDataString(fd, "plan"),
  };

  const parsed = multipartSubmissionFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    const flat: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "form";
      flat[path] = issue.message;
    }
    return {
      ok: false,
      status: 400,
      body: { error: "Validation failed.", details: flat },
    };
  }

  return { ok: true, resume, fields: parsed.data };
}
