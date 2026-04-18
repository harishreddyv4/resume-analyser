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
    <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/80 p-12 text-center text-sm text-slate-500">
      Loading…
    </div>
  );
}

export default function UploadPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl"
          aria-hidden
        />
        <Container className="relative py-10 sm:py-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800/90">
            <span
              className="h-px w-8 bg-gradient-to-r from-cyan-600/60 to-transparent"
              aria-hidden
            />
            Resume Analyzer
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            <span className="text-gradient-brand">Upload your resume</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Complete the form once. Your summary updates as you go on desktop.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href="/#pricing"
              className="font-semibold text-cyan-900 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
            >
              Compare plans
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              ·
            </span>
            <Link
              href="/"
              className="font-semibold text-cyan-900 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
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
