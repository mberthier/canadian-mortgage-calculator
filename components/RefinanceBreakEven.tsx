"use client";

import React, { useMemo } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

// Solve remaining amortization from balance + rate + payment
// Returns years (fractional) or null if not solvable
function solveRemainingAmortization(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
): number | null {
  const minPmt = calculateMortgagePayment(balance, annualRate, 30, "monthly");
  if (monthlyPayment < minPmt) return null; // payment doesn't cover interest

  const maxPmt = calculateMortgagePayment(balance, annualRate, 1, "monthly");
  if (monthlyPayment >= maxPmt) return 1; // pays off in under a year

  let lo = 0.5, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calculateMortgagePayment(balance, annualRate, mid, "monthly");
    if (Math.abs(pmt - monthlyPayment) < 0.01) return mid;
    if (pmt > monthlyPayment) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Estimate break penalty — both methods
function estimatePenalty(
  balance: number,
  currentRate: number,
  newRate: number,
  monthsRemaining: number,
  lenderType: "bank" | "broker",
): { threeMonth: number; ird: number; likely: number; method: "3month" | "ird"; bankWarning: boolean } {
  const threeMonth = Math.round(balance * (currentRate / 100) / 12 * 3);
  const rateDiff   = Math.max(0, currentRate - newRate);

  // Broker lender: fair market IRD
  const ird = Math.round(balance * (rateDiff / 100) * (monthsRemaining / 12));

  // Bank: posted rate inflates IRD ~2x
  const bankIrd = Math.round(ird * 2.0);

  const effectiveIrd  = lenderType === "bank" ? bankIrd : ird;
  const likely        = Math.max(threeMonth, effectiveIrd);
  const method        = effectiveIrd > threeMonth ? "ird" : "3month";
  const bankWarning   = lenderType === "bank" && bankIrd > threeMonth;

  return { threeMonth, ird: effectiveIrd, likely, method, bankWarning };
}

// Run a path for N months — returns interest paid, principal paid, ending balance
function runPath(
  startBalance: number,
  annualRate: number,
  monthlyPayment: number,
  months: number,
): { interestPaid: number; principalPaid: number; endBalance: number } {
  const monthlyRate = Math.pow(Math.pow(1 + annualRate / 200, 2), 1 / 12) - 1;
  let balance = startBalance;
  let interestPaid = 0;
  let principalPaid = 0;

  for (let i = 0; i < months && balance > 0.01; i++) {
    const interest  = balance * monthlyRate;
    const principal = Math.min(Math.max(0, monthlyPayment - interest), balance);
    interestPaid   += interest;
    principalPaid  += principal;
    balance        -= principal;
  }

  return { interestPaid: Math.round(interestPaid), principalPaid: Math.round(principalPaid), endBalance: Math.round(balance) };
}

export default function RefinanceBreakEven({ inputs, outputs }: Props) {
  const {
    currentBalance, currentRate, interestRate,
    currentMonthlyPayment, monthsRemainingInTerm,
    lenderType, knownPenalty, cashOutAmount,
    amortizationYears, paymentFrequency,
  } = inputs;

  const analysis = useMemo(() => {
    if (!currentBalance || !currentRate || !interestRate ||
        !currentMonthlyPayment || !monthsRemainingInTerm) return null;

    // 1. Solve remaining amortization from user's actual current state
    const remainingAmort = solveRemainingAmortization(
      currentBalance, currentRate, currentMonthlyPayment
    );

    // 2. New amortization: use user override if set, else remaining, else 25
    const newAmort = amortizationYears > 0
      ? amortizationYears
      : (remainingAmort ?? 25);

    // 3. New payment
    const newPayment = calculateMortgagePayment(
      currentBalance + (cashOutAmount || 0),
      interestRate, newAmort, paymentFrequency
    );

    // 4. Break penalty
    const penaltyEst = estimatePenalty(
      currentBalance, currentRate, interestRate,
      monthsRemainingInTerm, lenderType
    );
    const penaltyAmount = knownPenalty > 0 ? knownPenalty : penaltyEst.likely;
    const penaltySource = knownPenalty > 0 ? "quoted" : penaltyEst.method;

    // 5. Run both paths over monthsRemainingInTerm
    const pathA = runPath(currentBalance, currentRate, currentMonthlyPayment, monthsRemainingInTerm);
    const pathB = runPath(
      currentBalance + (cashOutAmount || 0),
      interestRate, newPayment, monthsRemainingInTerm
    );

    // 6. Net interest saving (penalty is Path B's upfront interest cost)
    const interestSaving = Math.round(pathA.interestPaid - (pathB.interestPaid + penaltyAmount));
    const monthlyDelta   = Math.round(currentMonthlyPayment - newPayment);
    const breakEvenMonths = monthlyDelta > 0 ? penaltyAmount / monthlyDelta : null;

    // 7. Same-payment payoff — if they keep paying current amount after breaking
    const samePaymentAmort = solveRemainingAmortization(
      currentBalance + (cashOutAmount || 0),
      interestRate, currentMonthlyPayment
    );

    return {
      remainingAmort,
      newAmort,
      newPayment,
      penaltyAmount,
      penaltySource,
      penaltyEst,
      pathA,
      pathB,
      interestSaving,
      monthlyDelta,
      breakEvenMonths,
      samePaymentAmort,
      worthBreaking: interestSaving > 0,
    };
  }, [currentBalance, currentRate, interestRate, currentMonthlyPayment,
      monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
      amortizationYears, paymentFrequency]);

  if (!analysis) return null;

  const {
    remainingAmort, newAmort, newPayment, penaltyAmount, penaltySource,
    penaltyEst, pathA, pathB, interestSaving, monthlyDelta,
    breakEvenMonths, samePaymentAmort, worthBreaking,
  } = analysis;

  const months = monthsRemainingInTerm;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--ink-faint)" }}>
          Break-even analysis
        </p>
        <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          Should you break your mortgage?
        </p>
        {remainingAmort && (
          <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
            Based on your balance and payment, you have approximately{" "}
            <span className="font-medium" style={{ color: "var(--ink-mid)" }}>
              {Math.round(remainingAmort * 10) / 10} years remaining
            </span>{" "}on your amortization.
          </p>
        )}
      </div>

      {/* Stay vs Break comparison table */}
      <div className="bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Column headers */}
        <div className="grid grid-cols-3 px-6 py-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#fafaf8" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
            Over {months} months
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-center" style={{ color: "var(--ink-mid)" }}>
            Stay
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-center"
            style={{ color: worthBreaking ? "var(--green)" : "var(--ink-mid)" }}>
            Break
          </p>
        </div>

        {/* Rows */}
        {[
          {
            label: "Monthly payment",
            a: formatCurrency(currentMonthlyPayment, 0),
            b: formatCurrency(newPayment, 0),
            bNote: `${newAmort}yr amort`,
            highlight: false,
          },
          {
            label: "Interest paid",
            a: formatCurrency(pathA.interestPaid, 0, true),
            b: formatCurrency(pathB.interestPaid, 0, true),
            bNote: null,
            highlight: true,
            aColor: "#ef4444",
            bColor: "var(--green)",
          },
          {
            label: "Principal paid",
            a: formatCurrency(pathA.principalPaid, 0, true),
            b: formatCurrency(pathB.principalPaid, 0, true),
            bNote: null,
            highlight: false,
          },
          {
            label: "Balance at term end",
            a: formatCurrency(pathA.endBalance, 0, true),
            b: formatCurrency(pathB.endBalance, 0, true),
            bNote: pathB.endBalance > pathA.endBalance
              ? `+${formatCurrency(pathB.endBalance - pathA.endBalance, 0, true)} more`
              : pathB.endBalance < pathA.endBalance
                ? `${formatCurrency(pathB.endBalance - pathA.endBalance, 0, true)} less`
                : null,
            highlight: false,
          },
        ].map(({ label, a, b, bNote, highlight, aColor, bColor }: any) => (
          <div key={label} className="grid grid-cols-3 px-6 py-3.5 items-start"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--ink-mid)" }}>{label}</p>
            <p className="text-sm font-semibold text-center"
              style={{ color: highlight ? aColor || "var(--ink)" : "var(--ink)" }}>{a}</p>
            <div className="text-center">
              <p className="text-sm font-semibold"
                style={{ color: highlight ? bColor || "var(--ink)" : "var(--ink)" }}>{b}</p>
              {bNote && <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{bNote}</p>}
            </div>
          </div>
        ))}

        {/* Penalty row */}
        <div className="grid grid-cols-3 px-6 py-3.5 items-start"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: "#fafaf8" }}>
          <p className="text-xs font-medium" style={{ color: "var(--ink-mid)" }}>
            Break penalty
            {knownPenalty === 0 && <span className="ml-1" style={{ color: "var(--ink-faint)" }}>(est.)</span>}
          </p>
          <p className="text-sm text-center" style={{ color: "var(--ink-faint)" }}>—</p>
          <p className="text-sm font-semibold text-center" style={{ color: "#ef4444" }}>
            {formatCurrency(penaltyAmount, 0, true)}
          </p>
        </div>

        {/* Net saving row */}
        <div className="grid grid-cols-3 px-6 py-4 items-start"
          style={{ background: worthBreaking ? "var(--green-light)" : "#fff7ed" }}>
          <p className="text-xs font-semibold" style={{ color: worthBreaking ? "var(--green)" : "#c2410c" }}>
            Net interest {worthBreaking ? "saving" : "cost"}
          </p>
          <div />
          <p className="text-sm font-semibold text-center"
            style={{ color: worthBreaking ? "var(--green)" : "#ef4444" }}>
            {worthBreaking ? "saves " : "costs "}{formatCurrency(Math.abs(interestSaving), 0, true)}
          </p>
        </div>
      </div>

      {/* Verdict */}
      <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="rounded-xl px-4 py-3"
          style={{
            background: worthBreaking ? "var(--green-light)" : "#fff7ed",
            border: `1px solid ${worthBreaking ? "var(--green-border)" : "#fed7aa"}`,
          }}>
          <p className="text-sm font-semibold mb-1"
            style={{ color: worthBreaking ? "var(--green)" : "#c2410c" }}>
            {worthBreaking ? "Breaking makes financial sense." : "Breaking may not be worth it yet."}
          </p>
          <p className="text-sm" style={{ color: worthBreaking ? "var(--green)" : "#c2410c" }}>
            {worthBreaking
              ? `After the ${formatCurrency(penaltyAmount, 0, true)} penalty, you save ${formatCurrency(interestSaving, 0, true)} in interest over your remaining ${months}-month term.${breakEvenMonths ? ` You recover the penalty in ${Math.ceil(breakEvenMonths)} months.` : ""}`
              : `The ${formatCurrency(penaltyAmount, 0, true)} penalty outweighs your interest saving over the remaining ${months} months. ${breakEvenMonths && breakEvenMonths > months ? `You'd need ${Math.ceil(breakEvenMonths)} months to break even — beyond your term end.` : "Consider waiting until renewal."}`
            }
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="px-6 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>Cashflow freed</p>
            <p className="text-xl font-semibold"
              style={{ color: monthlyDelta > 0 ? "var(--green)" : "#ef4444" }}>
              {monthlyDelta >= 0 ? "+" : ""}{formatCurrency(monthlyDelta, 0)}/mo
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
              {formatCurrency(Math.abs(monthlyDelta) * 12, 0, true)}/yr
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>Break-even</p>
            {breakEvenMonths && monthlyDelta > 0 ? (
              <>
                <p className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
                  {breakEvenMonths < 12
                    ? `${Math.ceil(breakEvenMonths)} months`
                    : `${(breakEvenMonths / 12).toFixed(1)} years`}
                </p>
                <p className="text-xs mt-0.5"
                  style={{ color: breakEvenMonths <= months ? "var(--green)" : "#ef4444" }}>
                  {breakEvenMonths <= months ? "✓ within your term" : "✗ beyond your term"}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold" style={{ color: "var(--ink-faint)" }}>N/A</p>
            )}
          </div>

          <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>Equity at term end</p>
            <p className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
              {inputs.homeValue > 0
                ? `${(Math.max(0, 1 - pathB.endBalance / inputs.homeValue) * 100).toFixed(0)}%`
                : "—"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
              {pathB.endBalance > pathA.endBalance
                ? `${formatCurrency(pathB.endBalance - pathA.endBalance, 0, true)} less than staying`
                : "same as staying"}
            </p>
          </div>
        </div>
      </div>

      {/* Penalty breakdown */}
      {knownPenalty === 0 && (
        <div className="px-6 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-faint)" }}>
            Penalty estimate — both methods
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "3-month interest",
                amount: penaltyEst.threeMonth,
                note: "Minimum — always applies",
                active: penaltySource === "3month",
              },
              {
                label: lenderType === "bank" ? "IRD (bank posted rate)" : "IRD (fair market)",
                amount: penaltyEst.ird,
                note: lenderType === "bank"
                  ? "Est. only — call your bank to confirm"
                  : "Rate diff × balance × remaining term",
                active: penaltySource === "ird",
              },
            ].map(({ label, amount, note, active }) => (
              <div key={label} className="rounded-xl p-4"
                style={{
                  background: active ? "var(--green-light)" : "#fafaf8",
                  border: `1px solid ${active ? "var(--green-border)" : "rgba(0,0,0,0.06)"}`,
                }}>
                <p className="text-xs font-semibold mb-1.5"
                  style={{ color: active ? "var(--green)" : "var(--ink-mid)" }}>{label}</p>
                <p className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
                  {formatCurrency(amount, 0, true)}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{note}</p>
                {active && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--green)" }}>
                    Likely applies ↑
                  </p>
                )}
              </div>
            ))}
          </div>
          {penaltyEst.bankWarning && (
            <div className="mt-3 rounded-xl px-4 py-3 flex gap-2 text-xs"
              style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}>
              <span>⚠</span>
              <span>Banks use posted rates for IRD, which typically inflates the penalty 2–3×. The estimate above uses 2× — your actual penalty may be higher. Call your bank for the exact number.</span>
            </div>
          )}
        </div>
      )}

      {/* Same-payment insight */}
      {samePaymentAmort && monthlyDelta > 0 && (
        <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="rounded-xl px-4 py-3 flex gap-3"
            style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/>
              <path d="M8 7v4M8 5.5v.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: "var(--green)" }}>
              <span className="font-semibold">Keep paying {formatCurrency(currentMonthlyPayment, 0)}/month after breaking</span>
              {" "}— you'd be mortgage-free in{" "}
              <span className="font-semibold">{Math.round(samePaymentAmort * 10) / 10} years</span>
              {" "}and save significantly more in interest vs extending your amortization.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 flex gap-2 text-xs"
        style={{ background: "#fafaf8", borderTop: "1px solid rgba(0,0,0,0.05)", color: "var(--ink-faint)" }}>
        <span>⚠</span>
        <span>Penalty estimates are approximate. Always get the exact figure from your lender before deciding. Enter it in "Refine your estimate" to use your actual penalty.</span>
      </div>
    </div>
  );
}
