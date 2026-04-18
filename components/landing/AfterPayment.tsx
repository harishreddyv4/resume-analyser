import { Container } from "@/components/layout/Container";
import { afterPaymentItems } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { FileCheck2 } from "lucide-react";

export function AfterPayment() {
  return (
    <section
      id="after-payment"
      className="scroll-mt-24 border-y border-slate-200/60 bg-white/90 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="After payment"
          title="What lands in your inbox"
          description="Every tier delivers a single report you can act on immediately. Higher tiers add depth and JD matching."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {afterPaymentItems.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-surface transition-shadow duration-200 hover:shadow-surface-lg"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 ring-1 ring-cyan-100/80">
                <FileCheck2
                  className="h-5 w-5 text-cyan-800"
                  aria-hidden
                />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-xs font-medium text-slate-500">
          Exact layout may vary by tier; Job Match unlocks JD-specific sections.
        </p>
      </Container>
    </section>
  );
}
