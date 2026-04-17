import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";

export const ANALYSIS_REPORTS_BUCKET = "analysis-reports" as const;

function buildReportPdfObjectPath(submissionId: string): string {
  return `reports/${submissionId}/report.pdf`;
}

function getReportPdfPublicUrl(
  admin: SupabaseClient,
  objectPath: string,
): string {
  const { data } = admin.storage
    .from(ANALYSIS_REPORTS_BUCKET)
    .getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function uploadAnalysisReportPdf(args: {
  submissionId: string;
  pdfBuffer: Buffer;
}): Promise<{ objectPath: string; publicUrl: string }> {
  const admin = createAdminClient();
  const objectPath = buildReportPdfObjectPath(args.submissionId);
  const { data, error } = await admin.storage
    .from(ANALYSIS_REPORTS_BUCKET)
    .upload(objectPath, args.pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "3600",
    });

  if (error || !data?.path) {
    throw new Error(error?.message ?? "Could not upload report PDF.");
  }

  return {
    objectPath: data.path,
    publicUrl: getReportPdfPublicUrl(admin, data.path),
  };
}
