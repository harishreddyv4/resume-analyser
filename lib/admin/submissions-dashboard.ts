import { createAdminClient } from "@/lib/supabase/admin";
import {
  ANALYSIS_STATUS,
  PAYMENT_STATUS,
  PENDING_ANALYSIS_STATUSES,
} from "@/lib/submissions/status-constants";

export type BillingFilter = "all" | "paid" | "unpaid";
export type AnalysisFilter = "all" | "pending" | "completed" | "failed";
export type PlanFilter = "all" | "basic" | "pro" | "job-match";

export type AdminSubmissionListItem = {
  id: string;
  full_name: string;
  email: string;
  selected_plan: string;
  payment_status: string;
  analysis_status: string;
  created_at: string;
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
  return (data ?? []) as AdminSubmissionListItem[];
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

  return {
    submission: submissionData as AdminSubmissionDetail,
    report: (reportData as AdminAnalysisReportInfo | null) ?? null,
  };
}
