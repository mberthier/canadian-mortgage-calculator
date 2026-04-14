"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MortgageInputs } from "@/lib/types";
import { AMORTIZATION_OPTIONS, RATE_PRESETS } from "@/lib/constants";
import { calculateMortgagePayment, generateAmortizationSchedule } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  inputs: MortgageInputs;
  loanAmount: number;
}

export default function MortgageComparison({ inputs, loanAmount }: Props) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener("open-section", handler);
    return () => el.removeEventListener("open-section", handler);
  }, []);

  const [rateBRaw, setRateBRaw] = useState(() => (inputs.interestRate + 0.5).toFixed(2));
  const [amortB, setAmortB]     = useState(() => inputs.amortizationYears);
  const rateB = parseFloat(rateBRaw) || 0;

  const inp = "w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";
  const sel = "w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none cursor-pointer";

  const buildScenario = (rate: number, amortYears: number) => {
    if (loanAmount <= 0 || rate <= 0) return null;
    const payment  = calculateMortgagePayment(loanAmount, rate, amortYears, inputs.paymentFrequency);
    const schedule = generateAmortizationSchedule(
      loanAmount, rate, amortYears, inputs.paymentFrequency,
      payment, inputs.extraPayment, inputs.lumpSumsByYear
    );
    const termPayments     = inputs.termYears * { monthly:12,"semi-monthly":24,"biweekly":26,"accelerated-biweekly":26,"weekly":52,"accelerated-weekly":52 }[inputs.paymentFrequency];
    const termSlice        = schedule.slice(0, termPayments);
    const termInterest     = termSlice.reduce((s, e) => s + e.interest, 0);
    const termEndBalance   = termSlice.length > 0 ? termSlice[termSlice.length - 1].balance : loanAmount;
    const totalInterest    = schedule.reduce((s, e) => s + e.interest, 0);
    const actualAmortYears = schedule.length / { monthly:12,"semi-monthly":24,"biweekly":26,"accelerated-biweekly":26,"weekly":52,"accelerated-weekly":52 }[inputs.paymentFrequency];
    return { payment, totalInterest, termInterest, termEndBalance, actualAmortYears };
  };

  const scenarioA = useMemo(() => buildScenario(inputs.interestRate, inputs.amortizationYears),
    [loanAmount, inputs.interestRate, inputs.amortizationYears, inputs.paymentFrequency, inputs.extraPayment, inputs.lumpSumsByYear]);
  const scenarioB = useMemo(() => buildScenario(rateB, amortB),
    [loanAmount, rateB, amortB, inputs.paymentFrequency, inputs.extraPayment, inputs.lumpSumsByYear]);

  if (!scenarioA || !scenarioB) return null;

  const paymentDiff      = scenarioB.payment - scenarioA.payment;
  const totalIntDiff     = scenarioB.totalInterest - scenarioA.totalInterest;
  const termIntDiff      = scenarioB.termInterest - scenarioA.termInterest;
  const termBalDiff      = scenarioB.termEndBalance - scenarioA.termEndBalance;
  const betterB          = totalIntDiff < 0;

  return (
    <div ref={sectionRef} className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
        aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-neutral-800">Compare mortgage scenarios</p>
          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
            style={{ background: "var(--green-light)", color: "var(--green)" }}>A vs B</span>
        </div>
        <span className="text-neutral-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-neutral-100 pt-4 space-y-5">
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Compare your current setup against a different rate or amortization.
            Both use {formatCurrency(loanAmount, 0)} mortgage amount
            {inputs.extraPayment > 0 ? `, ${formatCurrency(inputs.extraPayment, 0)} extra/period` : ""}
            {Object.values(inputs.lumpSumsByYear).some(v => v > 0) ? ", with lump sums" : ""}.
          </p>

          {/* Scenario inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border-2" style={{ borderColor: "var(--green)", background: "var(--green-light)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--green)" }}>Scenario A (current)</p>
              <p className="text-xs text-neutral-500 mb-0.5">Rate</p>
              <p className="text-base font-semibold text-neutral-900">{inputs.interestRate.toFixed(2)}%</p>
              <p className="text-xs text-neutral-500 mb-0.5 mt-2">Amortization</p>
              <p className="text-base font-semibold text-neutral-900">{inputs.amortizationYears} years</p>
            </div>

            <div className="rounded-xl p-4 border border-neutral-200">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-neutral-500">Scenario B</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-neutral-500">Rate</label>
                  <div className="relative mt-0.5">
                    <input type="text" inputMode="decimal"
                      value={rateBRaw}
                      onChange={(e) => setRateBRaw(e.target.value.replace(/[^0-9.]/g, ""))}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v > 0) setRateBRaw(v.toFixed(2));
                      }}
                      className={`${inp} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Amortization</label>
                  <div className="relative mt-0.5">
                    <select value={amortB} onChange={(e) => setAmortB(Number(e.target.value))} className={`${sel} pr-6`}>
                      {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">▾</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {RATE_PRESETS.slice(0, 3).map((p) => (
                  <button key={p.label} onClick={() => { setRateBRaw(p.rate.toFixed(2)); setAmortB(inputs.amortizationYears); }}
                    className="text-xs px-2 py-0.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors">
                    {p.rate.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide"></th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--green)" }}>A</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">B</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-xs">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-neutral-600">Payment</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>{formatCurrency(scenarioA.payment, 2)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700 tabular-nums">{formatCurrency(scenarioB.payment, 2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium"
                    style={{ color: paymentDiff > 0 ? "#888888" : "var(--green-mid)" }}>
                    {paymentDiff >= 0 ? "+" : ""}{formatCurrency(paymentDiff, 2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-neutral-700" colSpan={4}>After {inputs.termYears}-year term</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-600">Interest paid</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>{formatCurrency(scenarioA.termInterest, 0)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700 tabular-nums">{formatCurrency(scenarioB.termInterest, 0)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium"
                    style={{ color: termIntDiff > 0 ? "#888888" : "var(--green-mid)" }}>
                    {termIntDiff >= 0 ? "+" : ""}{formatCurrency(termIntDiff, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-600">Balance at renewal</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>{formatCurrency(scenarioA.termEndBalance, 0, true)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700 tabular-nums">{formatCurrency(scenarioB.termEndBalance, 0, true)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium"
                    style={{ color: termBalDiff > 0 ? "#888888" : "var(--green-mid)" }}>
                    {termBalDiff >= 0 ? "+" : ""}{formatCurrency(termBalDiff, 0, true)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-neutral-700" colSpan={4}>Full amortization</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-600">Total interest</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: "var(--green)" }}>{formatCurrency(scenarioA.totalInterest, 0, true)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700 tabular-nums">{formatCurrency(scenarioB.totalInterest, 0, true)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium"
                    style={{ color: totalIntDiff > 0 ? "#888888" : "var(--green-mid)" }}>
                    {totalIntDiff >= 0 ? "+" : ""}{formatCurrency(totalIntDiff, 0, true)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-600">Paid off in</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--green)" }}>{scenarioA.actualAmortYears.toFixed(1)} yrs</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700">{scenarioB.actualAmortYears.toFixed(1)} yrs</td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium text-neutral-400">
                    {(scenarioB.actualAmortYears - scenarioA.actualAmortYears) !== 0
                      ? `${(scenarioB.actualAmortYears - scenarioA.actualAmortYears) > 0 ? "+" : ""}${(scenarioB.actualAmortYears - scenarioA.actualAmortYears).toFixed(1)} yrs`
                      : " - "}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {Math.abs(totalIntDiff) > 100 && (
            <div className="rounded-xl p-3 border"
              style={betterB
                ? { background: "var(--green-light)", borderColor: "var(--green-border)" }
                : { background: "#fafafa", borderColor: "#e0e0e0" }}>
              <p className="text-sm font-semibold" style={{ color: betterB ? "var(--green)" : "var(--ink-mid)" }}>
                {betterB
                  ? `Scenario B saves ${formatCurrency(Math.abs(totalIntDiff), 0)} in total interest`
                  : `Scenario A saves ${formatCurrency(Math.abs(totalIntDiff), 0)} in total interest`}
              </p>
              {Math.abs(paymentDiff) > 0.5 && (
                <p className="text-xs mt-0.5" style={{ color: betterB ? "var(--green-mid)" : "#991b1b" }}>
                  {betterB ? "Higher" : "Lower"} payment of {formatCurrency(Math.abs(paymentDiff), 2)}/period
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
