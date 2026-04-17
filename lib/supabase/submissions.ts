/**
 * Submission persistence against Supabase (Postgres + Storage).
 * Prefer importing from here to keep call sites stable.
 */
export { RESUME_BUCKET } from "./resume-storage";
export type { SaveSubmissionInput, SubmissionRow } from "./submission-types";
export {
  deleteResumeObject,
  fetchSubmissionById,
  resolveResumePublicUrl,
  saveSubmission,
  uploadSubmissionResume,
} from "./submissions-repository";
