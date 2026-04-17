import PDFDocument from "pdfkit";
import type { ResumeAnalysisResponse } from "@/lib/analysis/schema";

type GenerateAnalysisReportPdfInput = {
  submissionId: string;
  candidateName: string;
  targetRole: string;
  selectedPlan: string;
  report: ResumeAnalysisResponse;
};

function pushSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.7);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text(title);
  doc.moveDown(0.25);
}

function pushBodyText(doc: PDFKit.PDFDocument, value: string): void {
  doc.font("Helvetica").fontSize(10.5).fillColor("#374151").text(value, {
    lineGap: 2,
  });
}

function pushBullet(doc: PDFKit.PDFDocument, text: string): void {
  doc.font("Helvetica").fontSize(10.5).fillColor("#374151").text(`- ${text}`, {
    lineGap: 2,
    indent: 10,
  });
}

function addPageFooter(doc: PDFKit.PDFDocument, submissionId: string): void {
  const footerY = doc.page.height - 40;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#6b7280")
    .text(
      `Resume Analyzer | Submission ${submissionId}`,
      doc.page.margins.left,
      footerY,
      {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "center",
      },
    );
}

export async function generateAnalysisReportPdf(
  input: GenerateAnalysisReportPdfInput,
): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 48, left: 50, right: 50, bottom: 56 },
      bufferPages: false,
      info: {
        Title: "Resume Analyzer Report",
        Author: "Resume Analyzer",
        Subject: "AI resume analysis report",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("error", (err) => reject(err));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica-Bold").fontSize(18).fillColor("#0f172a").text("Resume Analyzer");
    doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("Premium Resume Report");

    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#111827")
      .text(input.candidateName.trim() || "Candidate");
    doc.font("Helvetica").fontSize(10.5).fillColor("#374151").text(`Role: ${input.targetRole}`);
    doc.text(`Plan: ${input.selectedPlan}`);
    doc.text(`Submission ID: ${input.submissionId}`);

    pushSectionTitle(doc, "Scores");
    pushBodyText(
      doc,
      `Overall Score: ${input.report.overallResumeScore}/100 | ATS Score: ${input.report.atsReadinessScore}/100`,
    );
    if (input.report.jobMatch) {
      pushBodyText(doc, `Job Match Score: ${input.report.jobMatch.jobMatchScore}/100`);
    }

    pushSectionTitle(doc, "Top Insights");
    for (const item of input.report.topWeaknesses) {
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#111827").text(item.title);
      pushBodyText(doc, `Issue: ${item.whyItHurts}`);
      pushBodyText(doc, `Fix: ${item.howToFix}`);
      doc.moveDown(0.35);
    }

    pushSectionTitle(doc, "Missing Skills");
    for (const skill of input.report.missingSkills) {
      pushBullet(doc, skill);
    }

    pushSectionTitle(doc, "Improved Summary");
    pushBodyText(doc, input.report.improvedSummaryAbout);

    pushSectionTitle(doc, "Rewrite Suggestions");
    for (const item of input.report.bulletRewriteSuggestions.slice(0, 8)) {
      pushBodyText(doc, `Original: ${item.original}`);
      pushBodyText(doc, `Suggested: ${item.suggestion}`);
      pushBodyText(doc, `Why: ${item.reason}`);
      doc.moveDown(0.35);
    }

    pushSectionTitle(doc, "Stronger Project/Work Phrasing");
    for (const item of input.report.strongerProjectWorkPhrasing.slice(0, 8)) {
      pushBodyText(doc, `Original: ${item.original}`);
      pushBodyText(doc, `Stronger: ${item.suggestion}`);
      pushBodyText(doc, `Impact: ${item.impact}`);
      doc.moveDown(0.35);
    }

    if (input.report.jobMatch) {
      pushSectionTitle(doc, "Job Match Details");
      pushBodyText(doc, "Skills Gap:");
      for (const skill of input.report.jobMatch.skillsGap) {
        pushBullet(doc, skill);
      }
      doc.moveDown(0.4);
      pushBodyText(doc, "Tailored Recommendations:");
      for (const rec of input.report.jobMatch.tailoredRecommendations) {
        pushBullet(doc, rec);
      }
    }

    addPageFooter(doc, input.submissionId);
    doc.end();
  });
}
