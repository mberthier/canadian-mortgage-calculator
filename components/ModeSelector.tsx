"use client";

import React from "react";
import { MortgageMode } from "@/lib/types";

interface Props {
  mode: MortgageMode;
  onChange: (mode: MortgageMode) => void;
}

const MODES: { value: MortgageMode; label: string; sub: string }[] = [
  { value: "purchase",  label: "Purchase",  sub: "Buying a home"       },
  { value: "renewal",   label: "Renewal",   sub: "Same lender / switch"},
  { value: "refinance", label: "Refinance", sub: "New terms or equity" },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl" style={{ background: "#eeeeee" }}>
      {MODES.map((m) => {
        const active = mode === m.value;
        return (
          <button key={m.value} onClick={() => onChange(m.value)}
            className="rounded-lg py-2 px-1 text-center transition-all"
            style={active ? {
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            } : {}}>
            <p className="text-xs font-semibold" style={{ color: active ? "var(--green)" : "var(--ink-muted)" }}>
              {m.label}
            </p>
            <p className="text-xs mt-0.5 hidden sm:block" style={{ color: "var(--ink-faint)", opacity: active ? 1 : 0.6 }}>
              {m.sub}
            </p>
          </button>
        );
      })}
    </div>
  );
}
