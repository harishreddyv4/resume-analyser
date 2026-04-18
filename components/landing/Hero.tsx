import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { heroStats, heroTrustLine, site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80">
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-slate-900/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-cyan-600/10 blur-2xl"
        aria-hidden
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800/90">
            <span
              className="h-px w-8 bg-gradient-to-r from-cyan-600/70 to-transparent"
              aria-hidden
            />
            AI resume report
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
            <span className="text-gradient-brand">{site.tagline}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            {site.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/upload">Get my report</ButtonLink>
            <ButtonLink href="/#pricing" variant="secondary">
              Compare plans
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-2xl text-sm font-medium text-slate-500">
            {heroTrustLine}
          </p>
          <dl className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="surface-elevated p-4 transition-shadow duration-200 hover:shadow-surface-lg"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
