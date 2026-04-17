import { analyzeResumeWithOpenAI } from "@/lib/analysis/service";
import { sendUserAnalysisCompleteEmail } from "@/lib/email/senders";
import { isPlanId } from "@/lib/plan-ids";
import { withRetry } from "@/lib/reliability/retry";
import { generateAnalysisReportPdf } from "@/lib/reports/pdf/generate-analysis-report-pdf";
import { extractResumeText } from "@/lib/resume-extraction/extract-resume-text";
import { upsertAnalysisReportForSubmission } from "@/lib/supabase/analysis-reports-repository";
import { uploadAnalysisReportPdf } from "@/lib/supabase/report-pdf-storage";
import { ANALYSIS_STATUS } from "@/lib/submissions/status-constants";
import {
  claimSubmissionForPostPaymentAnalysis,
  markSubmissionAnalysisComplete,
  markSubmissionAnalysisFailedPostPayment,
  updateSubmissionResumeExtractedTextOnly,
} from "@/lib/supabase/submission-analysis-repository";

const ANALYSIS_RETRY_ATTEMPTS = 3;
const PDF_RETRY_ATTEMPTS = 3;
const EMAIL_RETRY_ATTEMPTS = 3;

function logPostPaymentAnalysis(
  level: "info" | "warn" | "error",
  message: string,
  context: Record<string, unknown>,
): void {
  const payload = { message, ...context };
  if (level === "error") {
    console.error("[post-payment-analysis]", payload);
  } else if (level === "warn") {
    console.warn("[post-payment-analysis]", payload);
  } else {
    console.info("[post-payment-analysis]", payload);
  }
}

/**
 * Runs resume extraction (if needed), OpenAI analysis, and persists `analysis_reports`
 * after payment has been confirmed (`payment_status = paid`).
 *
 * Payment success is handled separately; failures here mark `analysis_status = failed`
 * without reversing payment.
 */
export async function runPostPaymentAnalysis(
  submissionId: string,
): Promise<void> {
  const claim = await claimSubmissionForPostPaymentAnalysis(submissionId);

  if (claim.status === "skipped_complete") {
    logPostPaymentAnalysis("info", "skip_already_complete", { submissionId });
    return;
  }
  if (claim.status === "skipped_processing") {
    logPostPaymentAnalysis("info", "skip_processing_or_race", { submissionId });
    return;
  }
  if (claim.status === "not_found") {
    logPostPaymentAnalysis("error", "submission_not_found", { submissionId });
    return;
  }
  if (claim.status === "not_paid") {
    logPostPaymentAnalysis("error", "submission_not_paid", { submissionId });
    return;
  }

  const row = claim.row;

  try {
    let resumeText = row.resume_extracted_text?.trim() ?? "";
    if (!resumeText) {
      try {
        resumeText = (await extractResumeText(row.resume_file_url)).trim();
      } catch (err) {
        logPostPaymentAnalysis("error", "resume_extraction_failed", {
          submissionId,
          detail: err instanceof Error ? err.message : String(err),
        });
        await markSubmissionAnalysisFailedPostPayment(submissionId);
        return;
      }
      if (!resumeText) {
        logPostPaymentAnalysis("error", "resume_text_empty_after_extraction", {
          submissionId,
        });
        await markSubmissionAnalysisFailedPostPayment(submissionId);
        return;
      }
      try {
        await updateSubmissionResumeExtractedTextOnly(submissionId, resumeText);
      } catch (err) {
        logPostPaymentAnalysis("error", "persist_extracted_text_failed", {
          submissionId,
          detail: err instanceof Error ? err.message : String(err),
        });
        await markSubmissionAnalysisFailedPostPayment(submissionId);
        return;
      }
    }

    if (!isPlanId(row.selected_plan)) {
      logPostPaymentAnalysis("error", "invalid_plan_on_submission", {
        submissionId,
        selectedPlan: row.selected_plan,
      });
      await markSubmissionAnalysisFailedPostPayment(submissionId);
      return;
    }
    const planId = row.selected_plan;

    const report = await withRetry({
      label: "analysis_generation",
      attempts: ANALYSIS_RETRY_ATTEMPTS,
      run: async () =>
        await analyzeResumeWithOpenAI({
          planId,
          targetRole: row.target_role,
          resumeText,
          jobDescription: row.job_description ?? undefined,
        }),
      onRetry: ({ attempt, attempts, error }) => {
        logPostPaymentAnalysis("warn", "analysis_retry", {
          submissionId,
          attempt,
          attempts,
          detail: error instanceof Error ? error.message : String(error),
        });
      },
    });

    const uploadedPdf = await withRetry({
      label: "pdf_generation_upload",
      attempts: PDF_RETRY_ATTEMPTS,
      run: async () => {
        const pdfBuffer = await generateAnalysisReportPdf({
          submissionId,
          candidateName: row.full_name,
          targetRole: row.target_role,
          selectedPlan: row.selected_plan,
          report,
        });
        return await uploadAnalysisReportPdf({
          submissionId,
          pdfBuffer,
        });
      },
      onRetry: ({ attempt, attempts, error }) => {
        logPostPaymentAnalysis("warn", "pdf_retry", {
          submissionId,
          attempt,
          attempts,
          detail: error instanceof Error ? error.message : String(error),
        });
      },
    });

    await upsertAnalysisReportForSubmission({
      submissionId,
      report,
      reportPdfUrl: uploadedPdf.publicUrl,
    });
    await markSubmissionAnalysisComplete(submissionId);

    await withRetry({
      label: "user_email_send",
      attempts: EMAIL_RETRY_ATTEMPTS,
      run: async () =>
        await sendUserAnalysisCompleteEmail({
          submissionId,
          toEmail: row.email,
          recipientName: row.full_name,
          report,
        }),
      onRetry: ({ attempt, attempts, error }) => {
        logPostPaymentAnalysis("warn", "user_email_retry", {
          submissionId,
          attempt,
          attempts,
          detail: error instanceof Error ? error.message : String(error),
        });
      },
    }).catch((emailErr) => {
      logPostPaymentAnalysis("error", "user_email_send_failed", {
        submissionId,
        detail: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    });

    logPostPaymentAnalysis("info", "analysis_complete", {
      submissionId,
      overallResumeScore: report.overallResumeScore,
      atsReadinessScore: report.atsReadinessScore,
    });
  } catch (err) {
    logPostPaymentAnalysis("error", "analysis_pipeline_failed", {
      submissionId,
      nextStatus: ANALYSIS_STATUS.FAILED,
      detail: err instanceof Error ? err.message : String(err),
    });
    try {
      await markSubmissionAnalysisFailedPostPayment(submissionId);
    } catch (markErr) {
      logPostPaymentAnalysis("error", "mark_analysis_failed_after_error", {
        submissionId,
        detail: markErr instanceof Error ? markErr.message : String(markErr),
      });
    }
  }
}
