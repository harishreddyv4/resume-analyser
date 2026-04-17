import { Container } from "@/components/layout/Container";
import { plans, pricingFootnote } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-16 sm:py-20">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title="Pick depth once—upgrade before checkout if plans change"
          description="All tiers include an AI report with ATS feedback and rewrites. Pay once per report; no subscription."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.featured
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/10"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {plan.featured ? (
                <p className="absolute -top-3 left-6 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900">
                  Best value
                </p>
              ) : null}
              <h3
                className={`text-lg font-semibold ${
                  plan.featured ? "text-white" : "text-zinc-900"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  plan.featured ? "text-zinc-200" : "text-zinc-600"
                }`}
              >
                {plan.description}
              </p>
              <p
                className={`mt-3 text-xs font-medium leading-snug ${
                  plan.featured ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {plan.outcome}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-semibold tracking-tight ${
                    plan.featured ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm font-medium ${
                    plan.featured ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {plan.cadence}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.highlights.map((line) => (
                  <li key={line} className="flex gap-2 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.featured ? "text-emerald-300" : "text-emerald-600"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={
                        plan.featured ? "text-zinc-100" : "text-zinc-700"
                      }
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink
                  href={plan.href}
                  variant={plan.featured ? "secondary" : "primary"}
                  className="w-full"
                >
                  {plan.cta}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-medium text-zinc-500">
          {pricingFootnote}
        </p>
      </Container>
    </section>
  );
}
