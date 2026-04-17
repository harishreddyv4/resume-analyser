import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";
import {
  ANALYSIS_STATUS,
  PAYMENT_STATUS,
} from "@/lib/submissions/status-constants";
import type { SubmissionRow } from "./submission-types";

function paymentLifecycleFromRow(raw: string): PaymentLifecycleStatus {
  if (
    raw === PAYMENT_STATUS.PENDING ||
    raw === PAYMENT_STATUS.PROCESSING ||
    raw === PAYMENT_STATUS.PAID ||
    raw === PAYMENT_STATUS.FAILED
  ) {
    return raw;
  }
  return PAYMENT_STATUS.PENDING;
}

export function submissionStatusFromRow(row: SubmissionRow): AnalysisStatus {
  const payment = row.payment_status;
  const analysis = row.analysis_status;

  if (payment === PAYMENT_STATUS.PENDING) {
    if (analysis === ANALYSIS_STATUS.FAILED) {
      return "failed";
    }
    return "awaiting_payment";
  }
  if (payment === PAYMENT_STATUS.PROCESSING) {
    return "payment_processing";
  }
  if (payment === PAYMENT_STATUS.FAILED) {
    return "failed";
  }
  if (payment !== PAYMENT_STATUS.PAID) {
    return "awaiting_payment";
  }

  switch (analysis) {
    case ANALYSIS_STATUS.DRAFT:
      return "draft";
    case ANALYSIS_STATUS.QUEUED:
      return "queued";
    case ANALYSIS_STATUS.PROCESSING:
      return "processing";
    case ANALYSIS_STATUS.COMPLETE:
      return "complete";
    case ANALYSIS_STATUS.FAILED:
      return "failed";
    default:
      return "queued";
  }
}

export function submissionPaymentStatusFromRow(
  row: SubmissionRow,
): PaymentLifecycleStatus {
  return paymentLifecycleFromRow(row.payment_status);
}
