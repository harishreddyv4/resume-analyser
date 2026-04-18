import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="border-t border-slate-200/60 py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 px-8 py-12 text-center shadow-surface-lg sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-slate-950/40 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.06)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(180deg,white,transparent_85%)]"
            aria-hidden
          />

          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Send a stronger resume this week
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-200 sm:text-lg">
              Upload, set your target role, and receive a structured report you
              can apply in one sitting—before your next application deadline.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/upload" variant="secondary">
                Get my report
              </ButtonLink>
              <ButtonLink href="/#pricing" variant="ghostOnDark">
                View pricing
              </ButtonLink>
            </div>
            <p className="mx-auto mt-6 max-w-md text-xs font-medium text-slate-400">
              Reports are guidance, not a guarantee of interviews. Results vary
              by role and market.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
