import type { PlanId } from "@/lib/plan-ids";

/** Billable / selectable analysis tier (mirrors `PLAN_IDS`). */
export type PricingPlanId = PlanId;

/** Static catalog entry for a tier (amounts align with marketing copy). */
export interface PricingPlan {
  id: PricingPlanId;
  name: string;
  /** Display string shown in UI, e.g. `₹299` */
  priceLabel: string;
  /** Integer INR for payment providers */
  amountInr: number;
}

/**
 * Lifecycle for a resume analysis job.
 * Extend as backend stages are implemented (webhooks, workers, etc.).
 */
export type AnalysisStatus =
  | "draft"
  | "awaiting_payment"
  | "payment_processing"
  | "queued"
  | "processing"
  | "complete"
  | "failed";

/** Mirrors `submissions.payment_status` for client-side checkout rules. */
export type PaymentLifecycleStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed";

/**
 * Canonical persisted shape for a user’s submission.
 * Optional fields are filled as pipeline stages complete.
 */
export interface UserSubmission {
  id: string;
  createdAtIso: string;
  updatedAtIso: string;
  status: AnalysisStatus;
  paymentStatus: PaymentLifecycleStatus;
  fullName: string;
  email: string;
  /** Resolved label sent to analysis (preset label or custom text). */
  targetRole: string;
  rolePreset: string;
  roleCustom?: string;
  jobDescription?: string;
  plan: PricingPlan;
  resumeFileName: string;
  resumeContentType: string;
  resumeSizeBytes: number;
  /** Public resume URL in Supabase Storage (or legacy path-only reference). */
  resumeStorageKey: string | null;
  /** Set after `PaymentAdapter` creates an intent / session. */
  paymentIntentId: string | null;
  /** Set after `DatabaseAdapter` inserts the durable row. */
  databaseRecordId: string | null;
}

/** API success body for POST /api/submissions */
export type CreateSubmissionResponseBody = {
  submissionId: string;
  status: AnalysisStatus;
};

/** API error shape */
export type ApiErrorBody = {
  error: string;
  details?: Record<string, string>;
};
