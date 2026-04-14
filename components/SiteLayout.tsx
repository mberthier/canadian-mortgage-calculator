"use client";

import React from "react";
import Link from "next/link";
import Wordmark from "./Wordmark";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",                        label: "Calculator"          },
  { href: "/affordability",           label: "Affordability"       },
  { href: "/cmhc-calculator",         label: "CMHC"                },
  { href: "/land-transfer-tax",       label: "Land Transfer"       },
  { href: "/mortgage-break-penalty",  label: "Break Penalty"       },
  { href: "/first-time-buyer",        label: "First-Time"          },
  { href: "/mortgage-rates",          label: "Rates"               },
  { href: "/glossary",                label: "Glossary"            },
];

interface Props {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20" style={{ borderColor: "#e8e8e8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center shrink-0">
              <Wordmark size="nav" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto ml-6 pl-6 border-l border-neutral-200" aria-label="Main navigation">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  style={isActive(href)
                    ? { background: "#eff6ff", color: "#1068A8", fontWeight: 600 }
                    : { color: "var(--ink-muted)" }}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile nav — first 5 only */}
            <nav className="flex lg:hidden items-center gap-0.5 overflow-x-auto" aria-label="Mobile navigation">
              {NAV_LINKS.slice(0, 5).map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0"
                  style={isActive(href)
                    ? { background: "#eff6ff", color: "#1068A8", fontWeight: 600 }
                    : { color: "var(--ink-muted)" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ borderColor: "#e8e8e8", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-3">
                <Wordmark size="footer" />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                <em style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "13px" }}>
                  Crystal clear mortgage calculations for Canadians.
                </em>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-mid)" }}>Calculators</p>
              <ul className="space-y-2">
                {[
                  { href: "/", label: "Mortgage Calculator" },
                  { href: "/affordability", label: "Affordability" },
                  { href: "/cmhc-calculator", label: "CMHC Insurance" },
                  { href: "/land-transfer-tax", label: "Land Transfer Tax" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-xs hover:underline transition-colors"
                      style={{ color: "var(--ink-faint)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-mid)" }}>Guides</p>
              <ul className="space-y-2">
                {[
                  { href: "/first-time-buyer", label: "First-Time Buyers" },
                  { href: "/mortgage-break-penalty", label: "Break Penalty" },
                  { href: "/mortgage-rates", label: "Rate History" },
                  { href: "/glossary", label: "Glossary" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-xs hover:underline transition-colors"
                      style={{ color: "var(--ink-faint)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-mid)" }}>Legal</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                Estimates only. Not financial advice. Always consult a licensed mortgage broker before making real estate decisions.
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
                © {new Date().getFullYear()} CrystalKey.ca
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
