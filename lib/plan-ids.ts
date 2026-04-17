export const PLAN_IDS = ["basic", "pro", "job-match"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "basic" || value === "pro" || value === "job-match";
}
