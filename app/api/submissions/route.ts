import { NextResponse } from "next/server";
import { createSubmissionErrorResponse } from "@/lib/submissions/create-submission-error-response";
import { parseCreateSubmissionMultipart } from "@/lib/submissions/parse-create-submission-multipart";
import { createSubmission } from "@/lib/submissions/service";
import type { CreateSubmissionResponseBody } from "@/types/submission";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
}
