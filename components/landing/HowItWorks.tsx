import { Container } from "@/components/layout/Container";
import { howItWorks } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-slate-200/60 py-16 sm:py-20"
    >
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
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-surface transition-all duration-200 hover:shadow-surface-lg sm:p-7"
            >
              <span
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/5 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              />
              <div className="relative flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-800 text-xs font-bold tracking-wider text-white shadow-surface">
                  {item.step}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
