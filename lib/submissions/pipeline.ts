import type { UserSubmission } from "@/types/submission";
import {
  deleteResumeObject,
  saveSubmission,
  uploadSubmissionResume,
} from "@/lib/supabase/submissions";

export type StagedResume = {
  /** Storage path used for cleanup if the DB insert fails. */
  objectPath: string;
  /** Public URL stored on the submission row. */
  publicUrl: string;
};

/**
 * Persists resume bytes to Supabase Storage (`resumes` bucket).
 */
export async function stageResumeBinary(args: {
  submissionId: string;
  file: File;
}): Promise<StagedResume> {
  const uploaded = await uploadSubmissionResume({
    submissionId: args.submissionId,
    file: args.file,
  });
  return {
    objectPath: uploaded.objectPath,
    publicUrl: uploaded.publicUrl,
  };
}

/**
 * Inserts the durable submission row in Postgres (via Supabase service role).
 */
export async function persistSubmissionRow(args: {
  submission: UserSubmission;
}): Promise<UserSubmission> {
  const submission = args.submission;
  if (!submission.resumeStorageKey) {
    throw new Error("persistSubmissionRow requires resumeStorageKey.");
  }

  return saveSubmission({
    id: submission.id,
    fullName: submission.fullName,
    email: submission.email,
    resumeFileUrl: submission.resumeStorageKey,
    targetRole: submission.targetRole,
    jobDescription: submission.jobDescription,
    selectedPlanId: submission.plan.id,
    resumeFileName: submission.resumeFileName,
    resumeContentType: submission.resumeContentType,
    resumeSizeBytes: submission.resumeSizeBytes,
  });
}

export { deleteResumeObject };

/**
 * Legacy hook — checkout uses `POST /api/payments/razorpay/create-order` from the submit page.
 */
export async function initiatePaymentSession(args: {
  submissionId: string;
  amountInr: number;
}): Promise<{ paymentIntentId: string }> {
  void args;
  throw new Error(
    "initiatePaymentSession is deprecated. Use the Razorpay create-order API from the client.",
  );
}
