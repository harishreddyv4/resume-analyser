import { Container } from "@/components/layout/Container";
import { faqs } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-zinc-200 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Straight answers"
          description="If you need something else, reach out once support goes live—we respond quickly."
        />
        <div className="mt-10 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
          {faqs.map((item) => (
            <details key={item.q} className="group p-6 sm:p-7">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="mt-1 text-zinc-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
