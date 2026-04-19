import { NextResponse } from "next/server";
import { z } from "zod";
import { runPostPaymentAnalysis } from "@/lib/analysis/post-payment/run-post-payment-analysis";
import { isAdminAuthorized } from "@/lib/admin/auth-placeholder";
import { jsonApiError, parseWithZod, readJsonBody } from "@/lib/http";
import { requeuePaidSubmissionIfStuckProcessing } from "@/lib/supabase/submission-analysis-repository";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

/**
 * POST — Re-run post-payment analysis for a **paid** submission (e.g. after fixing env or a transient error).
 * Auth: `x-admin-key` header or `?adminKey=` (same as admin dashboard).
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const queryKey =
    typeof url.searchParams.get("adminKey") === "string"
      ? url.searchParams.get("adminKey")!
      : undefined;

  if (!isAdminAuthorized(request.headers, queryKey)) {
    return jsonApiError("Unauthorized.", 401);
  }

  const read = await readJsonBody(request);
  if (!read.ok) {
    return read.response;
  }

  const parsed = parseWithZod(
    read.body,
    bodySchema,
    "Invalid body (expected { submissionId: UUID }).",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  const { submissionId } = parsed.data;

  try {
    const requeued = await requeuePaidSubmissionIfStuckProcessing(submissionId);
    const result = await runPostPaymentAnalysis(submissionId);
    return NextResponse.json({
      ...result,
      requeuedStuckProcessing: requeued,
    });
  } catch (err) {
    console.error("[retry-post-payment-analysis]", err);
    return jsonApiError(
      err instanceof Error ? err.message : "Retry failed.",
      500,
    );
  }
}
