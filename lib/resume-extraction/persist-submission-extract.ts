import { extractResumeText } from "./extract-resume-text";
import {
  markSubmissionAnalysisFailedForParse,
  updateSubmissionResumeExtractedText,
} from "@/lib/supabase/submission-extraction-repository";

function logExtractionFailure(
  stage: string,
  submissionId: string,
  err: unknown,
): void {
  console.error(`[resume-extraction] ${stage}`, {
    submissionId,
    message: err instanceof Error ? err.message : String(err),
  });
}

type PersistArgs = {
  submissionId: string;
  /** Public URL or storage path — same shape as `submissions.resume_file_url`. */
  fileUrl: string;
};

/**
 * Runs server-side text extraction after upload and persists it for the analysis pipeline.
 * On failure: logs, clears text, sets `analysis_status` to `failed`.
 */
export async function persistResumeExtractionForSubmission(
  args: PersistArgs,
): Promise<void> {
  const { submissionId, fileUrl } = args;
  try {
    const text = await extractResumeText(fileUrl);
    if (!text.trim()) {
      throw new Error("Extracted resume text is empty.");
    }
    await updateSubmissionResumeExtractedText(submissionId, text);
  } catch (err) {
    logExtractionFailure("failed", submissionId, err);
    await markSubmissionAnalysisFailedForParse(submissionId).catch((e) => {
      logExtractionFailure("could not mark analysis failed", submissionId, e);
    });
  }
}
