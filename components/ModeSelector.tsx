"use client";

import React from "react";
import { MortgageMode } from "@/lib/types";

interface Props {
  mode:     MortgageMode;
  onChange: (mode: MortgageMode) => void;
}

const MODES: {
  value:   MortgageMode;
  label:   string;
  tagline: string;
  desc:    string;
  icon:    React.ReactNode;
}[] = [
  {
    value:   "purchase",
    label:   "Purchase",
    tagline: "Buying a home",
    desc:    "See your real payment, CMHC costs, land transfer tax, and total upfront cash. Know the full picture before you make an offer.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    value:   "renewal",
    label:   "Renewal",
    tagline: "Term ending soon",
    desc:    "Your lender's renewal offer is rarely their best. Compare rates, see your payment change, and decide whether to stay or switch — you can now switch lenders at renewal without re-qualifying.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
      </svg>
    ),
  },
  {
    value:   "refinance",
    label:   "Refinance",
    tagline: "Access equity or lower your rate",
    desc:    "Restructure your existing mortgage to get a better rate, access home equity, or consolidate debt. Understand the break penalty cost before committing.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      {MODES.map((m) => {
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className="text-left rounded-2xl p-5 transition-all border-2"
            style={active ? {
              borderColor: "var(--green)",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(16,104,168,0.10)",
            } : {
              borderColor: "#e8e8e8",
              background: "#fff",
            }}
          >
            {/* Icon + label row */}
            <div className="flex items-start justify-between mb-3">
              <span style={{ color: active ? "var(--green)" : "var(--ink-faint)" }}>
                {m.icon}
              </span>
              {active && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--green)" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>

            <p className="font-semibold text-sm mb-0.5"
              style={{ color: active ? "var(--ink)" : "var(--ink-mid)" }}>
              {m.label}
            </p>
            <p className="text-xs font-medium mb-2"
              style={{ color: active ? "var(--green)" : "var(--ink-faint)" }}>
              {m.tagline}
            </p>
            <p className="text-xs leading-relaxed"
              style={{ color: "var(--ink-muted)" }}>
              {m.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
