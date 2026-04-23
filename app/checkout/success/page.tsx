import type { Metadata } from "next";
import { CheckoutSuccessView } from "@/components/checkout/CheckoutSuccessView";
import { maskEmail } from "@/lib/mask-email";
import {
  firstSearchParam,
  parseRoleSummaryParam,
  type PageSearchParams,
} from "@/lib/search-params";
import { resolvePlan } from "@/lib/site";
import { fetchSubmissionById } from "@/lib/supabase/submissions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you — order confirmed",
  description:
    "Your Resume Analyzer payment is confirmed. Your resume is queued for analysis.",
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function firstNameFromFull(fullName: string): string {
  const t = fullName.trim();
  if (!t || t === "—") {
    return "—";
  }
  return t.split(/\s+/)[0] ?? t;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const sp = await searchParams;
  const submissionId = firstSearchParam(sp.submissionId);
  const planParam = firstSearchParam(sp.plan);
  const roleFromUrl = parseRoleSummaryParam(sp.role);
  const plan = resolvePlan(planParam);

  let fullName = "—";
  let emailDisplay = "—";
  let planName: string = plan.name;
  let planPrice: string = plan.price;
  let targetRole: string | null = roleFromUrl;
  let referenceId = submissionId ?? "—";
  let footnote: "verified" | "offline" | "lookup_miss" = "offline";
  let livePaymentStatus: PaymentLifecycleStatus | undefined;
  let livePipelineStatus: AnalysisStatus | undefined;

  if (submissionId && isUuid(submissionId) && isSupabaseConfigured()) {
    try {
      const sub = await fetchSubmissionById(submissionId);
      if (sub) {
        fullName = sub.fullName;
        emailDisplay = maskEmail(sub.email);
        planName = sub.plan.name;
        planPrice = sub.plan.priceLabel;
        targetRole = sub.targetRole?.trim() || roleFromUrl;
        referenceId = sub.id;
        footnote = "verified";
        livePaymentStatus = sub.paymentStatus;
        livePipelineStatus = sub.status;
      } else {
        footnote = "lookup_miss";
      }
    } catch {
      footnote = "lookup_miss";
    }
  }

  const firstName = firstNameFromFull(fullName);

  return (
    <CheckoutSuccessView
      firstName={firstName}
      fullName={fullName}
      emailDisplay={emailDisplay}
      planName={planName}
      planPrice={planPrice}
      targetRole={targetRole}
      referenceId={referenceId}
      footnote={footnote}
      livePaymentStatus={livePaymentStatus}
      livePipelineStatus={livePipelineStatus}
    />
  );
}
