import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-[0_1px_0_0_rgb(15_23_42/0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-600/50"
        >
          <BrandLogo className="h-9 w-auto shrink-0 transition-transform duration-200 group-hover:scale-[1.02]" priority />
          <span className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            {site.name}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-cyan-50/80 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <details className="relative md:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-xl border border-slate-200 bg-white/90 px-3 text-sm font-semibold text-slate-900 shadow-surface [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-surface-lg backdrop-blur-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50/80 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50/80 hover:text-slate-900"
              >
                Admin
              </Link>
            </div>
          </details>

          <Link
            href="/upload"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-3 text-sm font-semibold text-white shadow-surface transition-all duration-200 hover:shadow-surface-lg hover:brightness-105 sm:px-4"
          >
            <span className="hidden sm:inline">Analyze resume</span>
            <span className="sm:hidden">Upload</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
