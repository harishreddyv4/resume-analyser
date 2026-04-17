import { randomUUID } from "crypto";
import { validateResumeFile } from "@/lib/uploads";
import type { UserSubmission } from "@/types/submission";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import { fetchSubmissionById } from "@/lib/supabase/submissions";
import { getPricingPlan } from "./pricing-catalog";
import { resolveTargetRoleForApi } from "./role-resolution";
import type { MultipartSubmissionFields } from "./multipart-schema";
import { persistResumeExtractionForSubmission } from "@/lib/resume-extraction/persist-submission-extract";
import {
  deleteResumeObject,
  persistSubmissionRow,
  stageResumeBinary,
} from "./pipeline";
import { SubmissionValidationError } from "./submission-errors";

export type CreateSubmissionInput = MultipartSubmissionFields & {
  resume: File;
};

function collectResumeError(file: File): string | null {
  return validateResumeFile(file);
}

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<UserSubmission> {
  const resumeErr = collectResumeError(input.resume);
  if (resumeErr) {
    throw new SubmissionValidationError(resumeErr, { resume: resumeErr });
  }

  if (!isSupabaseConfigured()) {
    throw new SupabaseNotConfiguredError();
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const plan = getPricingPlan(input.plan);
  const targetRole = resolveTargetRoleForApi(
    input.rolePreset,
    input.roleCustom,
  );

  const submission: UserSubmission = {
    id,
    createdAtIso: now,
    updatedAtIso: now,
    status: "awaiting_payment",
    paymentStatus: "pending",
    fullName: input.fullName,
    email: input.email,
    targetRole,
    rolePreset: input.rolePreset,
    roleCustom: input.roleCustom?.trim() || undefined,
    jobDescription: input.jobDescription?.trim() || undefined,
    plan,
    resumeFileName: input.resume.name,
    resumeContentType: input.resume.type || "application/octet-stream",
    resumeSizeBytes: input.resume.size,
    resumeStorageKey: null,
    paymentIntentId: null,
    databaseRecordId: null,
  };

  let objectPath: string | null = null;
  try {
    const staged = await stageResumeBinary({
      submissionId: id,
      file: input.resume,
    });
    objectPath = staged.objectPath;
    submission.resumeStorageKey = staged.publicUrl;
    const persisted = await persistSubmissionRow({ submission });
    if (persisted.resumeStorageKey) {
      await persistResumeExtractionForSubmission({
        submissionId: persisted.id,
        fileUrl: persisted.resumeStorageKey,
      });
    }
    return persisted;
  } catch (err) {
    if (objectPath) {
      await deleteResumeObject(objectPath).catch(() => undefined);
    }
    throw err;
  }
}

export async function getSubmission(
  id: string,
): Promise<UserSubmission | undefined> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseNotConfiguredError();
  }
  const row = await fetchSubmissionById(id);
  return row ?? undefined;
}
