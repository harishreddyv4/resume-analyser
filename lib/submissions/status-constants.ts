export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  PAID: "paid",
  FAILED: "failed",
} as const;

export const ANALYSIS_STATUS = {
  DRAFT: "draft",
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETE: "complete",
  FAILED: "failed",
} as const;

export const CLAIMABLE_ANALYSIS_STATUSES = [
  ANALYSIS_STATUS.QUEUED,
  ANALYSIS_STATUS.FAILED,
] as const;

export const PENDING_ANALYSIS_STATUSES = [
  ANALYSIS_STATUS.DRAFT,
  ANALYSIS_STATUS.QUEUED,
  ANALYSIS_STATUS.PROCESSING,
] as const;
