import { createAdminClient } from "./admin";
import type { ResumeAnalysisResponse } from "@/lib/analysis/schema";

export type AnalysisReportRow = {
  submission_id: string;
  report_json: unknown;
  report_pdf_url: string | null;
  summary: string | null;
  created_at: string;
};

function buildReportSummary(report: ResumeAnalysisResponse): string {
  const jd = report.jobMatch;
  const job = jd
    ? ` · Job match ${jd.jobMatchScore}/100`
    : "";
  return `Resume ${report.overallResumeScore}/100 · ATS ${report.atsReadinessScore}/100${job}`;
}

/**
 * Inserts or replaces the structured analysis for a submission (`unique(submission_id)`).
 */
export async function upsertAnalysisReportForSubmission(args: {
  submissionId: string;
  report: ResumeAnalysisResponse;
  reportPdfUrl?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const summary = buildReportSummary(args.report);

  const { error } = await admin.from("analysis_reports").upsert(
    {
      submission_id: args.submissionId,
      report_json: args.report as unknown as Record<string, unknown>,
      report_pdf_url: args.reportPdfUrl ?? null,
      summary,
    },
    { onConflict: "submission_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchAnalysisReportBySubmissionId(
  submissionId: string,
): Promise<AnalysisReportRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("analysis_reports")
    .select("submission_id, report_json, report_pdf_url, summary, created_at")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }
  return data as AnalysisReportRow;
}

export async function updateAnalysisReportPdfUrl(args: {
  submissionId: string;
  reportPdfUrl: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("analysis_reports")
    .update({ report_pdf_url: args.reportPdfUrl })
    .eq("submission_id", args.submissionId);

  if (error) {
    throw new Error(error.message);
  }
}
