"use client";

import React, { useEffect, useState } from "react";
import { RATE_PRESETS } from "@/lib/constants";
import { MortgageInputs } from "@/lib/types";

interface Props {
  inputs:   MortgageInputs;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

export default function RatePresets({ inputs, setField }: Props) {
  const [presets, setPresets]           = useState(RATE_PRESETS);
  const [updatedLabel, setUpdatedLabel] = useState("Apr 9, 2026");

  useEffect(() => {
    fetch("/api/rates")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.presets?.length) setPresets(data.presets);
        if (data?.updatedLabel)    setUpdatedLabel(data.updatedLabel);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
          Today's best rates
        </p>
        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
          via brokers · {updatedLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const isActive = inputs.interestRate === p.rate && inputs.termYears === p.term;
          return (
            <button key={p.label}
              onClick={() => { setField("interestRate", p.rate); setField("termYears", p.term); }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={isActive ? {
                background: "var(--green)", color: "#fff", borderColor: "var(--green)",
              } : p.type === "variable" ? {
                background: "#fef3c7", color: "#92400e", borderColor: "#fde68a",
              } : {
                background: "#fff", color: "var(--ink-mid)", borderColor: "#e7e5e4",
              }}>
              {p.label} <span className="font-semibold ml-0.5">{p.rate}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
