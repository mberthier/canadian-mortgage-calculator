"use client";

import React from "react";

const FEATURES = [
  {
    label: "What if rates rise?",
    sub: "At renewal",
    anchor: "stress-test",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    label: "What if you got a better rate?",
    sub: "Compare two scenarios",
    anchor: "scenario-comparison",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    label: "Can you actually qualify?",
    sub: "GDS & TDS check",
    anchor: "affordability",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    label: "What does leaving cost?",
    sub: "Break penalty estimate",
    anchor: "break-penalty",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function FeatureDiscovery() {
  const scrollTo = (anchor: string) => {
    // The sections are rendered below — we scroll the page to the relevant component
    // by looking for a data-section attribute we'll add to each
    const el = document.querySelector(`[data-section="${anchor}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-xl border border-stone-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--ink-faint)" }}>
        Also included below ↓
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FEATURES.map(({ label, sub, anchor, icon }) => (
          <button
            key={anchor}
            onClick={() => scrollTo(anchor)}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all hover:scale-[1.02]"
            style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}
          >
            <span className="mt-0.5 shrink-0" style={{ color: "var(--green)" }}>{icon}</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--green)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--green-mid)" }}>{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
