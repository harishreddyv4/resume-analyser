import { getPricingPlan } from "@/lib/submissions/pricing-catalog";
import type { PlanId } from "@/lib/plan-ids";

/** Razorpay expects INR in paise (₹1 = 100). */
export function planAmountPaise(planId: PlanId): number {
  const plan = getPricingPlan(planId);
  return plan.amountInr * 100;
}
