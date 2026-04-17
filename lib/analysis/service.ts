import type { PlanId } from "@/lib/plan-ids";
import {
  getOpenAIClient,
  getResumeAnalysisModel,
  isOpenAIConfigured,
} from "./openai-client";
import {
  createResumeAnalysisUserPrompt,
  RESUME_ANALYSIS_SYSTEM_PROMPT,
} from "./prompts";
import {
  resumeAnalysisJsonSchema,
  resumeAnalysisResponseSchema,
  type ResumeAnalysisResponse,
} from "./schema";

const MAX_RESUME_TEXT_CHARS = 18_000;
const MAX_JOB_DESCRIPTION_CHARS = 8_000;

export type AnalyzeResumeInput = {
  planId: PlanId;
  targetRole: string;
  resumeText: string;
  jobDescription?: string;
};

function trimForModel(value: string, maxChars: number): string {
  const normalized = value.replace(/\u0000/g, "").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}\n[TRUNCATED]`;
}

function parseModelJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned non-JSON output.");
  }
}

function extractAssistantJsonText(
  message: { content?: unknown; refusal?: unknown } | undefined,
): string {
  if (!message) {
    throw new Error("OpenAI returned no assistant message.");
  }
  if (typeof message.refusal === "string" && message.refusal.trim()) {
    throw new Error(`OpenAI refused analysis: ${message.refusal}`);
  }

  if (typeof message.content === "string") {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    const text = message.content
      .map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          "type" in part &&
          "text" in part &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("")
      .trim();
    if (text) {
      return text;
    }
  }

  throw new Error("OpenAI returned an empty response.");
}

export async function analyzeResumeWithOpenAI(
  input: AnalyzeResumeInput,
): Promise<ResumeAnalysisResponse> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI is not configured. Set OPENAI_API_KEY.");
  }

  const resumeText = trimForModel(input.resumeText, MAX_RESUME_TEXT_CHARS);
  if (!resumeText) {
    throw new Error("Resume text is empty; cannot run analysis.");
  }

  const jobDescription = input.jobDescription
    ? trimForModel(input.jobDescription, MAX_JOB_DESCRIPTION_CHARS)
    : undefined;
  const shouldRunJobMatch = input.planId === "job-match" && Boolean(jobDescription);

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: getResumeAnalysisModel(),
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_analysis_report",
          strict: true,
          schema: resumeAnalysisJsonSchema,
        },
      },
      messages: [
        {
          role: "system",
          content: RESUME_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: createResumeAnalysisUserPrompt({
            planId: input.planId,
            targetRole: input.targetRole,
            resumeText,
            jobDescription,
          }),
        },
      ],
    });

    const rawContent = extractAssistantJsonText(completion.choices[0]?.message);

    const parsed = resumeAnalysisResponseSchema.parse(parseModelJson(rawContent));

    if (shouldRunJobMatch && !parsed.jobMatch) {
      throw new Error(
        "Expected jobMatch analysis for job-match plan with job description.",
      );
    }
    if (!shouldRunJobMatch && parsed.jobMatch) {
      return {
        ...parsed,
        jobMatch: null,
      };
    }

    return parsed;
  } catch (err) {
    console.error("[resume-analysis] OpenAI analysis failed", {
      model: getResumeAnalysisModel(),
      planId: input.planId,
      hasJobDescription: Boolean(jobDescription),
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
