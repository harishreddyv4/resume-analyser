import {
  resumeAnalysisResponseSchema,
  type ResumeAnalysisResponse,
} from "@/lib/analysis/schema";
import { generateAnalysisReportPdf } from "@/lib/reports/pdf/generate-analysis-report-pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchAnalysisReportBySubmissionId,
  updateAnalysisReportPdfUrl,
} from "@/lib/supabase/analysis-reports-repository";
import { uploadAnalysisReportPdf } from "@/lib/supabase/report-pdf-storage";
import type { AnalysisStatus } from "@/types/submission";

export type SubmissionReportPageData = {
  submissionId: string;
  candidateName: string;
  targetRole: string;
  selectedPlan: string;
  analysisStatus: AnalysisStatus | string;
  reportCreatedAtIso: string | null;
  reportSummary: string | null;
  reportPdfUrl: string | null;
  report: ResumeAnalysisResponse | null;
};

export async function fetchSubmissionReportPageData(
  submissionId: string,
): Promise<SubmissionReportPageData | null> {
  const admin = createAdminClient();

  const { data: submission, error: submissionErr } = await admin
    .from("submissions")
    .select("id, full_name, target_role, selected_plan, analysis_status")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionErr) {
    throw new Error(submissionErr.message);
  }
  if (!submission) {
    return null;
  }

  const reportRow = await fetchAnalysisReportBySubmissionId(submissionId);
  const parsedReport = reportRow
    ? resumeAnalysisResponseSchema.safeParse(reportRow.report_json)
    : null;
  let reportPdfUrl = reportRow?.report_pdf_url ?? null;
  const report = parsedReport?.success ? parsedReport.data : null;

  if (!reportPdfUrl && report) {
    try {
      const pdfBuffer = await generateAnalysisReportPdf({
        submissionId: submission.id as string,
        candidateName: (submission.full_name as string) ?? "Candidate",
        targetRole: (submission.target_role as string) ?? "Not specified",
        selectedPlan: (submission.selected_plan as string) ?? "unknown",
        report,
      });
      const uploaded = await uploadAnalysisReportPdf({
        submissionId: submission.id as string,
        pdfBuffer,
      });
      await updateAnalysisReportPdfUrl({
        submissionId: submission.id as string,
        reportPdfUrl: uploaded.publicUrl,
      });
      reportPdfUrl = uploaded.publicUrl;
    } catch (err) {
      console.error("[report-page] pdf ensure failed", {
        submissionId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    submissionId: submission.id as string,
    candidateName: (submission.full_name as string) ?? "Candidate",
    targetRole: (submission.target_role as string) ?? "Not specified",
    selectedPlan: (submission.selected_plan as string) ?? "unknown",
    analysisStatus: (submission.analysis_status as string) ?? "queued",
    reportCreatedAtIso: reportRow?.created_at ?? null,
    reportSummary: reportRow?.summary ?? null,
    reportPdfUrl,
    report,
  };
}
