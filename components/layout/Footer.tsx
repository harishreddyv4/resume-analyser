import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
            >
              <BrandLogo className="h-8 w-auto shrink-0" />
              <span className="text-sm font-semibold text-zinc-900">{site.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {site.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Product
              </p>
              <ul className="mt-3 space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/upload"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Upload
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Company
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="mailto:support@resume-analyzer.app"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Admin
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="text-xs sm:text-sm">
            Results are guidance, not guarantees of hiring outcomes.
          </p>
        </div>
      </Container>
    </footer>
  );
}
