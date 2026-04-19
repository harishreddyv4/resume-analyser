import { isOpenAIConfigured } from "@/lib/analysis/openai-client";
import {
  getAdminNotificationEmails,
  isResendConfigured,
} from "@/lib/email/resend-client";
import { isRazorpayConfigured } from "@/lib/razorpay/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Non-secret snapshot of whether the Node process can run payments, analysis, and email.
 */
export function getServerDeploymentStatusPayload(): Record<string, unknown> {
  const adminEmails = getAdminNotificationEmails();
  const supabaseOk = isSupabaseConfigured();
  const razorpayOk = isRazorpayConfigured();

  return {
    supabaseConfigured: supabaseOk,
    razorpayConfigured: razorpayOk,
    openaiConfigured: isOpenAIConfigured(),
    resendConfigured: isResendConfigured(),
    adminNotificationEmailsConfigured: adminEmails.length > 0,
    checks: {
      payments: supabaseOk && razorpayOk,
      postPaymentAnalysis: supabaseOk && isOpenAIConfigured(),
      emailsAfterAnalysis: supabaseOk && isResendConfigured(),
    },
    hint:
      "After payment, the server runs OpenAI analysis, uploads a PDF to Supabase, then emails the user. " +
      "If `openaiConfigured` is false, set OPENAI_API_KEY on the host and redeploy. " +
      "If `resendConfigured` is false, set RESEND_API_KEY and RESEND_FROM_EMAIL. " +
      "Admin alerts need RESUME_ANALYZER_ADMIN_EMAILS as well.",
  };
}
