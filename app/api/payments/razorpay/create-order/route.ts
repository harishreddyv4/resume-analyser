import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchSubmissionRowForPayment,
  insertPendingRazorpayOrder,
  planIdFromSubmissionRow,
} from "@/lib/payments/razorpay-repository";
import { jsonApiError, parseWithZod, readJsonBody } from "@/lib/http";
import { planAmountPaise } from "@/lib/razorpay/plan-amount-paise";
import { isRazorpayConfigured, requireRazorpayKeyId } from "@/lib/razorpay/env";
import { getRazorpay } from "@/lib/razorpay/server-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonApiError("Server storage is not configured.", 503);
  }
  if (!isRazorpayConfigured()) {
    return jsonApiError(
      "Payments are not configured (missing Razorpay keys).",
      503,
    );
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

    if (row.payment_status === "paid") {
      return NextResponse.json({
        alreadyPaid: true as const,
        submissionId: row.id,
      });
    }

    if (row.payment_status !== "pending" && row.payment_status !== "failed") {
      return jsonApiError("This submission cannot be paid right now.", 409);
    }

    const planId = planIdFromSubmissionRow(row);
    const amountPaise = planAmountPaise(planId);
    const receipt = `sub_${row.id.replace(/-/g, "").slice(0, 32)}`;

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        submission_id: submissionId,
        plan_id: String(planId),
      },
    });

    await insertPendingRazorpayOrder({
      submissionId,
      orderId: order.id,
      amountPaise,
      orderPayload: order,
    });

    return NextResponse.json({
      keyId: requireRazorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      submissionId: row.id,
      customerName: row.full_name,
      customerEmail: row.email,
      planLabel: row.selected_plan,
    });
  } catch (err) {
    console.error(err);
    return jsonApiError(
      "Could not start payment. Please try again in a moment.",
      500,
    );
  }
}
