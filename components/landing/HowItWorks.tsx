import { Container } from "@/components/layout/Container";
import { howItWorks } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Upload, target role, report"
          description="Three steps. No account maze—just the inputs we need to generate a useful report."
        />
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {howItWorks.map((item) => (
            <li
              key={item.step}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Step {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
