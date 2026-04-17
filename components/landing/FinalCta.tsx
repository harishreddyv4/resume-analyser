import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Send a stronger resume this week
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-300 sm:text-lg">
            Upload, set your target role, and receive a structured report you
            can apply in one sitting—before your next application deadline.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/upload" variant="secondary">
              Get my report
            </ButtonLink>
            <ButtonLink href="/#pricing" variant="ghost" className="text-white hover:text-white border-white/20 hover:border-white/40 hover:bg-white/5">
              View pricing
            </ButtonLink>
          </div>
          <p className="mx-auto mt-6 max-w-md text-xs font-medium text-zinc-400">
            Reports are guidance, not a guarantee of interviews. Results vary
            by role and market.
          </p>
        </div>
      </Container>
    </section>
  );
}
