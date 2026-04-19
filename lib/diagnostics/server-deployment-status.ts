import { isResumeAnalysisLlmConfigured } from "@/lib/analysis/openai-client";
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

  const groqKey = Boolean(process.env.GROQ_API_KEY?.trim());
  const openaiKey = Boolean(process.env.OPENAI_API_KEY?.trim());

  return {
    supabaseConfigured: supabaseOk,
    razorpayConfigured: razorpayOk,
    /** True if Groq or OpenAI key is set (used for resume analysis). */
    resumeAnalysisLlmConfigured: isResumeAnalysisLlmConfigured(),
    groqApiKeyPresent: groqKey,
    openaiApiKeyPresent: openaiKey,
    /** Prefer Groq when GROQ_API_KEY is set. */
    resumeAnalysisProvider: groqKey ? "groq" : openaiKey ? "openai" : "none",
    /** @deprecated Use resumeAnalysisLlmConfigured */
    openaiConfigured: isResumeAnalysisLlmConfigured(),
    resendConfigured: isResendConfigured(),
    adminNotificationEmailsConfigured: adminEmails.length > 0,
    checks: {
      payments: supabaseOk && razorpayOk,
      postPaymentAnalysis: supabaseOk && isResumeAnalysisLlmConfigured(),
      emailsAfterAnalysis: supabaseOk && isResendConfigured(),
    },
    hint:
      "After payment, the server runs LLM analysis (Groq if GROQ_API_KEY is set, else OpenAI), uploads a PDF to Supabase, then emails the user. " +
      "If `resumeAnalysisLlmConfigured` is false, set GROQ_API_KEY or OPENAI_API_KEY on the host and redeploy. " +
      "If `resendConfigured` is false, set RESEND_API_KEY and RESEND_FROM_EMAIL. " +
      "Admin alerts need RESUME_ANALYZER_ADMIN_EMAILS as well.",
  };
}
