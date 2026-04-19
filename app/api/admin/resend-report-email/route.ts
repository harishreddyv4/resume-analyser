import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthorized } from "@/lib/admin/auth-placeholder";
import { jsonApiError, parseWithZod, readJsonBody } from "@/lib/http";
import { resendStoredUserReportEmail } from "@/lib/email/resend-stored-report-email";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
  /** Optional — defaults to email on file for the submission. */
  toEmail: z.string().email().optional(),
});

/**
 * POST — Re-send “Your report is ready” using stored `analysis_reports` JSON.
 * Auth: `x-admin-key` or `?adminKey=` (same as other admin routes).
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
    "Invalid body (expected { submissionId: UUID, toEmail?: string }).",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    await resendStoredUserReportEmail(parsed.data);
    return NextResponse.json({ ok: true as const });
  } catch (err) {
    console.error("[resend-report-email]", err);
    return jsonApiError(
      err instanceof Error ? err.message : "Could not send email.",
      400,
    );
  }
}
