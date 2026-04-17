import type { SupabaseClient } from "@supabase/supabase-js";
import { RESUME_BUCKET, resumeStoragePathFromStoredValue } from "./resume-storage";

export type ResumeObjectMetadata = {
  resumeSizeBytes: number;
  resumeContentType: string;
};

/**
 * Best-effort metadata from Storage `list` (private bucket; no public listing required).
 */
export async function fetchResumeObjectMetadata(
  admin: SupabaseClient,
  storedPathOrUrl: string,
): Promise<ResumeObjectMetadata> {
  const objectPath = resumeStoragePathFromStoredValue(storedPathOrUrl);
  const segments = objectPath.split("/").filter(Boolean);
  if (segments.length < 2) {
    return { resumeSizeBytes: 0, resumeContentType: "application/octet-stream" };
  }
  const fileName = segments.pop()!;
  const folder = segments.join("/");

  const { data, error } = await admin.storage.from(RESUME_BUCKET).list(folder, {
    limit: 100,
    search: fileName,
  });

  if (error || !data?.length) {
    return { resumeSizeBytes: 0, resumeContentType: "application/octet-stream" };
  }

  type ListedFile = { name: string; metadata?: Record<string, unknown> | null };

  const files = data as ListedFile[];
  const match =
    files.find((f) => f.name === fileName) ??
    files.find((f) => f.name.startsWith(fileName));

  const meta = match?.metadata as
    | { size?: number; mimetype?: string }
    | undefined;
  const size = typeof meta?.size === "number" ? meta.size : 0;
  const mime =
    (typeof meta?.mimetype === "string" && meta.mimetype) ||
    "application/octet-stream";

  return { resumeSizeBytes: size, resumeContentType: mime };
}
