"use client";

import React from "react";
import Link from "next/link";

const LINKS = [
  { label: "CMHC insurance",    sub: "How much it costs",     href: "/cmhc-calculator",      color: "green" },
  { label: "Land transfer tax", sub: "All provinces",          href: "/land-transfer-tax",    color: "green" },
  { label: "Affordability",     sub: "How much can I borrow?", href: "/affordability",        color: "green" },
  { label: "Rate history",      sub: "BoC 2023–2026",          href: "/mortgage-rates",       color: "green" },
  { label: "Break penalty",     sub: "Cost to exit early",      href: "/mortgage-break-penalty", color: "stone" },
  { label: "First-time buyer",  sub: "Programs & rebates",     href: "/first-time-buyer",     color: "stone" },
  { label: "Glossary",          sub: "Every term explained",   href: "/glossary",             color: "stone" },
  { label: "Current rates",     sub: "Best available today",   href: "/mortgage-rates",       color: "stone" },
];

const ICONS: Record<string, React.ReactNode> = {
  "/cmhc-calculator":      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  "/land-transfer-tax":    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  "/affordability":        <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  "/mortgage-rates":       <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  "/mortgage-stress-test": <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
  "/first-time-buyer":     <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  "/glossary":             <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
};

export default function FeatureDiscovery() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 rounded-t-2xl" style={{ background: "var(--cream)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>
          Explore more
        </p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LINKS.map(({ label, sub, href, color }) => {
          const isGreen = color === "green";
          return (
            <Link key={label} href={href}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all hover:opacity-90"
              style={isGreen
                ? { background: "var(--green-light)", border: "1px solid var(--green-border)" }
                : { background: "var(--cream)", border: "1px solid var(--cream-dark)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="mt-0.5 shrink-0"
                style={{ color: isGreen ? "var(--green)" : "var(--ink-faint)" }}
                aria-hidden="true">
                {ICONS[href] ?? <circle cx="12" cy="12" r="10"/>}
              </svg>
              <div>
                <p className="text-xs font-semibold leading-tight"
                  style={{ color: isGreen ? "var(--green)" : "var(--ink-mid)" }}>{label}</p>
                <p className="text-xs mt-0.5"
                  style={{ color: isGreen ? "var(--green-mid)" : "var(--ink-faint)" }}>{sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
