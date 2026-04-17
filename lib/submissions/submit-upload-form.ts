import { createSubmissionResponseSchema } from "@/lib/submissions/create-response-schema";
import { postMultipartFormWithProgress } from "@/lib/submissions/post-multipart-with-progress";
import { appendSubmissionFieldsToFormData } from "@/lib/submissions/submission-form-data";
import { persistUploadDraft } from "@/lib/upload-handoff";
import type { UploadFormValues } from "@/lib/upload-form-schema";
import { validateResumeFile } from "@/lib/uploads";

export type SubmitUploadFormArgs = {
  formValues: UploadFormValues;
  resume: File;
  apiPath?: string;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
};

export type SubmitUploadFormResult =
  | { ok: true; submissionId: string }
  | { ok: false; message: string };

/**
 * Validates the resume, POSTs multipart data with upload progress, parses the JSON response,
 * and persists the upload handoff draft for the submit page.
 */
export async function submitUploadForm(
  args: SubmitUploadFormArgs,
): Promise<SubmitUploadFormResult> {
  const { formValues, resume, onProgress, signal } = args;
  const apiPath = args.apiPath ?? "/api/submissions";

  const fileErr = validateResumeFile(resume);
  if (fileErr) {
    return { ok: false, message: fileErr };
  }

  const fd = new FormData();
  appendSubmissionFieldsToFormData(fd, formValues);
  fd.append("resume", resume);

  onProgress(0);
  const result = await postMultipartFormWithProgress(apiPath, fd, {
    onProgress,
    signal,
  });

  if (result.networkError === true) {
    return {
      ok: false,
      message:
        "We could not reach the server. Check your connection and try again.",
    };
  }

  if (!result.ok) {
    let message = `Something went wrong (HTTP ${result.status}).`;
    try {
      const parsed = JSON.parse(result.bodyText) as { error?: string };
      if (typeof parsed.error === "string" && parsed.error.trim()) {
        message = parsed.error.trim();
      }
    } catch {
      const raw = result.bodyText?.trim() ?? "";
      if (raw.startsWith("<")) {
        message =
          `Server error (HTTP ${result.status}). The host returned HTML instead of JSON — often a timeout, process crash, or body-size limit. Check your hosting logs for POST /api/submissions and raise upload/time limits if needed.`;
      }
    }
    return { ok: false, message };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(result.bodyText) as unknown;
  } catch {
    return {
      ok: false,
      message: "Invalid response from server. Please try again.",
    };
  }

  const parsed = createSubmissionResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid response from server. Please try again.",
    };
  }

  persistUploadDraft({
    submissionId: parsed.data.submissionId,
    fullName: formValues.fullName,
    email: formValues.email,
    fileName: resume.name,
    hasJobDescription: Boolean(formValues.jobDescription?.trim()),
  });

  return { ok: true, submissionId: parsed.data.submissionId };
}
