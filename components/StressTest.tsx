"use client";

import React from "react";
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
    <div className="rounded-2xl bg-white border border-stone-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1 flex items-center" style={{ color: "var(--green)" }}>What if rates go up at renewal?<Tooltip content="Canadian lenders must qualify you at the higher of your contract rate + 2% or 5.25% (the stress test). This shows what your payment would actually be if rates rise when your term ends — before you commit to anything." /></p>
      <p className="text-sm text-stone-500 mb-4">
        If your rate changes when your {inputs.termYears}-year term ends, your {FREQUENCY_LABELS[inputs.paymentFrequency].toLowerCase()} payment on the {formatCurrency(outputs.termEndBalance, 0, true)} remaining balance would be:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scenarios.map((s) => {
          const diff = s.payment - base;
          const isBase = s.delta === 0;
          return (
            <div key={s.label} className="rounded-xl p-3 text-center border"
              style={isBase
                ? { background: "var(--cream)", borderColor: "#e7e5e4" }
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
      <p className="text-xs text-stone-400 mt-3">
        Stress test qualifying rate: {outputs.stressTestRate.toFixed(2)}% (contract rate + 2%, minimum 5.25%)
      </p>
    </div>
  );
}
