import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchSubmissionRowForPayment,
  markSubmissionPaidAndCapturePayment,
} from "@/lib/payments/razorpay-repository";
import { jsonApiError, parseWithZod, readJsonBody } from "@/lib/http";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAYMENT_STATUS } from "@/lib/submissions/status-constants";
import {
  runPostPaymentAnalysisSafely,
  sendAdminPaidSubmissionEmailSafely,
} from "@/lib/payments/post-payment-actions";
import { isRazorpayDevSkipPaymentAllowed } from "@/lib/razorpay/dev-skip-payment";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!isRazorpayDevSkipPaymentAllowed()) {
    return new NextResponse(null, { status: 404 });
  }

  if (!isSupabaseConfigured()) {
    return jsonApiError("Server storage is not configured.", 503);
  }

  const read = await readJsonBody(request);
  if (!read.ok) {
    return read.response;
  }

  const parsed = parseWithZod(
    read.body,
    bodySchema,
    "Invalid submission id.",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  const { submissionId } = parsed.data;
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

    if (
      row.payment_status !== PAYMENT_STATUS.PENDING &&
      row.payment_status !== PAYMENT_STATUS.FAILED
    ) {
      return jsonApiError("This submission cannot skip checkout right now.", 409);
    }

    const devOrderId = `dev_skip_order_${submissionId}`;
    const devPaymentId = `dev_skip_pay_${submissionId}`;

    await markSubmissionPaidAndCapturePayment({
      submissionId,
      razorpayOrderId: devOrderId,
      razorpayPaymentId: devPaymentId,
      paymentPayload: {
        dev_skip_payment: true,
        at: new Date().toISOString(),
      },
    });

    await sendAdminPaidSubmissionEmailSafely(row);
    await runPostPaymentAnalysisSafely(submissionId);

    return NextResponse.json({ ok: true as const });
  } catch (err) {
    console.error("[dev-skip-payment]", err);
    return jsonApiError("Could not apply dev skip. Check server logs.", 500);
  }
}
