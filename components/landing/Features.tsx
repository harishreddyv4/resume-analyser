import { Container } from "@/components/layout/Container";
import { features } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { CheckCircle2 } from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-zinc-50 py-16 sm:py-20"
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
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                aria-hidden
              />
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
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
