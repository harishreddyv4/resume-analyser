import type { ResumeAnalysisResponse } from "@/lib/analysis/schema";
import type { EmailTemplate } from "./types";
import { escapeHtml } from "./escape-html";

export type AnalysisCompleteTemplateInput = {
  recipientName: string;
  reportUrl: string;
  report: ResumeAnalysisResponse;
};

function topWeaknessSummary(report: ResumeAnalysisResponse): string {
  const topTwo = report.topWeaknesses.slice(0, 2).map((item) => item.title);
  if (topTwo.length === 0) {
    return "No major weaknesses were detected.";
  }
  return topTwo.join(", ");
}

export function createAnalysisCompleteTemplate(
  input: AnalysisCompleteTemplateInput,
): EmailTemplate {
  const greetingName = input.recipientName.trim() || "there";
  const safeGreetingName = escapeHtml(greetingName);
  const safeReportUrl = escapeHtml(input.reportUrl);
  const safeTopWeakness = escapeHtml(topWeaknessSummary(input.report));
  const jobScore = input.report.jobMatch?.jobMatchScore;
  const subject = `Your Resume Analyzer report is ready`;

  const summaryLines = [
    `Overall resume score: ${input.report.overallResumeScore}/100`,
    `ATS readiness score: ${input.report.atsReadinessScore}/100`,
  ];
  if (typeof jobScore === "number") {
    summaryLines.push(`Job match score: ${jobScore}/100`);
  }

  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background: #f5f7fb; padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e7ec; border-radius: 14px; overflow: hidden;">
      <div style="padding: 20px 24px; background: #0f172a; color: #ffffff;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9;">Resume Analyzer</p>
        <h2 style="margin: 10px 0 0; font-size: 20px;">Your analysis is complete</h2>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 12px; color: #111827;">Hi ${safeGreetingName},</p>
        <p style="margin: 0 0 16px; color: #111827;">Thank you for trusting Resume Analyzer. Your report is now ready with precise, recruiter-grade recommendations.</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; margin-bottom:16px;">
          <p style="margin:0 0 8px; font-size:13px; color:#475467; text-transform:uppercase; letter-spacing:0.08em;">Quick summary</p>
          <p style="margin:4px 0; color:#0f172a;">Overall resume score: <strong>${input.report.overallResumeScore}/100</strong></p>
          <p style="margin:4px 0; color:#0f172a;">ATS readiness score: <strong>${input.report.atsReadinessScore}/100</strong></p>
          ${
            typeof jobScore === "number"
              ? `<p style="margin:4px 0; color:#0f172a;">Job match score: <strong>${jobScore}/100</strong></p>`
              : ""
          }
          <p style="margin:8px 0 0; color:#334155;">Top improvement focus: ${safeTopWeakness}</p>
        </div>
        <a href="${safeReportUrl}" style="display:inline-block; background:#111827; color:#ffffff; padding:10px 16px; border-radius:10px; text-decoration:none; font-weight:600;">
          View or download your report
        </a>
        <p style="margin:16px 0 0; color:#475467;">We are rooting for your next interview win.</p>
      </div>
    </div>
  </div>`;

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thank you for trusting Resume Analyzer. Your report is now ready with recruiter-grade recommendations.",
    "",
    "Quick summary:",
    ...summaryLines,
    `Top improvement focus: ${topWeaknessSummary(input.report)}`,
    "",
    `View or download your report: ${input.reportUrl}`,
    "",
    "We are rooting for your next interview win.",
  ].join("\n");

  return { subject, html, text };
}
