import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { UploadWorkspaceForm } from "@/components/upload/UploadWorkspaceForm";

export const metadata: Metadata = {
  title: { absolute: "Upload your resume" },
  description:
    "Upload your resume, choose your target role and plan, and continue to checkout for your Resume Analyzer report.",
};

function UploadFallback() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center text-sm text-zinc-500">
      Loading…
    </div>
  );
}

export default function UploadPage() {
  return (
    <main>
      <section className="border-b border-zinc-200 bg-zinc-50 py-10 sm:py-14">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Resume Analyzer
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Upload your resume
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Complete the form once. Your summary updates as you go on desktop.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href="/#pricing"
              className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
            >
              Compare plans
            </Link>
            <span className="hidden text-zinc-300 sm:inline" aria-hidden>
              ·
            </span>
            <Link
              href="/"
              className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Suspense fallback={<UploadFallback />}>
            <UploadWorkspaceForm />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
