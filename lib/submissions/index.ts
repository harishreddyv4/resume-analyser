/**
 * Submission domain: validation, Supabase-backed storage/DB, and service API.
 * Import from `@/lib/submissions` for orchestration; import submodules for tree-shaking.
 */
export type { StagedResume } from "./pipeline";
export {
  initiatePaymentSession,
  persistSubmissionRow,
  stageResumeBinary,
  deleteResumeObject,
} from "./pipeline";
export { postMultipartFormWithProgress } from "./post-multipart-with-progress";
export type { MultipartProgressResult } from "./post-multipart-with-progress";
export { submitUploadForm } from "./submit-upload-form";
export type { SubmitUploadFormArgs, SubmitUploadFormResult } from "./submit-upload-form";
export { getPricingPlan } from "./pricing-catalog";
export { createSubmissionResponseSchema } from "./create-response-schema";
export { multipartSubmissionFieldsSchema } from "./multipart-schema";
export type { MultipartSubmissionFields } from "./multipart-schema";
export { SubmissionValidationError } from "./submission-errors";
export { appendSubmissionFieldsToFormData } from "./submission-form-data";
export type { SubmissionMultipartFields } from "./submission-form-data";
export { parseCreateSubmissionMultipart } from "./parse-create-submission-multipart";
export type { ParsedCreateSubmissionMultipart } from "./parse-create-submission-multipart";
export { createSubmissionErrorResponse } from "./create-submission-error-response";
export {
  createSubmission,
  getSubmission,
} from "./service";
export type { CreateSubmissionInput } from "./service";
