import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types/submission";

/** Standard JSON error body for App Router handlers. */
export function jsonApiError(
  error: string,
  status: number,
  details?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  if (details && Object.keys(details).length > 0) {
    return NextResponse.json({ error, details }, { status });
  }
  return NextResponse.json({ error }, { status });
}
