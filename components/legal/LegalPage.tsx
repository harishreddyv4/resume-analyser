import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

export function LegalPage({
  eyebrow = "Legal",
  title,
  updatedLabel,
  children,
}: {
  eyebrow?: string;
  title: string;
  updatedLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="border-b border-zinc-100 bg-white py-14">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {updatedLabel}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
          {children}
        </div>
      </Container>
    </main>
  );
}
