import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlanId, type PlanId } from "@/lib/plan-ids";
import { PAYMENT_STATUS } from "@/lib/submissions/status-constants";
import type { SubmissionRow } from "@/lib/supabase/submission-types";

export type PaymentRow = {
  id: string;
  submission_id: string;
  provider: string;
  provider_payment_id: string | null;
  provider_order_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: string;
  raw_payload: unknown;
  created_at: string;
};

export async function fetchSubmissionRowForPayment(
  admin: SupabaseClient,
  submissionId: string,
): Promise<SubmissionRow | null> {
  const { data, error } = await admin
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data as SubmissionRow | null;
}

export async function insertPendingRazorpayOrder(args: {
  submissionId: string;
  orderId: string;
  amountPaise: number;
  orderPayload: unknown;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("payments").insert({
    submission_id: args.submissionId,
    provider: "razorpay",
    provider_order_id: args.orderId,
    provider_payment_id: null,
    amount_cents: args.amountPaise,
    currency: "inr",
    status: "order_created",
    raw_payload: args.orderPayload as object,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function markSubmissionPaidAndCapturePayment(args: {
  submissionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentPayload?: unknown;
}): Promise<void> {
  const admin = createAdminClient();

  const { error: subErr } = await admin
    .from("submissions")
    .update({ payment_status: PAYMENT_STATUS.PAID })
    .eq("id", args.submissionId);

  if (subErr) {
    throw new Error(subErr.message);
  }

  const { data: existing, error: findErr } = await admin
    .from("payments")
    .select("id")
    .eq("provider_order_id", args.razorpayOrderId)
    .maybeSingle();

  if (findErr) {
    throw new Error(findErr.message);
  }

  const patch = {
    provider_payment_id: args.razorpayPaymentId,
    status: "captured",
    raw_payload: args.paymentPayload as object | undefined,
  };

  if (existing?.id) {
    const { error: upErr } = await admin
      .from("payments")
      .update(patch)
      .eq("id", existing.id);
    if (upErr) {
      throw new Error(upErr.message);
    }
  } else {
    const { error: insErr } = await admin.from("payments").insert({
      submission_id: args.submissionId,
      provider: "razorpay",
      provider_order_id: args.razorpayOrderId,
      provider_payment_id: args.razorpayPaymentId,
      amount_cents: null,
      currency: "inr",
      status: "captured",
      raw_payload: args.paymentPayload as object | undefined,
    });
    if (insErr) {
      throw new Error(insErr.message);
    }
  }
}

export async function markSubmissionPaymentFailed(
  submissionId: string,
  payload?: unknown,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ payment_status: PAYMENT_STATUS.FAILED })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  if (payload !== undefined) {
    await admin.from("payments").insert({
      submission_id: submissionId,
      provider: "razorpay",
      status: "failed",
      currency: "inr",
      raw_payload: payload as object,
    });
  }
}

export function planIdFromSubmissionRow(row: SubmissionRow): PlanId {
  if (!isPlanId(row.selected_plan)) {
    throw new Error(`Invalid plan on submission: ${row.selected_plan}`);
  }
  return row.selected_plan;
}
