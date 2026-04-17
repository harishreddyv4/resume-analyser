import { plans } from "@/lib/site";
import type { PricingPlan, PricingPlanId } from "@/types/submission";

const AMOUNT_INR: Record<PricingPlanId, number> = {
  basic: 99,
  pro: 299,
  "job-match": 499,
};

export function getPricingPlan(id: PricingPlanId): PricingPlan {
  const row = plans.find((p) => p.id === id);
  if (!row) {
    throw new Error(`Unknown pricing plan: ${id}`);
  }
  return {
    id,
    name: row.name,
    priceLabel: row.price,
    amountInr: AMOUNT_INR[id],
  };
}
