import type { SupabaseClient } from "@supabase/supabase-js";

export const RESUME_BUCKET = "resumes" as const;

const PUBLIC_URL_MARKERS = [
  "/storage/v1/object/public/resumes/",
  "/storage/v1/object/sign/resumes/",
] as const;

/**
 * Object path inside the `resumes` bucket, e.g. `submissions/<id>/file.pdf`.
 */
export function buildResumeObjectPath(
  submissionId: string,
  originalFileName: string,
): string {
  const safe = originalFileName
    .trim()
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 180);
  const name = safe || "resume";
  return `submissions/${submissionId}/${name}`;
}

/**
 * Turns a stored value (public URL or raw path) into the storage object path.
 */
export function resumeStoragePathFromStoredValue(stored: string): string {
  const trimmed = stored.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed.replace(/^\/+/, "");
  }
  try {
    const u = new URL(trimmed);
    for (const marker of PUBLIC_URL_MARKERS) {
      const idx = u.pathname.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(
          u.pathname.slice(idx + marker.length).replace(/^\/+/, ""),
        );
      }
    }
    const legacy = "/object/public/resumes/";
    const j = u.pathname.indexOf(legacy);
    if (j !== -1) {
      return decodeURIComponent(u.pathname.slice(j + legacy.length));
    }
  } catch {
    // fall through
  }
  return trimmed;
}

export function getResumePublicUrl(
  admin: SupabaseClient,
  objectPath: string,
): string {
  const { data } = admin.storage.from(RESUME_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export type ResumeUploadResult = {
  objectPath: string;
  /** Persisted to `submissions.resume_file_url` when the bucket allows public reads. */
  publicUrl: string;
};

/** Typed error with HTTP status for API routes (no internal details exposed). */
export class StorageUploadUserError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "StorageUploadUserError";
    this.statusCode = statusCode;
  }
}

/**
 * Uploads a resume file to Supabase Storage (service-role client).
 */
export async function uploadResumeObject(
  admin: SupabaseClient,
  args: { submissionId: string; file: File },
): Promise<ResumeUploadResult> {
  const objectPath = buildResumeObjectPath(
    args.submissionId,
    args.file.name,
  );
  const contentType =
    args.file.type || "application/octet-stream";
  const body = Buffer.from(await args.file.arrayBuffer());

  const { data, error } = await admin.storage.from(RESUME_BUCKET).upload(
    objectPath,
    body,
    {
      contentType,
      upsert: false,
      cacheControl: "3600",
    },
  );

  if (error) {
    throw mapStorageUploadError(error);
  }

  if (!data?.path) {
    throw new StorageUploadUserError(
      "We could not confirm the upload with storage. Please try again.",
      500,
    );
  }

  const publicUrl = getResumePublicUrl(admin, data.path);
  return { objectPath: data.path, publicUrl };
}

export async function removeResumeObject(
  admin: SupabaseClient,
  storedPathOrUrl: string,
): Promise<void> {
  const path = resumeStoragePathFromStoredValue(storedPathOrUrl);
  await admin.storage.from(RESUME_BUCKET).remove([path]);
}

function mapStorageUploadError(error: unknown): StorageUploadUserError {
  const rec = error as { message?: string; statusCode?: string | number };
  const msg = (typeof rec.message === "string" ? rec.message : "").toLowerCase();
  const status = String(rec.statusCode ?? "");

  if (
    status === "413" ||
    msg.includes("payload too large") ||
    msg.includes("entity too large")
  ) {
    return new StorageUploadUserError(
      "That file is too large for the server to accept. Try a smaller file or compress your resume.",
      413,
    );
  }

  if (
    status === "403" ||
    msg.includes("row-level security") ||
    msg.includes("policy")
  ) {
    return new StorageUploadUserError(
      "We could not authorize the upload. Please refresh the page and try again.",
      403,
    );
  }

  if (status === "409" || msg.includes("already exists")) {
    return new StorageUploadUserError(
      "A file with this name is already linked to this submission. Rename your file and try again.",
      409,
    );
  }

  if (msg.includes("bucket not found")) {
    return new StorageUploadUserError(
      "Resume storage is not set up yet. Please contact support.",
      503,
    );
  }

  return new StorageUploadUserError(
    "We could not upload your resume. Check your connection and try again.",
    500,
  );
}
