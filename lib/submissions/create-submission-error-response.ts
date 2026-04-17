import type { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/http";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import { StorageUploadUserError } from "@/lib/supabase/resume-storage";
import { SubmissionValidationError } from "@/lib/submissions/submission-errors";
import type { ApiErrorBody } from "@/types/submission";

function storageUploadStatusCode(code: number): number {
  if (Number.isInteger(code) && code >= 400 && code <= 599) {
    return code;
  }
  return 500;
}

/**
 * Turns Supabase/Postgres insert failures into a short, non-sensitive client message.
 */
function mapUnknownSubmissionError(err: unknown): { message: string; status: number } {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "";
  const m = raw.toLowerCase();

  if (
    m.includes("submissions") &&
    (m.includes("does not exist") ||
      m.includes("schema cache") ||
      m.includes("could not find the table"))
  ) {
    return {
      message:
        "Database tables are missing. In Supabase, open the SQL Editor and run the migrations from the project’s supabase/migrations folder (in filename order), starting with the file that creates the submissions table.",
      status: 503,
    };
  }

  if (
    m.includes("invalid api key") ||
    m.includes("jwt") ||
    m.includes("invalid value for header") ||
    m.includes("unauthorized")
  ) {
    return {
      message:
        "Supabase rejected the server key. Confirm SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are from the same Supabase project and are copied into .env.local (then restart the dev server).",
      status: 503,
    };
  }

  if (m.includes("row-level security") || m.includes("row level security")) {
    return {
      message:
        "The database blocked this write. Confirm API routes use SUPABASE_SERVICE_ROLE_KEY (service role), not the anon key.",
      status: 503,
    };
  }

  return { message: "Could not create submission.", status: 500 };
}

/**
 * Maps domain errors from `createSubmission` to HTTP responses (no UI impact).
 */
export function createSubmissionErrorResponse(
  err: unknown,
): NextResponse<ApiErrorBody> {
  if (err instanceof SupabaseNotConfiguredError) {
    return jsonApiError(err.message, 503);
  }
  if (err instanceof StorageUploadUserError) {
    return jsonApiError(err.message, storageUploadStatusCode(err.statusCode));
  }
  if (err instanceof SubmissionValidationError) {
    return jsonApiError(err.message, 400, err.issues);
  }
  console.error("[createSubmission]", err);
  const mapped = mapUnknownSubmissionError(err);
  return jsonApiError(mapped.message, mapped.status);
}
