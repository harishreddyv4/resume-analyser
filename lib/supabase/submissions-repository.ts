import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserSubmission } from "@/types/submission";
import {
  ANALYSIS_STATUS,
  PAYMENT_STATUS,
} from "@/lib/submissions/status-constants";
import { createAdminClient } from "./admin";
import {
  getResumePublicUrl,
  removeResumeObject,
  resumeStoragePathFromStoredValue,
  uploadResumeObject,
} from "./resume-storage";
import { fetchResumeObjectMetadata } from "./resume-storage-metadata";
import {
  mapSubmissionRowToUserSubmission,
  parseResumeFileNameFromStoredRef,
} from "./submission-mapper";
import type { SaveSubmissionInput, SubmissionRow } from "./submission-types";

/**
 * Uploads resume bytes to the `resumes` bucket and returns the object path plus public URL.
 */
export async function uploadSubmissionResume(args: {
  submissionId: string;
  file: File;
}): Promise<{ objectPath: string; publicUrl: string }> {
  const admin = createAdminClient();
  return uploadResumeObject(admin, args);
}

/**
 * Ensures a stored `resume_file_url` value has a canonical public URL (for legacy path-only rows).
 */
export function resolveResumePublicUrl(
  admin: SupabaseClient,
  storedPathOrUrl: string,
): string {
  const trimmed = storedPathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return getResumePublicUrl(admin, resumeStoragePathFromStoredValue(trimmed));
}

/**
 * Inserts a submission row (server-side; uses service role).
 */
export async function saveSubmission(
  input: SaveSubmissionInput,
): Promise<UserSubmission> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("submissions")
    .insert({
      id: input.id,
      full_name: input.fullName,
      email: input.email,
      resume_file_url: input.resumeFileUrl,
      target_role: input.targetRole,
      job_description: input.jobDescription?.trim() || null,
      selected_plan: input.selectedPlanId,
      payment_status: PAYMENT_STATUS.PENDING,
      analysis_status: ANALYSIS_STATUS.QUEUED,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to insert submission.");
  }

  const row = data as SubmissionRow;
  return mapSubmissionRowToUserSubmission(
    row,
    input.resumeFileName,
    input.resumeContentType,
    input.resumeSizeBytes,
  );
}

/**
 * Deletes a resume object from storage (path or full public URL).
 */
export async function deleteResumeObject(storedPathOrUrl: string): Promise<void> {
  const admin = createAdminClient();
  await removeResumeObject(admin, storedPathOrUrl);
}

/**
 * Fetches a submission by id and maps it to `UserSubmission`.
 */
export async function fetchSubmissionById(
  id: string,
): Promise<UserSubmission | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  const row = data as SubmissionRow;
  const resumeFileUrl = resolveResumePublicUrl(admin, row.resume_file_url);
  const rowForClient: SubmissionRow = {
    ...row,
    resume_file_url: resumeFileUrl,
  };
  const resumeFileName = parseResumeFileNameFromStoredRef(row.resume_file_url);
  const meta = await fetchResumeObjectMetadata(admin, row.resume_file_url);

  return mapSubmissionRowToUserSubmission(
    rowForClient,
    resumeFileName,
    meta.resumeContentType,
    meta.resumeSizeBytes || 0,
  );
}
