import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Resume Analyzer collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedLabel="April 2026">
      <section>
        <h2 className="text-base font-semibold text-zinc-900">What we collect</h2>
        <p className="mt-2">
          We collect your name, email address, uploaded resume content, selected
          plan, and optional job description to generate your report and support
          your submission.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">How we use data</h2>
        <p className="mt-2">
          We use this data only to process payments, generate analysis reports,
          and deliver report notifications. We do not sell your personal data.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Storage and retention</h2>
        <p className="mt-2">
          Submission data and reports are stored on our infrastructure providers
          for service delivery and audit needs. You may request deletion by
          contacting support.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Security</h2>
        <p className="mt-2">
          We use server-side controls and access restrictions for sensitive
          operations. No system is perfectly secure, but we follow reasonable
          safeguards to reduce risk.
        </p>
      </section>
    </LegalPage>
  );
}
