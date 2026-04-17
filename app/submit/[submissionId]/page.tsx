import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmissionPrepClient } from "@/components/submit/SubmissionPrepClient";

export const metadata: Metadata = {
  title: { absolute: "Preparing checkout" },
  description: "Your submission is being prepared for payment.",
};

function SubmitFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-zinc-500">
      Loading…
    </div>
  );
}

export default function SubmitPreparationPage() {
  return (
    <main className="min-h-[60vh] border-b border-zinc-100 bg-white">
      <Suspense fallback={<SubmitFallback />}>
        <SubmissionPrepClient />
      </Suspense>
    </main>
  );
}
