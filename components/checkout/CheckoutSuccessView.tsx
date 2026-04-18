import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { site } from "@/lib/site";
import type { AnalysisStatus, PaymentLifecycleStatus } from "@/types/submission";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Mail, Sparkles, Timer, AlertCircle } from "lucide-react";

export type CheckoutSuccessFootnote =
  | "verified"
  /** Valid submission id + Supabase, but row missing or fetch error. */
  | "lookup_miss"
  /** No live row (bookmark, missing params, or Supabase not configured). */
  | "offline";

export type CheckoutSuccessViewProps = {
  firstName: string;
  fullName: string;
  emailDisplay: string;
  planName: string;
  planPrice: string;
  targetRole: string | null;
  referenceId: string;
  footnote: CheckoutSuccessFootnote;
  /** When set (verified submission), status chips reflect the database, not static copy. */
  livePaymentStatus?: PaymentLifecycleStatus;
  livePipelineStatus?: AnalysisStatus;
};

function StatusTag({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: "emerald" | "amber" | "sky" | "rose";
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

function statusChips(
  livePayment: PaymentLifecycleStatus | undefined,
  livePipeline: AnalysisStatus | undefined,
) {
  const hasLive = livePayment !== undefined && livePipeline !== undefined;
  if (!hasLive) {
    return {
      pay: { icon: CheckCircle2, label: "Payment received", tone: "emerald" as const },
      analysis: { icon: Timer, label: "Analysis queued", tone: "amber" as const },
      report: { icon: Mail, label: "Report will be emailed", tone: "sky" as const },
    };
  }
  const paid = livePayment === "paid";
  const pay = paid
    ? { icon: CheckCircle2, label: "Payment received", tone: "emerald" as const }
    : { icon: AlertCircle, label: "Payment not confirmed yet", tone: "amber" as const };

  let analysis: { icon: LucideIcon; label: string; tone: "emerald" | "amber" | "sky" | "rose" };
  if (!paid) {
    analysis = {
      icon: Timer,
      label: "Report after payment",
      tone: "amber",
    };
  } else if (livePipeline === "complete") {
    analysis = { icon: CheckCircle2, label: "Report ready", tone: "emerald" };
  } else if (livePipeline === "failed") {
    analysis = {
      icon: AlertCircle,
      label: "Report generation hit an error",
      tone: "rose",
    };
  } else if (livePipeline === "processing") {
    analysis = { icon: Timer, label: "Analyzing your resume", tone: "amber" };
  } else {
    analysis = { icon: Timer, label: "In the analysis queue", tone: "amber" };
  }

  let report: { icon: LucideIcon; label: string; tone: "emerald" | "amber" | "sky" | "rose" };
  if (!paid) {
    report = { icon: Mail, label: "We email you when the report is ready", tone: "sky" };
  } else if (livePipeline === "complete") {
    report = { icon: Mail, label: "You should have an email with the report", tone: "sky" };
  } else if (livePipeline === "failed") {
    report = { icon: Mail, label: "We will help over email if the report is stuck", tone: "amber" };
  } else {
    report = { icon: Mail, label: "We will email you when the report is ready", tone: "sky" };
  }

  return { pay, analysis, report };
}

export function CheckoutSuccessView({
  firstName,
  fullName,
  emailDisplay,
  planName,
  planPrice,
  targetRole,
  referenceId,
  footnote,
  livePaymentStatus,
  livePipelineStatus,
}: CheckoutSuccessViewProps) {
  const thankYouName =
    firstName && firstName !== "—" ? firstName : "there";
  const chips = statusChips(
    livePaymentStatus,
    livePipelineStatus,
  );
  const showFailureCallout =
    footnote === "verified" &&
    livePaymentStatus === "paid" &&
    livePipelineStatus === "failed";

  return (
    <main className="relative min-h-[85vh] overflow-hidden border-b border-zinc-200/60 bg-gradient-to-b from-stone-50 via-white to-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,113,108,0.12),transparent)]"
        aria-hidden
      />
      <section className="relative py-16 sm:py-24">
        <Container className="max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {site.name}
            </p>
            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] ring-1 ring-zinc-900/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner">
                <CheckCircle2 className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Thank you, {thankYouName}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-zinc-800 sm:text-base">
              Your resume has been received and is safely on file.
            </p>
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
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <StatusTag icon={chips.pay.icon} label={chips.pay.label} tone={chips.pay.tone} />
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
                    Our system parses your resume against your target role
                    {targetRole ? " and any job description you included" : ""}.
                  </li>
                  <li>
                    You will receive a detailed report with ATS-style feedback,
                    prioritized fixes, and suggested rewrites.
                  </li>
                  <li>
                    We will email you as soon as your report is ready—most
                    orders finish within minutes; occasionally it may take a bit
                    longer at peak times.
                  </li>
                </ol>
              </div>
            </div>

            <div className="pt-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Submission summary
              </h3>
              <dl className="mt-5 space-y-0 divide-y divide-zinc-100">
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Name
                  </dt>
                  <dd className="text-sm font-semibold text-zinc-900 sm:text-right">
                    {fullName}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Email
                  </dt>
                  <dd className="break-all text-sm font-semibold text-zinc-900 sm:text-right">
                    {emailDisplay}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Plan
                  </dt>
                  <dd className="text-sm font-semibold text-zinc-900 sm:text-right">
                    {planName}{" "}
                    <span className="font-normal text-zinc-500">· {planPrice}</span>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Target role
                  </dt>
                  <dd className="max-w-md text-sm font-semibold leading-snug text-zinc-900 sm:text-right">
                    {targetRole ?? "—"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Reference
                  </dt>
                  <dd className="font-mono text-xs font-medium text-zinc-600 sm:text-right">
                    {referenceId}
                  </dd>
                </div>
              </dl>
            </div>

            {footnote === "verified" ? (
              <p className="mt-6 text-center text-sm leading-relaxed text-zinc-500">
                You will hear from us at the email above. If you do not see a
                message within a reasonable time, check spam—or reach out through
                the contact options on our homepage.
              </p>
            ) : footnote === "lookup_miss" ? (
              <p className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
                We could not match this reference to an order in our system yet.
                If you just completed payment, wait a moment and refresh—or use
                the link from your confirmation email. Your bank or Razorpay
                receipt is proof of payment if you need support.
              </p>
            ) : (
              <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-950">
                We could not load live order details from our servers. If you
                opened this page directly, your confirmation email remains the
                source of truth—or return from the checkout link after payment.
              </p>
            )}
          </div>

          <div className="mx-auto mt-12 flex max-w-md flex-col items-stretch gap-3 sm:mx-auto sm:flex-row sm:justify-center">
            <ButtonLink href="/" className="w-full justify-center sm:w-auto sm:min-w-[200px]">
              Return to homepage
            </ButtonLink>
            <ButtonLink
              href="/upload"
              variant="secondary"
              className="w-full justify-center sm:w-auto"
            >
              Upload another resume
            </ButtonLink>
          </div>

          <p className="mx-auto mt-12 max-w-lg text-center text-xs leading-relaxed text-zinc-400">
            <Link
              href="/"
              className="font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
            >
              {site.name}
            </Link>
            {" · "}
            Private analysis. Your resume is used only to produce your report.
          </p>
        </Container>
      </section>
    </main>
  );
}
