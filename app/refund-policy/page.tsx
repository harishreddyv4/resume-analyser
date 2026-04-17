import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund terms for Resume Analyzer purchases.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updatedLabel="April 2026">
      <section>
        <h2 className="text-base font-semibold text-zinc-900">When refunds apply</h2>
        <p className="mt-2">
          If we fail to deliver your report due to a confirmed technical fault,
          we will either resolve the issue or issue a refund.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">After delivery</h2>
        <p className="mt-2">
          Once a report is delivered, purchases are generally non-refundable
          because analysis output has been generated and consumed.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">How to request support</h2>
        <p className="mt-2">
          Contact support with your submission ID, payment details, and issue
          description for review.
        </p>
      </section>
    </LegalPage>
  );
}
