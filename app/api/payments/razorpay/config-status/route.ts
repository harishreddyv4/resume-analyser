import { NextResponse } from "next/server";
import { getServerDeploymentStatusPayload } from "@/lib/diagnostics/server-deployment-status";
import { isRazorpayConfigured } from "@/lib/razorpay/env";

export const runtime = "nodejs";
/** Must read env at request time on the host, not at build time. */
export const dynamic = "force-dynamic";

/**
 * GET helper: Razorpay key presence plus full deployment checks (same payload as
 * `/api/diagnostics/deployment-readiness`).
 * `https://your-domain.com/api/payments/razorpay/config-status`
 */
export async function GET() {
  const keyIdPresent = Boolean(process.env.RAZORPAY_KEY_ID?.trim());
  const keySecretPresent = Boolean(process.env.RAZORPAY_KEY_SECRET?.trim());
  const razorpayOk = isRazorpayConfigured();

  return NextResponse.json({
    ...getServerDeploymentStatusPayload(),
    keyIdPresent,
    keySecretPresent,
    hint: razorpayOk
      ? "Keys are visible to the server process. After payment, OPENAI_API_KEY runs analysis; RESEND_* sends email."
      : "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your hosting panel (exact names), save, then restart/redeploy the Node app. Variables in .env on your laptop do not apply to production.",
  });
}
