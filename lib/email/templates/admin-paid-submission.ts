import type { EmailTemplate } from "./types";
import { escapeHtml } from "./escape-html";

export type AdminPaidSubmissionTemplateInput = {
  submissionId: string;
  candidateName: string;
  candidateEmail: string;
  selectedPlan: string;
  targetRole: string;
  reportUrl: string;
};

export function createAdminPaidSubmissionTemplate(
  input: AdminPaidSubmissionTemplateInput,
): EmailTemplate {
  const safeSubmissionId = escapeHtml(input.submissionId);
  const safeCandidateName = escapeHtml(input.candidateName);
  const safeCandidateEmail = escapeHtml(input.candidateEmail);
  const safeSelectedPlan = escapeHtml(input.selectedPlan);
  const safeTargetRole = escapeHtml(input.targetRole);
  const safeReportUrl = escapeHtml(input.reportUrl);

  const subject = `New paid submission - ${input.selectedPlan} - ${input.candidateName}`;
  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background: #f5f7fb; padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e7ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 20px 24px; background: #0f172a; color: #ffffff;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9;">Resume Analyzer</p>
        <h2 style="margin: 10px 0 0; font-size: 20px;">New paid submission received</h2>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 14px; color: #111827;">A payment was confirmed and post-payment analysis has been triggered.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 8px 0 20px;">
          <tr><td style="padding: 8px 0; color: #475467;">Submission ID</td><td style="padding: 8px 0; color: #111827; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${safeSubmissionId}</td></tr>
          <tr><td style="padding: 8px 0; color: #475467;">Candidate</td><td style="padding: 8px 0; color: #111827;">${safeCandidateName}</td></tr>
          <tr><td style="padding: 8px 0; color: #475467;">Email</td><td style="padding: 8px 0; color: #111827;">${safeCandidateEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #475467;">Plan</td><td style="padding: 8px 0; color: #111827;">${safeSelectedPlan}</td></tr>
          <tr><td style="padding: 8px 0; color: #475467;">Target role</td><td style="padding: 8px 0; color: #111827;">${safeTargetRole}</td></tr>
        </table>
        <a href="${safeReportUrl}" style="display:inline-block; background:#111827; color:#ffffff; padding:10px 16px; border-radius:10px; text-decoration:none; font-weight:600;">
          Open submission
        </a>
      </div>
    </div>
  </div>`;

  const text = [
    "Resume Analyzer - New paid submission",
    "",
    `Submission ID: ${input.submissionId}`,
    `Candidate: ${input.candidateName}`,
    `Email: ${input.candidateEmail}`,
    `Plan: ${input.selectedPlan}`,
    `Target role: ${input.targetRole}`,
    "",
    `Open submission: ${input.reportUrl}`,
  ].join("\n");

  return { subject, html, text };
}
