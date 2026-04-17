import { NextResponse } from "next/server";
import { createSubmissionErrorResponse } from "@/lib/submissions/create-submission-error-response";
import { parseCreateSubmissionMultipart } from "@/lib/submissions/parse-create-submission-multipart";
import { createSubmission } from "@/lib/submissions/service";
import type { CreateSubmissionResponseBody } from "@/types/submission";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = await parseCreateSubmissionMultipart(request);
    if (!parsed.ok) {
      return NextResponse.json(parsed.body, { status: parsed.status });
    }

    try {
      const submission = await createSubmission({
        ...parsed.fields,
        resume: parsed.resume,
      });
      const body: CreateSubmissionResponseBody = {
        submissionId: submission.id,
        status: submission.status,
      };
      return NextResponse.json(body, { status: 201 });
    } catch (err) {
      return createSubmissionErrorResponse(err);
    }
  } catch (err) {
    console.error("[POST /api/submissions] unhandled", err);
    return NextResponse.json(
      {
        error:
          "Unexpected server error while creating your submission. Check hosting logs for this request, verify Supabase env vars on the server, and confirm the `resumes` bucket exists.",
      },
      { status: 500 },
    );
  }
}
