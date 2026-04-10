"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",                     label: "Calculator"    },
  { href: "/affordability",        label: "Affordability" },
  { href: "/cmhc-calculator",      label: "CMHC"          },
  { href: "/land-transfer-tax",    label: "Land Transfer" },
  { href: "/mortgage-stress-test", label: "Stress Test"   },
  { href: "/first-time-buyer",     label: "First-Time"    },
  { href: "/mortgage-rates",       label: "Rates"         },
  { href: "/glossary",             label: "Glossary"      },
];

interface Props {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20" style={{ borderColor: "var(--cream-dark)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--green)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="11" r="4"/>
                  <path d="M12 11h8M18 11v3M15 11v2"/>
                </svg>
              </div>
              <span className="font-semibold text-stone-900 tracking-tight" style={{ fontSize: "15px" }}>CrystalKey</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto" aria-label="Main navigation">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  style={isActive(href)
                    ? { background: "var(--green-light)", color: "var(--green)" }
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
                    ? { background: "var(--green-light)", color: "var(--green)" }
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
      <footer className="border-t mt-16" style={{ borderColor: "var(--cream-dark)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--green)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="11" r="4"/>
                    <path d="M12 11h8M18 11v3M15 11v2"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-stone-800">CrystalKey</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                Crystal clear mortgage calculations for Canadians.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Calculators</p>
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
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Guides</p>
              <ul className="space-y-2">
                {[
                  { href: "/first-time-buyer", label: "First-Time Buyers" },
                  { href: "/mortgage-stress-test", label: "Stress Test" },
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
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Legal</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                Estimates only. Not financial advice. Always consult a licensed mortgage broker before making real estate decisions.
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
                © {new Date().getFullYear()} CrystalKey
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
