"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function SubmissionReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] border-b border-zinc-100 bg-white">
      <Container className="max-w-3xl py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          We could not load this report
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          The report is temporarily unavailable. Please try again.
        </p>
        <div className="mt-8">
          <Button type="button" onClick={() => reset()}>
            Retry
          </Button>
        </div>
      </Container>
    </main>
  );
}
