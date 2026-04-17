import { STORAGE_KEY_UPLOAD_DRAFT } from "./persistence-keys";

export type UploadDraftPayload = {
  submissionId?: string;
  fullName: string;
  email: string;
  fileName: string;
  hasJobDescription: boolean;
};

export function persistUploadDraft(payload: UploadDraftPayload): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY_UPLOAD_DRAFT,
      JSON.stringify(payload),
    );
  } catch {
    /* private mode / quota */
  }
}

export function checkoutSuccessHref(plan: string, role: string): string {
  const params = new URLSearchParams({ plan });
  if (role) {
    params.set("role", role);
  }
  return `/checkout/success?${params.toString()}`;
}
