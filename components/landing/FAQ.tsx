import { Container } from "@/components/layout/Container";
import { faqs } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-slate-200/60 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Straight answers"
          description="If you need something else, reach out once support goes live—we respond quickly."
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-surface divide-y divide-slate-200/80">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group p-6 transition-colors open:bg-cyan-50/30 sm:p-7"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <ChevronDown
                    className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700/70 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
