import { Container } from "@/components/layout/Container";

export default function SubmissionReportLoading() {
  return (
    <main className="min-h-[60vh] border-b border-zinc-100 bg-white">
      <Container className="max-w-3xl py-24 text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"
          aria-hidden
        />
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-zinc-900">
          Loading your report
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Preparing your analysis sections...
        </p>
      </Container>
    </main>
  );
}
