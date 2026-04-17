import { Container } from "@/components/layout/Container";
import { afterPaymentItems } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { FileCheck2 } from "lucide-react";

export function AfterPayment() {
  return (
    <section
      id="after-payment"
      className="scroll-mt-24 border-y border-zinc-200 bg-white py-16 sm:py-20"
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
              className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-5"
            >
              <FileCheck2
                className="mt-0.5 h-5 w-5 shrink-0 text-zinc-700"
                aria-hidden
              />
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-xs font-medium text-zinc-500">
          Exact layout may vary by tier; Job Match unlocks JD-specific sections.
        </p>
      </Container>
    </section>
  );
}
