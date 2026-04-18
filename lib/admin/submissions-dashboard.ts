import { createAdminClient } from "@/lib/supabase/admin";
import {
  ANALYSIS_STATUS,
  PAYMENT_STATUS,
  PENDING_ANALYSIS_STATUSES,
} from "@/lib/submissions/status-constants";

export type BillingFilter = "all" | "paid" | "unpaid";
export type AnalysisFilter = "all" | "pending" | "completed" | "failed";
export type PlanFilter = "all" | "basic" | "pro" | "job-match";

export type AdminPaymentRow = {
  provider_order_id: string | null;
  provider_payment_id: string | null;
  record_status: string;
};

export type AdminSubmissionListItem = {
  id: string;
  full_name: string;
  email: string;
  selected_plan: string;
  payment_status: string;
  analysis_status: string;
  created_at: string;
  /** Latest Razorpay order / payment on file (when payment was created or captured). */
  payment: AdminPaymentRow | null;
};

export type AdminSubmissionDetail = AdminSubmissionListItem & {
  target_role: string;
  job_description: string | null;
  resume_file_url: string;
};

export type AdminAnalysisReportInfo = {
  summary: string | null;
  report_pdf_url: string | null;
  created_at: string;
};

const paymentSelect =
  "submission_id, provider_order_id, provider_payment_id, status, created_at" as const;

/**
 * Picks the latest payment row per submission (by `created_at`).
 */
function paymentInfoMapFromRows(
  rows: Array<{
    submission_id: string;
    provider_order_id: string | null;
    provider_payment_id: string | null;
    status: string;
    created_at: string;
  }>,
): Map<string, AdminPaymentRow> {
  const bySub = new Map<string, (typeof rows)[0]>();
  for (const row of rows) {
    const prev = bySub.get(row.submission_id);
    if (
      !prev ||
      new Date(row.created_at).getTime() > new Date(prev.created_at).getTime()
    ) {
      bySub.set(row.submission_id, row);
    }
  }
  const out = new Map<string, AdminPaymentRow>();
  bySub.forEach((r, id) => {
    out.set(id, {
      provider_order_id: r.provider_order_id,
      provider_payment_id: r.provider_payment_id,
      record_status: r.status,
    });
  });
  return out;
}

async function fetchPaymentInfoForSubmissions(
  submissionIds: string[],
): Promise<Map<string, AdminPaymentRow>> {
  if (submissionIds.length === 0) {
    return new Map();
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payments")
    .select(paymentSelect)
    .in("submission_id", submissionIds);

  if (error) {
    throw new Error(error.message);
  }
  return paymentInfoMapFromRows(
    (data ?? []) as Array<{
      submission_id: string;
      provider_order_id: string | null;
      provider_payment_id: string | null;
      status: string;
      created_at: string;
    }>,
  );
}

export async function fetchAdminSubmissions(args: {
  billing: BillingFilter;
  analysis: AnalysisFilter;
  plan: PlanFilter;
}): Promise<AdminSubmissionListItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("submissions")
    .select(
      "id, full_name, email, selected_plan, payment_status, analysis_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(250);

  if (args.billing === "paid") {
    query = query.eq("payment_status", PAYMENT_STATUS.PAID);
  } else if (args.billing === "unpaid") {
    query = query.in("payment_status", [
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.PROCESSING,
      PAYMENT_STATUS.FAILED,
    ]);
  }

  if (args.analysis === "completed") {
    query = query.eq("analysis_status", ANALYSIS_STATUS.COMPLETE);
  } else if (args.analysis === "failed") {
    query = query.eq("analysis_status", ANALYSIS_STATUS.FAILED);
  } else if (args.analysis === "pending") {
    query = query.in("analysis_status", [...PENDING_ANALYSIS_STATUSES]);
  }

  if (args.plan !== "all") {
    query = query.eq("selected_plan", args.plan);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  const rows = (data ?? []) as Omit<AdminSubmissionListItem, "payment">[];
  const payMap = await fetchPaymentInfoForSubmissions(rows.map((r) => r.id));
  return rows.map((r) => ({
    ...r,
    payment: payMap.get(r.id) ?? null,
  }));
}

export async function fetchAdminSubmissionDetail(
  submissionId: string,
): Promise<{
  submission: AdminSubmissionDetail | null;
  report: AdminAnalysisReportInfo | null;
}> {
  const admin = createAdminClient();
  const { data: submissionData, error: submissionError } = await admin
    .from("submissions")
    .select(
      "id, full_name, email, selected_plan, payment_status, analysis_status, created_at, target_role, job_description, resume_file_url",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    throw new Error(submissionError.message);
  }
  if (!submissionData) {
    return { submission: null, report: null };
  }

  const { data: reportData, error: reportError } = await admin
    .from("analysis_reports")
    .select("summary, report_pdf_url, created_at")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (reportError) {
    throw new Error(reportError.message);
  }

  const payMap = await fetchPaymentInfoForSubmissions([submissionId]);
  const payment = payMap.get(submissionId) ?? null;

  return {
    submission: {
      ...(submissionData as AdminSubmissionDetail),
      payment,
    },
    report: (reportData as AdminAnalysisReportInfo | null) ?? null,
  };
}
