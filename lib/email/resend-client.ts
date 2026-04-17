import { Resend } from "resend";

let cachedResend: Resend | null = null;

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

function requireResendApiKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set.");
  }
  return key;
}

export function requireResendFromEmail(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not set.");
  }
  return fromEmail;
}

export function getAdminNotificationEmails(): string[] {
  const raw = process.env.RESUME_ANALYZER_ADMIN_EMAILS?.trim() ?? "";
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getResendClient(): Resend {
  if (!cachedResend) {
    cachedResend = new Resend(requireResendApiKey());
  }
  return cachedResend;
}
