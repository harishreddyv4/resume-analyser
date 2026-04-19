import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";
import { AlertCircle, CheckCircle2, Mail, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatusChip = {
  icon: LucideIcon;
  label: string;
  tone: "emerald" | "amber" | "sky" | "rose";
};

export type CheckoutChips = {
  pay: StatusChip;
  analysis: StatusChip;
  report: StatusChip;
};

/**
 * Maps payment + submission `status` (analysis pipeline) to three UI chips.
 */
export function resolveCheckoutSuccessChips(
  payment: PaymentLifecycleStatus | undefined,
  pipeline: AnalysisStatus | undefined,
): CheckoutChips {
  const pay: StatusChip =
    payment === "paid"
      ? {
          icon: CheckCircle2,
          label: "Payment received",
          tone: "emerald",
        }
      : payment === "failed"
        ? {
            icon: AlertCircle,
            label: "Payment issue",
            tone: "rose",
          }
        : {
            icon: Timer,
            label: "Payment pending",
            tone: "amber",
          };

  let analysis: StatusChip;
  if (payment !== "paid") {
    analysis = {
      icon: Timer,
      label: "Analysis after payment",
      tone: "amber",
    };
  } else if (pipeline === "complete") {
    analysis = {
      icon: CheckCircle2,
      label: "Analysis complete",
      tone: "emerald",
    };
  } else if (pipeline === "failed") {
    analysis = {
      icon: AlertCircle,
      label: "Analysis failed",
      tone: "rose",
    };
  } else if (pipeline === "processing") {
    analysis = {
      icon: Timer,
      label: "Analysis running",
      tone: "sky",
    };
  } else {
    analysis = {
      icon: Timer,
      label: "Analysis queued",
      tone: "amber",
    };
  }

  let report: StatusChip;
  if (pipeline === "complete") {
    report = {
      icon: Mail,
      label: "Report will be emailed",
      tone: "emerald",
    };
  } else if (payment === "paid" && pipeline === "failed") {
    report = {
      icon: AlertCircle,
      label: "Report not generated",
      tone: "rose",
    };
  } else {
    report = {
      icon: Mail,
      label: "Email when ready",
      tone: "amber",
    };
  }

  return { pay, analysis, report };
}

type CheckoutStatusTagProps = StatusChip;

export function CheckoutStatusTag({
  icon: Icon,
  label,
  tone,
}: CheckoutStatusTagProps) {
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
