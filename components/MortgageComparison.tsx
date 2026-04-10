"use client";

import React, { useState, useMemo } from "react";
import { MortgageInputs, PaymentFrequency } from "@/lib/types";
import { AMORTIZATION_OPTIONS, RATE_PRESETS } from "@/lib/constants";
import { calculateMortgagePayment, generateAmortizationSchedule } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  inputs: MortgageInputs;
  loanAmount: number;
}

export default function MortgageComparison({ inputs, loanAmount }: Props) {
  const [open, setOpen] = useState(false);
  const [rateB, setRateB] = useState(() => inputs.interestRate + 0.5);
  const [amortB, setAmortB] = useState(() => inputs.amortizationYears);

  const inp = "w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors";
  const sel = "w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors appearance-none cursor-pointer";

  const scenarioA = useMemo(() => {
    const payment  = calculateMortgagePayment(loanAmount, inputs.interestRate, inputs.amortizationYears, inputs.paymentFrequency);
    const schedule = generateAmortizationSchedule(loanAmount, inputs.interestRate, inputs.amortizationYears, inputs.paymentFrequency, payment, 0, {});
    const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest ?? 0;
    return { payment, totalInterest, years: schedule.length / 12 };
  }, [loanAmount, inputs.interestRate, inputs.amortizationYears, inputs.paymentFrequency]);

  const scenarioB = useMemo(() => {
    const payment  = calculateMortgagePayment(loanAmount, rateB, amortB, inputs.paymentFrequency);
    const schedule = generateAmortizationSchedule(loanAmount, rateB, amortB, inputs.paymentFrequency, payment, 0, {});
    const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest ?? 0;
    return { payment, totalInterest, years: schedule.length / 12 };
  }, [loanAmount, rateB, amortB, inputs.paymentFrequency]);

  const paymentDiff  = scenarioB.payment - scenarioA.payment;
  const interestDiff = scenarioB.totalInterest - scenarioA.totalInterest;
  const betterB      = interestDiff < 0;

  return (
    <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
        aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-800">What if you got a better rate?</p>
          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
            style={{ background: "var(--green-light)", color: "var(--green)" }}>A vs B</span>
        </div>
        <span className="text-stone-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-5">
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Compare your current setup (Scenario A) against a different rate or amortization (Scenario B). Both use the same mortgage amount of {formatCurrency(loanAmount, 0)}.
          </p>

          {/* Scenario controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Scenario A — read only */}
            <div className="rounded-xl p-4 border-2" style={{ borderColor: "var(--green)", background: "var(--green-light)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--green)" }}>Scenario A (current)</p>
              <p className="text-xs text-stone-500 mb-0.5">Rate</p>
              <p className="text-base font-semibold text-stone-900">{inputs.interestRate}%</p>
              <p className="text-xs text-stone-500 mb-0.5 mt-2">Amortization</p>
              <p className="text-base font-semibold text-stone-900">{inputs.amortizationYears} years</p>
            </div>

            {/* Scenario B — editable */}
            <div className="rounded-xl p-4 border border-stone-200">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-500">Scenario B</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-stone-500">Rate</label>
                  <div className="relative mt-0.5">
                    <input type="number" min="0.1" max="20" step="0.05" value={rateB}
                      onChange={(e) => setRateB(parseFloat(e.target.value) || 0)}
                      className={`${inp} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-stone-500">Amortization</label>
                  <div className="relative mt-0.5">
                    <select value={amortB} onChange={(e) => setAmortB(Number(e.target.value))} className={`${sel} pr-6`}>
                      {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
                  </div>
                </div>
              </div>
              {/* Quick rate presets for B */}
              <div className="flex flex-wrap gap-1 mt-2">
                {RATE_PRESETS.slice(0, 3).map((p) => (
                  <button key={p.label} onClick={() => { setRateB(p.rate); setAmortB(inputs.amortizationYears); }}
                    className="text-xs px-2 py-0.5 rounded border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">
                    {p.rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-stone-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--cream)" }}>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide"></th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--green)" }}>Scenario A</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Scenario B</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                <tr>
                  <td className="px-4 py-3 text-xs text-stone-600 font-medium">Payment</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>
                    {formatCurrency(scenarioA.payment, 2)}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{formatCurrency(scenarioB.payment, 2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs font-medium"
                    style={{ color: paymentDiff > 0 ? "var(--red)" : "var(--green-mid)" }}>
                    {paymentDiff >= 0 ? "+" : ""}{formatCurrency(paymentDiff, 2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-xs text-stone-600 font-medium">Total Interest</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>
                    {formatCurrency(scenarioA.totalInterest, 0, true)}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{formatCurrency(scenarioB.totalInterest, 0, true)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs font-medium"
                    style={{ color: interestDiff > 0 ? "var(--red)" : "var(--green-mid)" }}>
                    {interestDiff >= 0 ? "+" : ""}{formatCurrency(interestDiff, 0, true)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-xs text-stone-600 font-medium">Amortization</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--green)" }}>
                    {inputs.amortizationYears} yrs
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700">{amortB} yrs</td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-stone-400">
                    {amortB - inputs.amortizationYears !== 0
                      ? `${amortB - inputs.amortizationYears > 0 ? "+" : ""}${amortB - inputs.amortizationYears} yrs`
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verdict */}
          {Math.abs(interestDiff) > 100 && (
            <div className="rounded-xl p-3 border"
              style={betterB
                ? { background: "var(--green-light)", borderColor: "var(--green-border)" }
                : { background: "#fef2f2", borderColor: "#fecaca" }}>
              <p className="text-sm font-semibold" style={{ color: betterB ? "var(--green)" : "var(--red)" }}>
                {betterB
                  ? `Scenario B saves ${formatCurrency(Math.abs(interestDiff), 0)} in total interest`
                  : `Scenario A saves ${formatCurrency(Math.abs(interestDiff), 0)} in total interest`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: betterB ? "var(--green-mid)" : "#991b1b" }}>
                {Math.abs(paymentDiff) > 0.5
                  ? `${betterB ? "Higher" : "Lower"} payment of ${formatCurrency(Math.abs(paymentDiff), 2)}/period`
                  : "Same payment amount"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
