import { z } from "zod";

const prioritySchema = z.enum(["high", "medium", "low"]);

const weaknessSchema = z.object({
  title: z.string().min(3).max(120),
  whyItHurts: z.string().min(20).max(400),
  howToFix: z.string().min(20).max(500),
});

const bulletRewriteSchema = z.object({
  original: z.string().min(5).max(400),
  suggestion: z.string().min(10).max(400),
  reason: z.string().min(20).max(300),
});

const strongerExperienceSchema = z.object({
  original: z.string().min(5).max(400),
  suggestion: z.string().min(10).max(400),
  impact: z.string().min(20).max(300),
});

const recommendationSchema = z.object({
  priority: prioritySchema,
  action: z.string().min(20).max(400),
  expectedImpact: z.string().min(20).max(300),
  timeEstimate: z.string().min(5).max(100),
});

const jobMatchDetailsSchema = z.object({
  jobMatchScore: z.number().int().min(0).max(100),
  skillsGap: z.array(z.string().min(2).max(120)).min(1).max(20),
  tailoredRecommendations: z.array(z.string().min(20).max(400)).min(3).max(12),
});

export const resumeAnalysisResponseSchema = z.object({
  overallResumeScore: z.number().int().min(0).max(100),
  atsReadinessScore: z.number().int().min(0).max(100),
  topWeaknesses: z.array(weaknessSchema).min(3).max(8),
  missingSkills: z.array(z.string().min(2).max(120)).min(3).max(30),
  bulletRewriteSuggestions: z.array(bulletRewriteSchema).min(4).max(12),
  improvedSummaryAbout: z.string().min(80).max(1800),
  strongerProjectWorkPhrasing: z.array(strongerExperienceSchema).min(4).max(12),
  actionableRecommendations: z.array(recommendationSchema).min(5).max(12),
  jobMatch: jobMatchDetailsSchema.nullable(),
});

export type ResumeAnalysisResponse = z.infer<typeof resumeAnalysisResponseSchema>;

export const resumeAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallResumeScore",
    "atsReadinessScore",
    "topWeaknesses",
    "missingSkills",
    "bulletRewriteSuggestions",
    "improvedSummaryAbout",
    "strongerProjectWorkPhrasing",
    "actionableRecommendations",
    "jobMatch",
  ],
  properties: {
    overallResumeScore: { type: "integer", minimum: 0, maximum: 100 },
    atsReadinessScore: { type: "integer", minimum: 0, maximum: 100 },
    topWeaknesses: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "whyItHurts", "howToFix"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 120 },
          whyItHurts: { type: "string", minLength: 20, maxLength: 400 },
          howToFix: { type: "string", minLength: 20, maxLength: 500 },
        },
      },
    },
    missingSkills: {
      type: "array",
      minItems: 3,
      maxItems: 30,
      items: { type: "string", minLength: 2, maxLength: 120 },
    },
    bulletRewriteSuggestions: {
      type: "array",
      minItems: 4,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original", "suggestion", "reason"],
        properties: {
          original: { type: "string", minLength: 5, maxLength: 400 },
          suggestion: { type: "string", minLength: 10, maxLength: 400 },
          reason: { type: "string", minLength: 20, maxLength: 300 },
        },
      },
    },
    improvedSummaryAbout: { type: "string", minLength: 80, maxLength: 1800 },
    strongerProjectWorkPhrasing: {
      type: "array",
      minItems: 4,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original", "suggestion", "impact"],
        properties: {
          original: { type: "string", minLength: 5, maxLength: 400 },
          suggestion: { type: "string", minLength: 10, maxLength: 400 },
          impact: { type: "string", minLength: 20, maxLength: 300 },
        },
      },
    },
    actionableRecommendations: {
      type: "array",
      minItems: 5,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["priority", "action", "expectedImpact", "timeEstimate"],
        properties: {
          priority: { type: "string", enum: ["high", "medium", "low"] },
          action: { type: "string", minLength: 20, maxLength: 400 },
          expectedImpact: { type: "string", minLength: 20, maxLength: 300 },
          timeEstimate: { type: "string", minLength: 5, maxLength: 100 },
        },
      },
    },
    jobMatch: {
      oneOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["jobMatchScore", "skillsGap", "tailoredRecommendations"],
          properties: {
            jobMatchScore: { type: "integer", minimum: 0, maximum: 100 },
            skillsGap: {
              type: "array",
              minItems: 1,
              maxItems: 20,
              items: { type: "string", minLength: 2, maxLength: 120 },
            },
            tailoredRecommendations: {
              type: "array",
              minItems: 3,
              maxItems: 12,
              items: { type: "string", minLength: 20, maxLength: 400 },
            },
          },
        },
      ],
    },
  },
} as const;
