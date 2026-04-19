import { runPostPaymentAnalysis } from "@/lib/analysis/post-payment/run-post-payment-analysis";
import { sendAdminPaidSubmissionEmail } from "@/lib/email/senders";
import { withRetry } from "@/lib/reliability/retry";
import type { SubmissionRow } from "@/lib/supabase/submission-types";

function logPostPaymentActionError(
  action: string,
  submissionId: string,
  err: unknown,
): void {
  console.error(`[razorpay/confirm] ${action} error`, {
    submissionId,
    message: err instanceof Error ? err.message : String(err),
  });
}

export async function runPostPaymentAnalysisSafely(
  submissionId: string,
): Promise<void> {
  try {
    const result = await runPostPaymentAnalysis(submissionId);
    if (!result.ok) {
      console.error(`[razorpay/confirm] post-payment analysis finished with error`, {
        submissionId,
        stage: result.stage,
        error: result.error,
      });
    }
  } catch (err) {
    logPostPaymentActionError("post-payment analysis", submissionId, err);
  }
}

export async function sendAdminPaidSubmissionEmailSafely(
  row: Pick<SubmissionRow, "id" | "full_name" | "email" | "selected_plan" | "target_role">,
): Promise<void> {
  try {
    await withRetry({
      label: "admin_paid_email_send",
      attempts: 3,
      run: async () =>
        await sendAdminPaidSubmissionEmail({
          submissionId: row.id,
          candidateName: row.full_name,
          candidateEmail: row.email,
          selectedPlan: row.selected_plan,
          targetRole: row.target_role,
        }),
      onRetry: ({ attempt, attempts, error }) => {
        console.warn("[razorpay/confirm] admin paid email retry", {
          submissionId: row.id,
          attempt,
          attempts,
          message: error instanceof Error ? error.message : String(error),
        });
      },
    });
  } catch (err) {
    logPostPaymentActionError("admin paid email", row.id, err);
  }
}
