import { getPricingPlan } from "@/lib/submissions/pricing-catalog";
import { isPlanId, type PlanId } from "@/lib/plan-ids";
import type { UserSubmission } from "@/types/submission";
import { resumeStoragePathFromStoredValue } from "./resume-storage";
import {
  submissionPaymentStatusFromRow,
  submissionStatusFromRow,
} from "./submission-status";
import type { SubmissionRow } from "./submission-types";

export { submissionStatusFromRow } from "./submission-status";

export function parseResumeFileNameFromStoredRef(pathOrUrl: string): string {
  const normalized = resumeStoragePathFromStoredValue(pathOrUrl);
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] || "resume";
}

export function mapSubmissionRowToUserSubmission(
  row: SubmissionRow,
  resumeFileName: string,
  resumeContentType: string,
  resumeSizeBytes: number,
): UserSubmission {
  const planId: PlanId = isPlanId(row.selected_plan)
    ? row.selected_plan
    : "basic";
  const plan = getPricingPlan(planId);

  return {
    id: row.id,
    createdAtIso: row.created_at,
    updatedAtIso: row.created_at,
    status: submissionStatusFromRow(row),
    paymentStatus: submissionPaymentStatusFromRow(row),
    fullName: row.full_name,
    email: row.email,
    targetRole: row.target_role,
    rolePreset: row.target_role,
    roleCustom: undefined,
    jobDescription: row.job_description ?? undefined,
    plan,
    resumeFileName,
    resumeContentType,
    resumeSizeBytes,
    resumeStorageKey: row.resume_file_url,
    paymentIntentId: null,
    databaseRecordId: row.id,
  };
}
