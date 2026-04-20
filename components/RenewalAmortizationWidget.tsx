"use client";

import React from "react";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";
import { MortgageInputs } from "@/lib/types";

interface Props {
  inputs:   MortgageInputs;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

const AMORT_OPTIONS = [15, 20, 25, 30];

function computeRow(balance: number, rate: number, years: number, frequency: string) {
  const pmt      = calculateMortgagePayment(balance, rate, years, frequency as any);
  const ppy      = getPaymentsPerYear(frequency as any);
  const total    = pmt * years * ppy;
  const interest = Math.max(0, total - balance);
  return { pmt, interest, years };
}

// Binary search: find the amortization (in years, fractional) that produces
// a payment equal to targetPayment. Returns null if not feasible.
function solveAmortizationForPayment(
  balance: number,
  rate: number,
  frequency: string,
  targetPayment: number
): number | null {
  const minPmt = calculateMortgagePayment(balance, rate, 30, frequency as any);
  if (targetPayment < minPmt) return null; // even 30yr isn't enough

  const maxPmt = calculateMortgagePayment(balance, rate, 5, frequency as any);
  if (targetPayment > maxPmt) return null; // payment already exceeds 5yr

  // Binary search between 1 and 30 years (in months for precision)
  let lo = 1, hi = 30;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calculateMortgagePayment(balance, rate, mid, frequency as any);
    if (Math.abs(pmt - targetPayment) < 0.01) return Math.round(mid * 10) / 10;
    if (pmt > targetPayment) lo = mid;
    else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 10) / 10;
}

export default function RenewalAmortizationWidget({ inputs, setField }: Props) {
  const {
    currentBalance, interestRate, renewalAmortization,
    paymentFrequency, currentMonthlyPayment,
  } = inputs;

  if (!currentBalance || !interestRate) return null;

  const current = renewalAmortization || 25;
  const baseRow = computeRow(currentBalance, interestRate, current, paymentFrequency);

  // ── Same-payment row ──────────────────────────────────────────────────────
  const samePaymentYears = currentMonthlyPayment > 0
    ? solveAmortizationForPayment(currentBalance, interestRate, paymentFrequency, currentMonthlyPayment)
    : null;

  const samePaymentRow = samePaymentYears !== null ? (() => {
    const ppy      = getPaymentsPerYear(paymentFrequency as any);
    const total    = currentMonthlyPayment * samePaymentYears * ppy;
    const interest = Math.max(0, total - currentBalance);
    return { years: samePaymentYears, interest, pmt: currentMonthlyPayment };
  })() : null;

  // ── Dynamic callout ───────────────────────────────────────────────────────
  const callout = (() => {
    if (samePaymentRow) {
      const interestSaved = formatCurrency(baseRow.interest - samePaymentRow.interest, 0);
      const yearsEarlier  = Math.round(current - samePaymentRow.years);
      if (yearsEarlier > 0) {
        return `Keeping your current payment means you'd be mortgage-free in ${samePaymentRow.years} years — ${yearsEarlier} year${yearsEarlier !== 1 ? "s" : ""} earlier than your selected option — and save ${interestSaved} in interest at no extra cost.`;
      }
    }
    const maxOption = Math.max(...AMORT_OPTIONS);
    const minOption = Math.min(...AMORT_OPTIONS);
    if (current >= maxOption) {
      const vsNext      = computeRow(currentBalance, interestRate, current - 5, paymentFrequency);
      const costMore    = formatCurrency(vsNext.pmt - baseRow.pmt, 0);
      const interestSaved = formatCurrency(baseRow.interest - vsNext.interest, 0);
      return `Shortening by 5 years costs ${costMore}/month more but saves ${interestSaved} in total interest.`;
    }
    if (current <= minOption) {
      const vsNext      = computeRow(currentBalance, interestRate, current + 5, paymentFrequency);
      const savesMonth  = formatCurrency(baseRow.pmt - vsNext.pmt, 0);
      const costsMore   = formatCurrency(vsNext.interest - baseRow.interest, 0);
      return `Extending by 5 years saves ${savesMonth}/month but adds ${costsMore} in total interest.`;
    }
    const longer  = computeRow(currentBalance, interestRate, current + 5, paymentFrequency);
    const shorter = computeRow(currentBalance, interestRate, current - 5, paymentFrequency);
    const extSaves  = formatCurrency(baseRow.pmt - longer.pmt, 0);
    const extCosts  = formatCurrency(longer.interest - baseRow.interest, 0);
    const shrCosts  = formatCurrency(shorter.pmt - baseRow.pmt, 0);
    const shrSaves  = formatCurrency(baseRow.interest - shorter.interest, 0);
    return `Extending to ${current + 5} yrs saves ${extSaves}/month but adds ${extCosts} in interest. Shortening to ${current - 5} yrs costs ${shrCosts}/month more but saves ${shrSaves}.`;
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
          {["Amortization", "Monthly payment", "Total interest", "Interest saved"].map(h => (
            <p key={h} className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--ink-faint)" }}>{h}</p>
          ))}
        </div>

        {/* Same-payment row — pinned at top when available */}
        {samePaymentRow && (
          <div className="grid grid-cols-4 items-center px-6 py-4"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#f0fdf4" }}>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>
                  {samePaymentRow.years} years
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "#16a34a", color: "#fff" }}>
                  same pmt
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#16a34a", opacity: 0.8 }}>
                Keep paying {formatCurrency(samePaymentRow.pmt, 2)}/mo
              </p>
            </div>

            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {formatCurrency(samePaymentRow.pmt, 2)}
              <span className="text-xs font-normal ml-0.5" style={{ color: "var(--ink-faint)" }}>/mo</span>
            </p>

            <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
              {formatCurrency(samePaymentRow.interest, 0, true)}
            </p>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>
                {samePaymentRow.interest < baseRow.interest
                  ? `saves ${formatCurrency(baseRow.interest - samePaymentRow.interest, 0, true)}`
                  : "—"}
              </span>
              <button
                onClick={() => setField("renewalAmortization", samePaymentRow.years)}
                className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
                style={{ background: "#16a34a", color: "#fff" }}>
                Select
              </button>
            </div>
          </div>
        )}

        {/* Fixed amortization rows */}
        {AMORT_OPTIONS.map((years, idx) => {
          const { pmt, interest } = computeRow(currentBalance, interestRate, years, paymentFrequency);
          const isCurrent     = years === current;
          const interestDelta = interest - baseRow.interest;
          const isDeltaPos    = interestDelta > 500;
          const isDeltaNeg    = interestDelta < -500;
          const isLast        = idx === AMORT_OPTIONS.length - 1;

          return (
            <div key={years}
              className="grid grid-cols-4 items-center px-6 py-4 transition-colors"
              style={{
                borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.04)",
                background: isCurrent ? "var(--green-light)" : undefined,
              }}>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold"
                  style={{ color: isCurrent ? "var(--green)" : "var(--ink)" }}>
                  {years} years
                </span>
                {isCurrent && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--green)", color: "#fff" }}>
                    selected
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {formatCurrency(pmt, 0)}
                <span className="text-xs font-normal ml-0.5" style={{ color: "var(--ink-faint)" }}>/mo</span>
              </p>

              <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
                {formatCurrency(interest, 0, true)}
              </p>

              <div className="flex items-center justify-between gap-2">
                {isCurrent ? (
                  <span className="text-xs" style={{ color: "var(--ink-faint)" }}>—</span>
                ) : isDeltaNeg ? (
                  <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>
                    saves {formatCurrency(Math.abs(interestDelta), 0, true)}
                  </span>
                ) : isDeltaPos ? (
                  <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                    costs {formatCurrency(interestDelta, 0, true)} more
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--ink-faint)" }}>—</span>
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
          <path d="M8 7v4M8 5.5v.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          {callout}
        </p>
      </div>
    </div>
  );
}
