"use client";

import React from "react";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";
import { MortgageInputs } from "@/lib/types";

interface Props {
  inputs:    MortgageInputs;
  setField:  <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

const AMORT_OPTIONS = [15, 20, 25, 30];

function computeRow(balance: number, rate: number, years: number, frequency: string) {
  const pmt   = calculateMortgagePayment(balance, rate, years, frequency as any);
  const ppy   = getPaymentsPerYear(frequency as any);
  const total = pmt * years * ppy;
  const interest = Math.max(0, total - balance);
  return { pmt, interest };
}

export default function RenewalAmortizationWidget({ inputs, setField }: Props) {
  const { currentBalance, interestRate, renewalAmortization, paymentFrequency } = inputs;

  if (!currentBalance || !interestRate) return null;

  const current = renewalAmortization || 25;
  const baseRow = computeRow(currentBalance, interestRate, current, paymentFrequency);

  // Dynamic callout based on selection
  const callout = (() => {
    const maxOption = Math.max(...AMORT_OPTIONS);
    const minOption = Math.min(...AMORT_OPTIONS);
    if (current >= maxOption) {
      const vsNext = computeRow(currentBalance, interestRate, current - 5, paymentFrequency);
      const paymentIncrease = formatCurrency(vsNext.pmt - baseRow.pmt, 0);
      const interestSaved   = formatCurrency(baseRow.interest - vsNext.interest, 0);
      return `Shortening by 5 years costs ${paymentIncrease}/month more but saves ${interestSaved} in total interest.`;
    }
    if (current <= minOption) {
      const vsNext = computeRow(currentBalance, interestRate, current + 5, paymentFrequency);
      const paymentDrop    = formatCurrency(baseRow.pmt - vsNext.pmt, 0);
      const interestExtra  = formatCurrency(vsNext.interest - baseRow.interest, 0);
      return `Extending by 5 years saves ${paymentDrop}/month but adds ${interestExtra} in total interest and delays your mortgage-free date by 5 years.`;
    }
    // In the middle — warn about extending
    const longer = computeRow(currentBalance, interestRate, current + 5, paymentFrequency);
    const shorter = computeRow(currentBalance, interestRate, current - 5, paymentFrequency);
    const extendSaves   = formatCurrency(baseRow.pmt - longer.pmt, 0);
    const extendCosts   = formatCurrency(longer.interest - baseRow.interest, 0);
    const shortenCosts  = formatCurrency(shorter.pmt - baseRow.pmt, 0);
    const shortenSaves  = formatCurrency(baseRow.interest - shorter.interest, 0);
    return `Extending to ${current + 5} yrs saves ${extendSaves}/month but adds ${extendCosts} in interest. Shortening to ${current - 5} yrs costs ${shortenCosts}/month more but saves ${shortenSaves}.`;
  })();

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--ink-faint)" }}>
          Renewal decision
        </p>
        <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          How amortization affects your total cost
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Lower payment or less interest — see the trade-off for each option.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white">
        {/* Column headers */}
        <div className="grid grid-cols-4 px-6 py-2.5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          {["Amortization", "New payment", "Total interest", "vs current"].map(h => (
            <p key={h} className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--ink-faint)" }}>{h}</p>
          ))}
        </div>

        {/* Rows */}
        {AMORT_OPTIONS.map(years => {
          const { pmt, interest } = computeRow(currentBalance, interestRate, years, paymentFrequency);
          const isCurrent  = years === current;
          const interestDelta = interest - baseRow.interest;
          const isDeltaPos = interestDelta > 500;
          const isDeltaNeg = interestDelta < -500;

          return (
            <div key={years}
              className="grid grid-cols-4 items-center px-6 py-4 transition-colors"
              style={{
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                background: isCurrent ? "var(--green-light)" : undefined,
              }}>

              {/* Amortization */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isCurrent ? "" : "text-neutral-700"}`}
                  style={isCurrent ? { color: "var(--green)" } : {}}>
                  {years} years
                </span>
                {isCurrent && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--green)", color: "#fff" }}>
                    current
                  </span>
                )}
              </div>

              {/* Payment */}
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {formatCurrency(pmt, 0)}
                <span className="text-xs font-normal ml-0.5" style={{ color: "var(--ink-faint)" }}>/mo</span>
              </p>

              {/* Total interest */}
              <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
                {formatCurrency(interest, 0, true)}
              </p>

              {/* Delta vs current */}
              <div className="flex items-center justify-between gap-2">
                {isCurrent ? (
                  <span className="text-xs" style={{ color: "var(--ink-faint)" }}>—</span>
                ) : (
                  <span className="text-xs font-semibold"
                    style={{ color: isDeltaPos ? "#ef4444" : isDeltaNeg ? "#16a34a" : "var(--ink-faint)" }}>
                    {isDeltaPos ? "+" : ""}{formatCurrency(interestDelta, 0, true)}
                  </span>
                )}

                {!isCurrent && (
                  <button
                    onClick={() => setField("renewalAmortization", years)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}>
                    Select
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div className="px-6 py-4 flex gap-3"
        style={{ background: "#fafaf8", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="shrink-0 mt-0.5" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/>
          <path d="M8 7v4M8 5.5v.5" stroke="var(--green)" strokeWidth="1.5"
            strokeLinecap="round"/>
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          {callout}
        </p>
      </div>
    </div>
  );
}
