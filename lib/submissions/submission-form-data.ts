/**
 * Shared field names for `POST /api/submissions` (multipart body).
 * Compatible with `UploadFormValues` and `MultipartSubmissionFields`.
 */
export type SubmissionMultipartFields = {
  fullName: string;
  email: string;
  rolePreset: string;
  roleCustom?: string | null;
  jobDescription?: string | null;
  plan: string;
};

export function appendSubmissionFieldsToFormData(
  fd: FormData,
  fields: SubmissionMultipartFields,
): void {
  fd.append("fullName", fields.fullName);
  fd.append("email", fields.email);
  fd.append("rolePreset", fields.rolePreset);
  fd.append("roleCustom", fields.roleCustom ?? "");
  fd.append("jobDescription", fields.jobDescription ?? "");
  fd.append("plan", fields.plan);
}
