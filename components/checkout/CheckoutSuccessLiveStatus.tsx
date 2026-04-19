"use client";

import { useEffect, useState } from "react";
import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";
import type { UserSubmission } from "@/types/submission";
import {
  resolveCheckoutSuccessChips,
  type StatusChip,
} from "./checkout-success-chips";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const POLL_MS = 2500;
const MAX_POLLS = 36;

function StatusTag({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: StatusChip["tone"];
}) {
  const tones = {
    emerald:
      "border-emerald-200/90 bg-emerald-50/95 text-emerald-950 ring-emerald-100/80",
    amber:
      "border-amber-200/90 bg-amber-50/95 text-amber-950 ring-amber-100/80",
    sky: "border-sky-200/90 bg-sky-50/95 text-sky-950 ring-sky-100/80",
    rose: "border-rose-200/90 bg-rose-50/95 text-rose-950 ring-rose-100/80",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide shadow-sm ring-1 ring-inset ${tones[tone]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      {label}
    </span>
  );
}

type Props = {
  submissionId: string;
  initialPayment?: PaymentLifecycleStatus;
  initialPipeline?: AnalysisStatus;
};

export function CheckoutSuccessLiveStatus({
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
    const id = setInterval(() => {
      polls += 1;
      if (polls >= MAX_POLLS) {
        clearInterval(id);
        return;
      }
      void tick();
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
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <StatusTag
          icon={chips.pay.icon}
          label={chips.pay.label}
          tone={chips.pay.tone}
        />
        <StatusTag
          icon={chips.analysis.icon}
          label={chips.analysis.label}
          tone={chips.analysis.tone}
        />
        <StatusTag
          icon={chips.report.icon}
          label={chips.report.label}
          tone={chips.report.tone}
        />
      </div>

      {showFailureCallout ? (
        <p className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-zinc-600 sm:text-lg">
          Your payment is confirmed. The automated report step did not complete
          successfully—if you are seeing this message, contact support and include
          your reference id below. We can retry or help manually.
        </p>
      ) : (
        <p className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-zinc-600 sm:text-lg">
          Your payment is confirmed, and your file is in the analysis queue.
          We have what we need to produce your report—sit tight while we
          prepare tailored feedback for your next step.
        </p>
      )}

      <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.14)] ring-1 ring-zinc-900/[0.04] backdrop-blur-sm sm:p-10">
        <div className="flex items-start gap-3 border-b border-zinc-100 pb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              What happens next
            </h2>
            <ol className="mt-3 list-decimal space-y-2.5 pl-4 text-sm leading-relaxed text-zinc-600 marker:font-semibold marker:text-zinc-400">
              <li>
                Our system parses your resume against your target role and any job
                description you included.
              </li>
              <li>
                You will receive a detailed report with ATS-style feedback,
                prioritized fixes, and suggested rewrites.
              </li>
              <li>
                We will email you as soon as your report is ready—most orders
                finish within minutes; occasionally it may take a bit longer at
                peak times.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
