import { NextResponse } from "next/server";
import { isRazorpayConfigured } from "@/lib/razorpay/env";

export const runtime = "nodejs";
/** Must read env at request time on the host, not at build time. */
export const dynamic = "force-dynamic";

/**
 * GET helper: shows whether this Node process sees Razorpay env (no secrets exposed).
 * Open in the browser after setting variables on your host, e.g.
 * `https://your-domain.com/api/payments/razorpay/config-status`
 */
export async function GET() {
  const keyIdPresent = Boolean(process.env.RAZORPAY_KEY_ID?.trim());
  const keySecretPresent = Boolean(process.env.RAZORPAY_KEY_SECRET?.trim());

  return NextResponse.json({
    razorpayConfigured: isRazorpayConfigured(),
    keyIdPresent,
    keySecretPresent,
    hint:
      isRazorpayConfigured()
        ? "Keys are visible to the server process."
        : "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your hosting panel (exact names), save, then restart/redeploy the Node app. Variables in .env on your laptop do not apply to production.",
  });
}
