import { createAdminClient } from "./admin";
import { ANALYSIS_STATUS } from "@/lib/submissions/status-constants";

export async function updateSubmissionResumeExtractedText(
  submissionId: string,
  text: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({
      resume_extracted_text: text,
      analysis_status: ANALYSIS_STATUS.QUEUED,
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markSubmissionAnalysisFailedForParse(
  submissionId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({
      resume_extracted_text: null,
      analysis_status: ANALYSIS_STATUS.FAILED,
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }
}
