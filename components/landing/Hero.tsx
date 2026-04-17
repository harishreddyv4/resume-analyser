import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { heroStats, heroTrustLine, site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            AI resume report
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.1]">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-600 sm:text-xl">
            {site.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/upload">Get my report</ButtonLink>
            <ButtonLink href="/#pricing" variant="secondary">
              Compare plans
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-2xl text-sm font-medium text-zinc-500">
            {heroTrustLine}
          </p>
          <dl className="mt-10 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-900">
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
