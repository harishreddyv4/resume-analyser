import { Container } from "@/components/layout/Container";
import { testimonialPlaceholder } from "@/lib/site";
import { Quote } from "lucide-react";

export function Testimonials() {
  const t = testimonialPlaceholder;

  return (
    <section
      id="testimonial"
      className="scroll-mt-24 border-t border-slate-200/60 bg-slate-50/80 py-16 sm:py-20"
    >
      <Container>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-cyan-50/30 p-8 shadow-surface-lg sm:p-10">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/15 blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-900/80">
                Social proof
              </p>
              <span className="rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-1 text-xs font-semibold text-amber-900">
                {t.badge}
              </span>
            </div>
            <Quote
              className="mt-6 h-8 w-8 text-cyan-200"
              aria-hidden
            />
            <blockquote className="mt-4 text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
              {t.quote}
            </blockquote>
            <footer className="mt-6 border-t border-slate-200/80 pt-6">
              <p className="text-sm font-semibold text-slate-900">{t.name}</p>
              <p className="mt-1 text-sm text-slate-600">{t.role}</p>
            </footer>
          </div>
        </div>
      </Container>
    </section>
  );
}
