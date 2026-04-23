import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/http";
import { SUPABASE_SETUP_REQUIRED_MESSAGE } from "@/lib/supabase/config-messages";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSubmission } from "@/lib/submissions/service";
import type { UserSubmission } from "@/types/submission";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return jsonApiError(SUPABASE_SETUP_REQUIRED_MESSAGE, 503);
  }

  const { submissionId: id } = await context.params;
  try {
    const submission = await getSubmission(id);
    if (!submission) {
      return jsonApiError("Not found.", 404);
    }
    return NextResponse.json<UserSubmission>(submission, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error(err);
    return jsonApiError("Could not load submission.", 500);
  }
}
