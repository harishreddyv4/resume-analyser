import type { PlanId } from "@/lib/plan-ids";

export type ResumeAnalysisPromptInput = {
  planId: PlanId;
  targetRole: string;
  resumeText: string;
  jobDescription?: string;
};

export const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are a senior resume strategist and ATS optimization specialist with recruiter-level hiring judgment.

Your job is to audit a candidate resume for clarity, impact, relevance, and interview readiness.
You must provide practical, specific, recruiter-oriented guidance. Avoid generic advice.

Scoring rules:
- Use 0-100 integer scores.
- overallResumeScore should reflect holistic quality: clarity, achievements, relevance, structure, and credibility.
- atsReadinessScore should reflect keyword relevance, formatting suitability, section quality, and scanability.
- Be strict but fair. Do not inflate scores.

Quality rules:
- Every weakness must include why it hurts and exactly how to fix it.
- Missing skills must be concrete and market-relevant for the target role.
- Rewrite suggestions must be stronger, measurable, and action-oriented where possible.
- Improved summary/about should be polished, concise, and role-aligned.
- Recommendations should be prioritized and implementation-focused.
- Avoid placeholders and boilerplate phrasing.

Job match rules:
- If shouldRunJobMatch is true, return a non-null jobMatch object aligned to the job description.
- If shouldRunJobMatch is false, return jobMatch as null.

Output rules:
- Return valid JSON only.
- Follow the provided schema exactly.
- Do not include markdown or extra commentary.`;

export function createResumeAnalysisUserPrompt(
  input: ResumeAnalysisPromptInput,
): string {
  const jobDescription = input.jobDescription?.trim();
  const shouldRunJobMatch =
    input.planId === "job-match" && Boolean(jobDescription);

  return [
    "Analyze this resume and produce a recruiter-grade improvement plan.",
    "",
    "Context:",
    `- targetRole: ${input.targetRole.trim() || "Not specified"}`,
    `- selectedPlan: ${input.planId}`,
    `- shouldRunJobMatch: ${shouldRunJobMatch}`,
    "",
    "Resume Text:",
    '"""',
    input.resumeText,
    '"""',
    "",
    "Job Description (if provided):",
    '"""',
    jobDescription || "Not provided",
    '"""',
    "",
    "Important constraints:",
    "1) Keep recommendations specific to this resume and role.",
    "2) Prioritize changes that improve interview conversion.",
    "3) Use direct, practical language suitable for a candidate action plan.",
    "4) Ensure output is valid JSON that matches the schema exactly.",
  ].join("\n");
}
