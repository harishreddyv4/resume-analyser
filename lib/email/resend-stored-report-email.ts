import { resumeAnalysisResponseSchema } from "@/lib/analysis/schema";
import { fetchAnalysisReportBySubmissionId } from "@/lib/supabase/analysis-reports-repository";
import { fetchSubmissionById } from "@/lib/supabase/submissions";
import { isResendConfigured } from "./resend-client";
import { sendUserAnalysisCompleteEmail } from "./senders";

/**
 * Re-sends the “report ready” email using JSON already stored in `analysis_reports`.
 * Optional `toEmail` overrides the submission email (e.g. typo correction).
 */
export async function resendStoredUserReportEmail(args: {
  submissionId: string;
  toEmail?: string;
}): Promise<void> {
  if (!isResendConfigured()) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server.",
    );
  }

  const row = await fetchAnalysisReportBySubmissionId(args.submissionId);
  if (!row?.report_json) {
    throw new Error("No saved analysis report found for this submission.");
  }

  const parsed = resumeAnalysisResponseSchema.safeParse(row.report_json);
  if (!parsed.success) {
    throw new Error(
      "Stored report data could not be validated. Regenerate the report or contact support.",
    );
  }

  const submission = await fetchSubmissionById(args.submissionId);
  if (!submission) {
    throw new Error("Submission not found.");
  }

  const to = (args.toEmail ?? submission.email).trim();
  if (!to) {
    throw new Error("No recipient email address.");
  }

  await sendUserAnalysisCompleteEmail({
    submissionId: args.submissionId,
    toEmail: to,
    recipientName: submission.fullName,
    report: parsed.data,
  });
}
