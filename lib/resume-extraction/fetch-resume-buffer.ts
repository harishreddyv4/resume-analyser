import { createAdminClient } from "@/lib/supabase/admin";
import {
  RESUME_BUCKET,
  resumeStoragePathFromStoredValue,
} from "@/lib/supabase/resume-storage";

/**
 * Loads resume bytes from a public HTTPS URL or a Supabase Storage path / public URL.
 */
export async function fetchResumeFileBuffer(
  fileUrl: string,
): Promise<{ buffer: Buffer; fileName: string }> {
  const trimmed = fileUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const res = await fetch(trimmed, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching resume from URL`);
    }
    const ab = await res.arrayBuffer();
    let fileName = "resume";
    try {
      const u = new URL(trimmed);
      const last = u.pathname.split("/").filter(Boolean).pop();
      if (last) {
        fileName = decodeURIComponent(last.split("?")[0] ?? last);
      }
    } catch {
      // keep default fileName
    }
    return { buffer: Buffer.from(ab), fileName };
  }

  const admin = createAdminClient();
  const path = resumeStoragePathFromStoredValue(trimmed);
  const { data, error } = await admin.storage.from(RESUME_BUCKET).download(path);
  if (error || !data) {
    throw new Error(error?.message ?? "Storage download failed");
  }
  const ab = await data.arrayBuffer();
  const parts = path.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1] || "resume";
  return { buffer: Buffer.from(ab), fileName };
}
