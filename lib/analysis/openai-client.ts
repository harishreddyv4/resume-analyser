import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function requireOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  return key;
}

export function getResumeAnalysisModel(): string {
  return process.env.OPENAI_ANALYSIS_MODEL?.trim() || "gpt-4.1-mini";
}

export function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: requireOpenAIKey() });
  }
  return cachedClient;
}
