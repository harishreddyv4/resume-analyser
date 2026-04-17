"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { safeResponseJson } from "@/lib/http/safe-response-json";
import { loadRazorpayCheckoutScript } from "@/lib/razorpay/load-checkout-script";
import type {
  RazorpayCheckoutOptions,
  RazorpayInstance,
  RazorpaySuccessResponse,
} from "@/types/razorpay-checkout";
import type { UserSubmission } from "@/types/submission";

/** Client-visible hint to show dev skip UI (server still requires `RAZORPAY_DEV_SKIP_PAYMENT=1`). */
const showDevSkipPaymentUi =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_RAZORPAY_DEV_SKIP_PAYMENT === "1";

type Phase = "loading" | "ready" | "error";

type CreateOrderResponse =
  | {
      alreadyPaid: true;
      submissionId: string;
    }
  | {
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
      submissionId: string;
      customerName: string;
      customerEmail: string;
      planLabel: string;
    };

const MIN_LOAD_MS = 800;

function submissionIdFromParams(
  raw: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

function canUseRazorpayCheckout(submission: UserSubmission): boolean {
  const { status, paymentStatus } = submission;
  if (status === "failed" && paymentStatus === "pending") {
    return false;
  }
  return (
    status === "awaiting_payment" ||
    status === "payment_processing" ||
    (status === "failed" && paymentStatus === "failed")
  );
}

function resumeExtractionBlockedMessage(
  submission: UserSubmission,
): string | null {
  if (submission.status === "failed" && submission.paymentStatus === "pending") {
    return (
      "We could not read text from your resume file. Try uploading a PDF or Word " +
      "document, or export again from your editor, then start a new submission from upload."
    );
  }
  return null;
}

export function SubmissionPrepClient() {
  const router = useRouter();
  const params = useParams();
  const submissionId = submissionIdFromParams(params.submissionId);
  const [phase, setPhase] = useState<Phase>("loading");
  const [submission, setSubmission] = useState<UserSubmission | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [devSkipBusy, setDevSkipBusy] = useState(false);
  const [payHint, setPayHint] = useState<string | null>(null);

  const reloadSubmission = useCallback(async () => {
    if (!submissionId) {
      return;
    }
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      setSubmission((await res.json()) as UserSubmission);
    }
  }, [submissionId]);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function run() {
      if (!submissionId) {
        if (!cancelled) {
          setMessage("Missing submission reference.");
          setPhase("error");
        }
        return;
      }

      try {
        const res = await fetch(`/api/submissions/${submissionId}`, {
          method: "GET",
          cache: "no-store",
        });
        const elapsed = Date.now() - started;
        const wait = Math.max(0, MIN_LOAD_MS - elapsed);
        await new Promise((r) => setTimeout(r, wait));
        if (cancelled) {
          return;
        }
        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as { error?: string } | null;
          setMessage(err?.error ?? "Something went wrong.");
          setPhase("error");
          return;
        }
        const body = (await res.json()) as UserSubmission;
        setSubmission(body);
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setMessage("Could not load your submission.");
          setPhase("error");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  const redirectToSuccess = useCallback(
    (sub: UserSubmission) => {
      const q = new URLSearchParams({
        plan: sub.plan.id,
        submissionId: sub.id,
      });
      const role = sub.targetRole?.trim();
      if (role) {
        q.set("role", role.slice(0, 200));
      }
      router.push(`/checkout/success?${q.toString()}`);
    },
    [router],
  );

  const handlePay = useCallback(async () => {
    if (!submission || !submissionId) {
      return;
    }
    setPayHint(null);
    setMessage(null);
    setPayBusy(true);
    try {
      setPayHint("Starting secure checkout…");
      let orderRes: Response;
      try {
        orderRes = await fetch("/api/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId }),
        });
      } catch {
        setMessage(
          "We could not reach the payment server. Check your connection and try again.",
        );
        return;
      }
      const orderParsed = await safeResponseJson(orderRes);
      const orderJson = (
        orderParsed.ok ? orderParsed.data : null
      ) as (CreateOrderResponse & { error?: string }) | null;

      if (!orderRes.ok) {
        const errText =
          orderJson && typeof orderJson === "object" && "error" in orderJson
            ? String((orderJson as { error?: unknown }).error ?? "")
            : "";
        setMessage(errText || "Could not start payment.");
        return;
      }

      if (!orderJson || typeof orderJson !== "object") {
        setMessage("Unexpected response from payment server.");
        return;
      }

      if ("alreadyPaid" in orderJson && orderJson.alreadyPaid) {
        await reloadSubmission();
        redirectToSuccess(submission);
        return;
      }

      if (!("orderId" in orderJson) || !orderJson.keyId) {
        setMessage("Unexpected response from payment server.");
        return;
      }

      try {
        await loadRazorpayCheckoutScript();
      } catch {
        setMessage(
          "Payment script could not load. Check your connection or ad blockers and try again.",
        );
        return;
      }
      const RZP = window.Razorpay;
      if (!RZP) {
        setMessage("Payment script did not load. Disable blockers and try again.");
        return;
      }

      setPayHint("Complete payment in the Razorpay window…");

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        const fail = (err: Error) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        };

        const options: RazorpayCheckoutOptions = {
          key: orderJson.keyId,
          currency: orderJson.currency,
          order_id: orderJson.orderId,
          name: "Resume Analyzer",
          description: `${submission.plan.name} — ${submission.plan.priceLabel}`,
          prefill: {
            name: orderJson.customerName,
            email: orderJson.customerEmail,
          },
          theme: { color: "#18181b" },
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              setPayBusy(true);
              setPayHint("Confirming payment…");
              const confirmRes = await fetch("/api/payments/razorpay/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  submissionId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const confirmParsed = await safeResponseJson(confirmRes);
              const confirmJson = (
                confirmParsed.ok ? confirmParsed.data : null
              ) as { ok?: boolean; error?: string } | null;
              if (!confirmRes.ok) {
                const errText =
                  confirmJson && typeof confirmJson === "object"
                    ? String(confirmJson.error ?? "")
                    : "";
                setMessage(
                  errText ||
                    "Payment could not be confirmed. If money was debited, contact support with your reference.",
                );
                fail(new Error("confirm_failed"));
                return;
              }
              await reloadSubmission();
              redirectToSuccess(submission);
              settle();
            } catch {
              setMessage("Could not confirm payment. Please try again.");
              fail(new Error("confirm_error"));
            }
          },
          modal: {
            ondismiss: () => {
              setPayHint(null);
              setMessage(
                "Payment was not completed. You can try again whenever you are ready.",
              );
              settle();
            },
          },
        };

        const instance: RazorpayInstance = new RZP(options);
        instance.on("payment.failed", (res: unknown) => {
          let errMsg =
            "Payment failed. Try another method or contact your bank.";
          if (
            typeof res === "object" &&
            res !== null &&
            "error" in res &&
            typeof (res as { error?: { description?: string } }).error
              ?.description === "string"
          ) {
            errMsg = (res as { error: { description: string } }).error
              .description;
          }
          setMessage(errMsg);
          fail(new Error("payment_failed"));
        });

        instance.open();
      });
    } catch {
      console.error("[checkout] unexpected error");
    } finally {
      setPayBusy(false);
      setPayHint(null);
    }
  }, [reloadSubmission, redirectToSuccess, submission, submissionId]);

  const handleDevSkipPayment = useCallback(async () => {
    if (!submission || !submissionId) {
      return;
    }
    if (!showDevSkipPaymentUi) {
      return;
    }
    setMessage(null);
    setPayHint(null);
    setDevSkipBusy(true);
    try {
      const res = await fetch("/api/payments/razorpay/dev-skip-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; alreadyPaid?: boolean }
        | null;
      if (!res.ok) {
        setMessage(
          typeof data?.error === "string" && data.error.trim()
            ? data.error.trim()
            : res.status === 404
              ? "Dev skip is not enabled on the server. Set RAZORPAY_DEV_SKIP_PAYMENT=1 in .env.local and restart npm run dev."
              : "Could not skip payment for this submission.",
        );
        return;
      }
      await reloadSubmission();
      redirectToSuccess(submission);
    } catch {
      setMessage("Could not skip payment. Try again.");
    } finally {
      setDevSkipBusy(false);
    }
  }, [reloadSubmission, redirectToSuccess, submission, submissionId]);

  if (phase === "loading") {
    return (
      <Container className="max-w-lg py-24 text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"
          aria-hidden
        />
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-zinc-900">
          Preparing your checkout
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Securing your submission…
        </p>
      </Container>
    );
  }

  if (phase === "error") {
    return (
      <Container className="max-w-lg py-24 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          We could not open this submission
        </h1>
        <p className="mt-3 text-sm text-zinc-600">{message}</p>
        <Link
          href="/upload"
          className="mt-8 inline-block text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline"
        >
          Back to upload
        </Link>
      </Container>
    );
  }

  if (!submission) {
    return null;
  }

  const payEnabled = canUseRazorpayCheckout(submission);
  const extractionBlocked = resumeExtractionBlockedMessage(submission);

  return (
    <Container className="max-w-lg py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Next step
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
        Submission received
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Reference <span className="font-mono text-xs">{submission.id}</span>
        · {submission.plan.name} ({submission.plan.priceLabel})
      </p>
      <div className="mt-10 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left text-sm text-zinc-700">
        <p>
          Status:{" "}
          <span className="font-semibold text-zinc-900">
            {submission.status.replace(/_/g, " ")}
          </span>
        </p>
        {payHint ? (
          <p className="text-xs font-medium text-zinc-600" aria-live="polite">
            {payHint}
          </p>
        ) : null}
        {extractionBlocked ? (
          <p className="text-xs font-medium text-amber-900" role="status">
            {extractionBlocked}
          </p>
        ) : null}
        {message ? (
          <p className="text-xs font-medium text-red-700" role="alert">
            {message}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-zinc-500">
            Pay securely with Razorpay (UPI, cards, netbanking). Your analysis
            starts after payment is confirmed.
          </p>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          disabled={!payEnabled || payBusy || devSkipBusy}
          className="w-full sm:w-auto"
          onClick={() => void handlePay()}
        >
          {payBusy ? "Please wait…" : "Pay with Razorpay"}
        </Button>
        <Link
          href="/upload"
          className="text-center text-sm font-semibold text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline sm:text-left"
        >
          Edit and resubmit
        </Link>
      </div>
      {showDevSkipPaymentUi && payEnabled ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Local testing only
          </p>
          <p className="mt-2 text-xs leading-relaxed text-amber-950/80">
            Skip Razorpay and mark this submission paid so you can test checkout
            success and report generation. Requires{" "}
            <span className="font-mono">RAZORPAY_DEV_SKIP_PAYMENT=1</span> in{" "}
            <span className="font-mono">.env.local</span>. Never enabled on production
            deploys.
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={payBusy || devSkipBusy}
            className="mt-4 w-full sm:w-auto"
            onClick={() => void handleDevSkipPayment()}
          >
            {devSkipBusy ? "Skipping…" : "Skip payment (dev)"}
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
