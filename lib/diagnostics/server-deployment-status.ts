import {
  getActiveResumeAnalysisProvider,
  getResumeAnalysisProviderPreference,
  isResumeAnalysisLlmConfigured,
} from "@/lib/analysis/openai-client";
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
  const pref = getResumeAnalysisProviderPreference();
  const active = getActiveResumeAnalysisProvider();

  let resumeAnalysisProviderNote: string | undefined;
  if (pref === "groq" && !groqKey) {
    resumeAnalysisProviderNote =
      "RESUME_ANALYSIS_PROVIDER=groq but GROQ_API_KEY is missing — add the key and restart.";
  } else if (active === "openai" && openaiKey && !groqKey) {
    resumeAnalysisProviderNote =
      "Using OpenAI because GROQ_API_KEY is not set in this server process. To use Groq: add GROQ_API_KEY (exact name) in hosting env, save, restart. If both keys exist, Groq is used unless RESUME_ANALYSIS_PROVIDER=openai.";
  }

  return {
    supabaseConfigured: supabaseOk,
    razorpayConfigured: razorpayOk,
    /** True if Groq or OpenAI key is set (used for resume analysis). */
    resumeAnalysisLlmConfigured: isResumeAnalysisLlmConfigured(),
    groqApiKeyPresent: groqKey,
    openaiApiKeyPresent: openaiKey,
    /** Env preference: auto (default) | groq | openai. */
    resumeAnalysisProviderPreference: pref,
    /** Actual backend in use (matches `getOpenAIClient()`). */
    resumeAnalysisProvider: active,
    resumeAnalysisProviderNote,
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
      "After payment, the server runs LLM analysis (`resumeAnalysisProvider`: groq when GROQ_API_KEY is set and not forced to OpenAI). " +
      "If `resumeAnalysisLlmConfigured` is false, set GROQ_API_KEY or OPENAI_API_KEY on the host and redeploy. " +
      "If `resendConfigured` is false, set RESEND_API_KEY and RESEND_FROM_EMAIL. " +
      "Admin alerts need RESUME_ANALYZER_ADMIN_EMAILS as well.",
  };
}
