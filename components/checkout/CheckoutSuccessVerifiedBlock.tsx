"use client";

import { useEffect, useState } from "react";
import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";
import type { UserSubmission } from "@/types/submission";
import {
  CheckoutStatusTag,
  resolveCheckoutSuccessChips,
} from "./checkout-success-chips";

const POLL_MS = 2500;
const MAX_POLLS = 36;

type Props = {
  submissionId: string;
  initialPayment?: PaymentLifecycleStatus;
  initialPipeline?: AnalysisStatus;
};

/**
 * Live paragraph + status chips for verified checkouts. Polls the API so UI matches
 * admin (`payment_status` + `analysis_status`) after post-payment analysis runs or fails.
 */
export function CheckoutSuccessVerifiedBlock({
  submissionId,
  initialPayment,
  initialPipeline,
}: Props) {
  const [payment, setPayment] = useState(initialPayment);
  const [pipeline, setPipeline] = useState(initialPipeline);

  useEffect(() => {
    let cancelled = false;
    let polls = 0;

    async function tick() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) {
          return;
        }
        const s = (await res.json()) as UserSubmission;
        setPayment(s.paymentStatus);
        setPipeline(s.status);
      } catch {
        /* ignore */
      }
    }

    void tick();
    const id = setInterval(async () => {
      polls += 1;
      if (polls >= MAX_POLLS) {
        clearInterval(id);
        return;
      }
      try {
        const res = await fetch(`/api/submissions/${submissionId}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) {
          return;
        }
        const s = (await res.json()) as UserSubmission;
        setPayment(s.paymentStatus);
        setPipeline(s.status);
        if (s.status === "complete" || s.status === "failed") {
          clearInterval(id);
        }
      } catch {
        /* ignore */
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [submissionId]);

  const chips = resolveCheckoutSuccessChips(payment, pipeline);
  const showFailureCallout =
    payment === "paid" && pipeline === "failed";

  return (
    <>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
        {showFailureCallout ? (
          <>
            Your payment is confirmed. The automated report step did not complete
            successfully—if you are seeing this message, contact support and include
            the reference id below. We can retry or help manually.
          </>
        ) : (
          <>
            Your payment is confirmed, and your file is in the analysis queue.
            We have what we need to produce your report—sit tight while we
            prepare tailored feedback for your next step.
          </>
        )}
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <CheckoutStatusTag {...chips.pay} />
        <CheckoutStatusTag {...chips.analysis} />
        <CheckoutStatusTag {...chips.report} />
      </div>
    </>
  );
}
