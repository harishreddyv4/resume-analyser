import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1";

/** Groq-hosted model that supports structured outputs with `strict: true` (see Groq docs). */
export const GROQ_DEFAULT_ANALYSIS_MODEL = "openai/gpt-oss-20b";

/**
 * True when either Groq or OpenAI key is set (resume analysis LLM).
 * Prefer `GROQ_API_KEY` when both are set.
 */
export function isResumeAnalysisLlmConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
  );
}

/** @deprecated Use isResumeAnalysisLlmConfigured — name kept for exports; means "any analysis LLM". */
export function isOpenAIConfigured(): boolean {
  return isResumeAnalysisLlmConfigured();
}

/** True when Groq should be used for resume analysis (GROQ_API_KEY set). */
export function isGroqAnalysisEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function requireGroqKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    throw new Error("GROQ_API_KEY is not set.");
  }
  return key;
}

export function requireOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  return key;
}

export function getResumeAnalysisModel(): string {
  if (isGroqAnalysisEnabled()) {
    return (
      process.env.GROQ_ANALYSIS_MODEL?.trim() || GROQ_DEFAULT_ANALYSIS_MODEL
    );
  }
  return process.env.OPENAI_ANALYSIS_MODEL?.trim() || "gpt-4.1-mini";
}

/**
 * OpenAI SDK client pointed at OpenAI or Groq (OpenAI-compatible Chat Completions).
 */
export function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    if (isGroqAnalysisEnabled()) {
      cachedClient = new OpenAI({
        apiKey: requireGroqKey(),
        baseURL: process.env.GROQ_BASE_URL?.trim() || GROQ_DEFAULT_BASE,
      });
    } else {
      cachedClient = new OpenAI({ apiKey: requireOpenAIKey() });
    }
  }
  return cachedClient;
}
