"use client";

import React, { useState, useEffect, useRef } from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import Tooltip from "./Tooltip";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

interface Props {
  outputs: MortgageOutputs;
  inputs: MortgageInputs;
}

export default function StressTest({ outputs, inputs }: Props) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener("open-section", handler);
    return () => el.removeEventListener("open-section", handler);
  }, []);

  const balance = outputs.termEndBalance;
  const remaining = inputs.amortizationYears - inputs.termYears;
  if (balance <= 0 || remaining <= 0) return null;

  const scenarios = [
    { label: "Same rate", rate: inputs.interestRate, delta: 0 },
    { label: "+0.5%", rate: inputs.interestRate + 0.5, delta: 0.5 },
    { label: "+1%", rate: inputs.interestRate + 1, delta: 1 },
    { label: "+2%", rate: inputs.interestRate + 2, delta: 2 },
  ].map((s) => ({
    ...s,
    payment: calculateMortgagePayment(balance, s.rate, remaining, inputs.paymentFrequency),
  }));

  const base = scenarios[0].payment;

  return (
    <div ref={sectionRef} className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
        aria-expanded={open}>
        <p className="text-sm font-semibold text-neutral-800">What if rates go up at renewal?</p>
        <span className="text-neutral-400 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
      <div className="px-5 pb-5 border-t border-neutral-100 pt-4">
      <p className="text-sm text-neutral-500 mb-4">
        If your rate changes when your {inputs.termYears}-year term ends, your {FREQUENCY_LABELS[inputs.paymentFrequency].toLowerCase()} payment on the {formatCurrency(outputs.termEndBalance, 0, true)} remaining balance would be:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scenarios.map((s) => {
          const diff = s.payment - base;
          const isBase = s.delta === 0;
          return (
            <div key={s.label} className="rounded-xl p-3 text-center border"
              style={isBase
                ? { background: "#fafafa", borderColor: "#e7e5e4" }
                : diff > 300 ? { background: "#fef2f2", borderColor: "#fecaca" }
                : { background: "#fffbeb", borderColor: "#fde68a" }}>
              <p className="text-xs font-medium mb-1" style={{ color: isBase ? "var(--ink-mid)" : diff > 300 ? "var(--red)" : "var(--amber)" }}>
                {s.label} · {s.rate.toFixed(2)}%
              </p>
              <p className="font-serif text-xl font-semibold"
                style={{ color: isBase ? "var(--ink)" : diff > 300 ? "var(--red)" : "var(--amber)" }}>
                {formatCurrency(s.payment, 0)}
              </p>
              {!isBase && (
                <p className="text-xs mt-0.5" style={{ color: diff > 300 ? "var(--red)" : "var(--amber)" }}>
                  +{formatCurrency(diff, 0)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-400 mt-3">
        Stress test qualifying rate: {outputs.stressTestRate.toFixed(2)}% (contract rate + 2%, minimum 5.25%)
      </p>
      </div>
      )}
    </div>
  );
}
