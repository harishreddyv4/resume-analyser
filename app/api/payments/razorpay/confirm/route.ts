import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchSubmissionRowForPayment,
  markSubmissionPaidAndCapturePayment,
  planIdFromSubmissionRow,
} from "@/lib/payments/razorpay-repository";
import { jsonApiError, parseWithZod, readJsonBody } from "@/lib/http";
import { planAmountPaise } from "@/lib/razorpay/plan-amount-paise";
import { isRazorpayConfigured } from "@/lib/razorpay/env";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay/verify-payment-signature";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAYMENT_STATUS } from "@/lib/submissions/status-constants";
import {
  runPostPaymentAnalysisSafely,
  sendAdminPaidSubmissionEmailSafely,
} from "@/lib/payments/post-payment-actions";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !isRazorpayConfigured()) {
    return jsonApiError("Server is not configured for payments.", 503);
  }

  const read = await readJsonBody(request);
  if (!read.ok) {
    return read.response;
  }

  const parsed = parseWithZod(
    read.body,
    bodySchema,
    "Invalid payment confirmation payload.",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  const {
    submissionId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = parsed.data;

  const admin = createAdminClient();

  try {
    const row = await fetchSubmissionRowForPayment(admin, submissionId);
    if (!row) {
      return jsonApiError("Submission not found.", 404);
    }

    if (row.payment_status === PAYMENT_STATUS.PAID) {
      await runPostPaymentAnalysisSafely(submissionId);
      return NextResponse.json({ ok: true as const, alreadyPaid: true as const });
    }

    const ok = verifyRazorpayPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!ok) {
      return jsonApiError("Payment signature could not be verified.", 400);
    }

    const planId = planIdFromSubmissionRow(row);
    const expectedPaise = planAmountPaise(planId);
    const payment = await admin
      .from("payments")
      .select("amount_cents, provider_order_id")
      .eq("provider_order_id", razorpay_order_id)
      .eq("submission_id", submissionId)
      .maybeSingle();

    if (payment.error) {
      throw new Error(payment.error.message);
    }

    const pr = payment.data as {
      amount_cents: number | null;
      provider_order_id: string | null;
    } | null;

    if (!pr?.provider_order_id) {
      return jsonApiError("No matching order for this submission.", 400);
    }

    if (pr.amount_cents != null && pr.amount_cents !== expectedPaise) {
      return jsonApiError("Order amount does not match the selected plan.", 400);
    }

    await markSubmissionPaidAndCapturePayment({
      submissionId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentPayload: {
        razorpay_order_id,
        razorpay_payment_id,
        verified_at: new Date().toISOString(),
      },
    });

    await sendAdminPaidSubmissionEmailSafely(row);
    await runPostPaymentAnalysisSafely(submissionId);

    return NextResponse.json({ ok: true as const });
  } catch (err) {
    console.error(err);
    return jsonApiError(
      "Could not confirm payment. Contact support if you were charged.",
      500,
    );
  }
}
