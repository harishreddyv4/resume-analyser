import { Container } from "@/components/layout/Container";
import { plans, pricingFootnote } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-t border-slate-200/60 py-16 sm:py-20"
    >
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
              className={`relative flex flex-col rounded-2xl border p-7 transition-shadow duration-200 ${
                plan.featured
                  ? "border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-800 to-cyan-950 text-white shadow-surface-lg ring-1 ring-cyan-500/20"
                  : "border-slate-200/80 bg-white/90 shadow-surface hover:shadow-surface-lg"
              }`}
            >
              {plan.featured ? (
                <p className="absolute -top-3 left-6 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-900">
                  Best value
                </p>
              ) : null}
              <h3
                className={`text-lg font-semibold ${
                  plan.featured ? "text-white" : "text-slate-900"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  plan.featured ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {plan.description}
              </p>
              <p
                className={`mt-3 text-xs font-medium leading-snug ${
                  plan.featured ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {plan.outcome}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-semibold tracking-tight ${
                    plan.featured ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm font-medium ${
                    plan.featured ? "text-cyan-100" : "text-slate-500"
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
                        plan.featured
                          ? "text-cyan-300"
                          : "text-cyan-600"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={
                        plan.featured ? "text-slate-100" : "text-slate-700"
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
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-medium text-slate-500">
          {pricingFootnote}
        </p>
      </Container>
    </section>
  );
}
