import type { ResumeAnalysisResponse } from "@/lib/analysis/schema";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import {
  getAdminNotificationEmails,
  getResendClient,
  isResendConfigured,
  requireResendFromEmail,
} from "./resend-client";
import { createAdminPaidSubmissionTemplate } from "./templates/admin-paid-submission";
import { createAnalysisCompleteTemplate } from "./templates/analysis-complete";

type SendAdminPaidSubmissionEmailArgs = {
  submissionId: string;
  candidateName: string;
  candidateEmail: string;
  selectedPlan: string;
  targetRole: string;
};

type SendUserAnalysisCompleteEmailArgs = {
  submissionId: string;
  toEmail: string;
  recipientName: string;
  report: ResumeAnalysisResponse;
};

function submissionReportUrl(submissionId: string): string {
  const base = getPublicSiteUrl().toString().replace(/\/$/, "");
  return `${base}/report/${submissionId}`;
}

async function sendEmailOrThrow(args: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const result = await getResendClient().emails.send({
    from: requireResendFromEmail(),
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Resend failed to send email.");
  }
}

export async function sendAdminPaidSubmissionEmail(
  args: SendAdminPaidSubmissionEmailArgs,
): Promise<void> {
  if (!isResendConfigured()) {
    return;
  }
  const adminEmails = getAdminNotificationEmails();
  if (adminEmails.length === 0) {
    return;
  }

  const template = createAdminPaidSubmissionTemplate({
    submissionId: args.submissionId,
    candidateName: args.candidateName,
    candidateEmail: args.candidateEmail,
    selectedPlan: args.selectedPlan,
    targetRole: args.targetRole,
    reportUrl: submissionReportUrl(args.submissionId),
  });

  await sendEmailOrThrow({
    to: adminEmails,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendUserAnalysisCompleteEmail(
  args: SendUserAnalysisCompleteEmailArgs,
): Promise<void> {
  if (!isResendConfigured()) {
    return;
  }
  const toEmail = args.toEmail.trim();
  if (!toEmail) {
    return;
  }

  const template = createAnalysisCompleteTemplate({
    recipientName: args.recipientName,
    reportUrl: submissionReportUrl(args.submissionId),
    report: args.report,
  });

  await sendEmailOrThrow({
    to: [toEmail],
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
