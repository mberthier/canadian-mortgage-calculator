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
    <div ref={sectionRef} className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
      {/* Header, always visible */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
              stroke="var(--brand-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand-teal)" }}>
            What if rates go up at renewal?
          </p>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}
          aria-expanded={open}>
          <span className="text-base leading-none">{open ? "−" : "+"}</span>
        </button>
      </div>
      {!open && (
        <div className="px-5 py-3">
          <p className="text-sm text-neutral-600">
            See your payment at +0.5%, +1%, and +2%, so you know what you can handle before you commit to a rate.
          </p>
        </div>
      )}
      {open && (
      <div className="px-6 pb-6 pt-4">
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
