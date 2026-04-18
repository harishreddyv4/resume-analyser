import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300">
      <Container className="py-14">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500/50"
            >
              <BrandLogo className="h-8 w-auto shrink-0 opacity-95" />
              <span className="text-sm font-semibold text-white">{site.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {site.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Product
              </p>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/upload"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Upload
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Company
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href="mailto:support@resume-analyzer.app"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Admin
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-slate-800/90 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="text-xs sm:text-sm text-slate-500">
            Results are guidance, not guarantees of hiring outcomes.
          </p>
        </div>
      </Container>
    </footer>
  );
}
