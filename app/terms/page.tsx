import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms governing use of Resume Analyzer.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updatedLabel="April 2026">
      <section>
        <h2 className="text-base font-semibold text-zinc-900">Service scope</h2>
        <p className="mt-2">
          Resume Analyzer provides AI-assisted resume feedback and suggestions.
          Reports are informational and do not guarantee interviews, offers, or
          employment outcomes.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">User responsibilities</h2>
        <p className="mt-2">
          You are responsible for the accuracy and legality of submitted
          documents and for reviewing all report output before use.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Payments</h2>
        <p className="mt-2">
          Payments are processed through third-party payment partners. By
          purchasing, you agree to their processing terms in addition to ours.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Liability limits</h2>
        <p className="mt-2">
          To the extent permitted by law, Resume Analyzer is not liable for
          indirect or consequential damages arising from service use.
        </p>
      </section>
    </LegalPage>
  );
}
