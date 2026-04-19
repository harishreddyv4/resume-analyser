import { NextResponse } from "next/server";
import { isOpenAIConfigured } from "@/lib/analysis/openai-client";
import {
  getAdminNotificationEmails,
  isResendConfigured,
} from "@/lib/email/resend-client";
import { isRazorpayConfigured } from "@/lib/razorpay/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — no secrets. Use after deploy to confirm the Node process sees required env vars.
 * Example: `https://your-domain.com/api/diagnostics/deployment-readiness`
 */
export async function GET() {
  const adminEmails = getAdminNotificationEmails();

  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured(),
    razorpayConfigured: isRazorpayConfigured(),
    openaiConfigured: isOpenAIConfigured(),
    resendConfigured: isResendConfigured(),
    adminNotificationEmailsConfigured: adminEmails.length > 0,
    checks: {
      payments: isSupabaseConfigured() && isRazorpayConfigured(),
      postPaymentAnalysis:
        isSupabaseConfigured() && isOpenAIConfigured(),
      emailsAfterAnalysis:
        isSupabaseConfigured() && isResendConfigured(),
    },
    hint:
      "After payment, the server runs OpenAI analysis, uploads a PDF to Supabase, then emails the user. " +
      "If `openaiConfigured` is false, set OPENAI_API_KEY on the host and redeploy. " +
      "If `resendConfigured` is false, set RESEND_API_KEY and RESEND_FROM_EMAIL. " +
      "Admin alerts need RESUME_ANALYZER_ADMIN_EMAILS as well.",
  });
}
