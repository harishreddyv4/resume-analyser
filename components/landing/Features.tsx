import { Container } from "@/components/layout/Container";
import { features } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { CheckCircle2 } from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-slate-200/60 bg-slate-50/80 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Inside the report"
          description="Focused signals hiring tools and humans react to first—stated plainly, without filler."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-surface-lg"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 ring-1 ring-cyan-100/80 transition-colors group-hover:bg-cyan-100/60">
                <CheckCircle2
                  className="h-5 w-5 text-cyan-700"
                  aria-hidden
                />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
