import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <BrandLogo className="h-9 w-auto shrink-0" priority />
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 sm:text-base">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <details className="relative md:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-900/5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
              >
                Admin
              </Link>
            </div>
          </details>

          <Link
            href="/upload"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 sm:px-4"
          >
            <span className="hidden sm:inline">Analyze resume</span>
            <span className="sm:hidden">Upload</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
