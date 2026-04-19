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

/**
 * Optional: `groq` | `openai` | `auto` (default).
 * - `openai` — use OpenAI even if `GROQ_API_KEY` is set (both keys in env).
 * - `groq` or `auto` — use Groq when `GROQ_API_KEY` is set, otherwise OpenAI.
 */
export function getResumeAnalysisProviderPreference(): "groq" | "openai" | "auto" {
  const raw = process.env.RESUME_ANALYSIS_PROVIDER?.trim().toLowerCase();
  if (raw === "openai" || raw === "groq" || raw === "auto") {
    return raw;
  }
  return "auto";
}

/** True when Groq should be used for resume analysis. */
export function isGroqAnalysisEnabled(): boolean {
  const pref = getResumeAnalysisProviderPreference();
  if (pref === "openai") {
    return false;
  }
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  if (pref === "groq") {
    return hasGroq;
  }
  return hasGroq;
}

/**
 * Which backend the running process uses for resume analysis (matches runtime).
 */
export function getActiveResumeAnalysisProvider(): "groq" | "openai" | "none" {
  const pref = getResumeAnalysisProviderPreference();
  if (pref === "groq" && !process.env.GROQ_API_KEY?.trim()) {
    return "none";
  }
  if (isGroqAnalysisEnabled()) {
    return "groq";
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    return "openai";
  }
  return "none";
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
    const pref = getResumeAnalysisProviderPreference();
    if (pref === "groq" && !process.env.GROQ_API_KEY?.trim()) {
      throw new Error(
        "RESUME_ANALYSIS_PROVIDER=groq but GROQ_API_KEY is not set on the server.",
      );
    }
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
