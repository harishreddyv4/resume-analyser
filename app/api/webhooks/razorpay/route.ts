import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getRazorpayWebhookSecret } from "@/lib/razorpay/env";
import {
  markSubmissionPaidAndCapturePayment,
  markSubmissionPaymentFailed,
} from "@/lib/payments/razorpay-repository";
import { runPostPaymentAnalysisSafely } from "@/lib/payments/post-payment-actions";

export const runtime = "nodejs";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        notes?: {
          submission_id?: string;
        };
      };
    };
  };
};

function extractSubmissionId(event: RazorpayWebhookEvent): string | null {
  const submissionId = event.payload?.payment?.entity?.notes?.submission_id;
  return typeof submissionId === "string" && submissionId.trim()
    ? submissionId.trim()
    : null;
}

/**
 * Razorpay webhooks (e.g. `payment.captured`).
 *
 * Production checklist:
 * 1. Set `RAZORPAY_WEBHOOK_SECRET` from the Razorpay Dashboard (Webhooks). On Vercel this
 *    variable must be set or the handler returns 503 (unsigned payloads are never accepted).
 * 2. Point the webhook URL to `https://<your-domain>/api/webhooks/razorpay`.
 * 3. Handle events idempotently — Checkout `POST /api/payments/razorpay/confirm` already
 *    marks most orders paid; use webhooks as a reconciliation / retry path.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const webhookSecret = getRazorpayWebhookSecret();
  const isVercel = Boolean(process.env.VERCEL);

  if (!webhookSecret) {
    if (isVercel) {
      return NextResponse.json(
        {
          error:
            "Webhook signing is not configured. Set RAZORPAY_WEBHOOK_SECRET in the project environment.",
        },
        { status: 503 },
      );
    }
    console.warn(
      "[Razorpay webhook] RAZORPAY_WEBHOOK_SECRET is not set; accepting unsigned payload (local development only).",
    );
  } else {
    const valid = Razorpay.validateWebhookSignature(
      rawBody,
      signature ?? "",
      webhookSecret,
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.info("[Razorpay webhook] received:", event.event ?? "unknown");

  if (event.event === "payment.captured") {
    const submissionId = extractSubmissionId(event);
    const paymentId = event.payload?.payment?.entity?.id;
    const orderId = event.payload?.payment?.entity?.order_id;

    if (!submissionId || !paymentId || !orderId) {
      console.warn("[Razorpay webhook] missing captured payment identifiers", {
        hasSubmissionId: Boolean(submissionId),
        hasPaymentId: Boolean(paymentId),
        hasOrderId: Boolean(orderId),
      });
      return NextResponse.json({ received: true });
    }

    try {
      await markSubmissionPaidAndCapturePayment({
        submissionId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentPayload: event as unknown as Record<string, unknown>,
      });
      await runPostPaymentAnalysisSafely(submissionId);
    } catch (err) {
      console.error("[Razorpay webhook] capture reconcile failed", {
        submissionId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (event.event === "payment.failed") {
    const submissionId = extractSubmissionId(event);
    if (!submissionId) {
      console.warn("[Razorpay webhook] missing submission_id for failed payment");
      return NextResponse.json({ received: true });
    }

    try {
      await markSubmissionPaymentFailed(
        submissionId,
        event as unknown as Record<string, unknown>,
      );
    } catch (err) {
      console.error("[Razorpay webhook] failed-payment reconcile failed", {
        submissionId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ received: true });
}
