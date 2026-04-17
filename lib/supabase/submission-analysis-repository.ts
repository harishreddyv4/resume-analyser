import { createAdminClient } from "./admin";
import {
  ANALYSIS_STATUS,
  CLAIMABLE_ANALYSIS_STATUSES,
  PAYMENT_STATUS,
} from "@/lib/submissions/status-constants";
import type { SubmissionRow } from "./submission-types";

export type ClaimPostPaymentAnalysisResult =
  | { status: "claimed"; row: SubmissionRow }
  | { status: "skipped_complete" }
  | { status: "skipped_processing" }
  | { status: "not_paid" }
  | { status: "not_found" };

/**
 * Moves `analysis_status` from `queued` or `failed` → `processing` for paid submissions.
 * Prevents duplicate OpenAI runs when confirm is retried or double-submitted.
 */
export async function claimSubmissionForPostPaymentAnalysis(
  submissionId: string,
): Promise<ClaimPostPaymentAnalysisResult> {
  const admin = createAdminClient();

  const { data: claimed, error } = await admin
    .from("submissions")
    .update({ analysis_status: ANALYSIS_STATUS.PROCESSING })
    .eq("id", submissionId)
    .eq("payment_status", PAYMENT_STATUS.PAID)
    .in("analysis_status", [...CLAIMABLE_ANALYSIS_STATUSES])
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (claimed) {
    return { status: "claimed", row: claimed as SubmissionRow };
  }

  const { data: current, error: readErr } = await admin
    .from("submissions")
    .select("payment_status, analysis_status")
    .eq("id", submissionId)
    .maybeSingle();

  if (readErr) {
    throw new Error(readErr.message);
  }
  if (!current) {
    return { status: "not_found" };
  }
  if (current.payment_status !== PAYMENT_STATUS.PAID) {
    return { status: "not_paid" };
  }
  if (current.analysis_status === ANALYSIS_STATUS.COMPLETE) {
    return { status: "skipped_complete" };
  }
  return { status: "skipped_processing" };
}

export async function markSubmissionAnalysisComplete(
  submissionId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ analysis_status: ANALYSIS_STATUS.COMPLETE })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markSubmissionAnalysisFailedPostPayment(
  submissionId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ analysis_status: ANALYSIS_STATUS.FAILED })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Persists extracted text without changing `analysis_status` (used after payment).
 */
export async function updateSubmissionResumeExtractedTextOnly(
  submissionId: string,
  text: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ resume_extracted_text: text })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}
