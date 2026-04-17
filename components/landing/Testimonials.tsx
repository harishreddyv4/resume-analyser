import { Container } from "@/components/layout/Container";
import { testimonialPlaceholder } from "@/lib/site";
import { Quote } from "lucide-react";

export function Testimonials() {
  const t = testimonialPlaceholder;

  return (
    <section
      id="testimonial"
      className="scroll-mt-24 border-t border-zinc-200 bg-zinc-50 py-16 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Social proof
            </p>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
              {t.badge}
            </span>
          </div>
          <Quote
            className="mt-6 h-8 w-8 text-zinc-300"
            aria-hidden
          />
          <blockquote className="mt-4 text-lg font-medium leading-relaxed text-zinc-900 sm:text-xl">
            {t.quote}
          </blockquote>
          <footer className="mt-6 border-t border-zinc-100 pt-6">
            <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
            <p className="mt-1 text-sm text-zinc-600">{t.role}</p>
          </footer>
        </div>
      </Container>
    </section>
  );
}
