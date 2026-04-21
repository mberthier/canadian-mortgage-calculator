"use client";

import React, { useState } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

function calcPenalty(
  balance: number,
  currentRate: number,
  newRate: number,
  monthsRemaining: number,
  lenderType: "bank" | "broker",
  knownPenalty: number,
): {
  amount: number;
  method: "quoted" | "3month" | "ird";
  threeMonth: number;
  ird: number;
  warning: string | null;
} {
  const threeMonth = Math.round(balance * (currentRate / 100) / 12 * 3);

  // IRD: difference in rates × balance × remaining years
  const rateDiff = Math.max(0, currentRate - newRate);
  const ird = Math.round(balance * (rateDiff / 100) * (monthsRemaining / 12));

  // Banks use posted rates which inflates IRD by ~1.5-2.5%
  const bankIrdMultiplier = 2.0;
  const bankIrd = Math.round(ird * bankIrdMultiplier);

  if (knownPenalty > 0) {
    return { amount: knownPenalty, method: "quoted", threeMonth, ird: lenderType === "bank" ? bankIrd : ird, warning: null };
  }

  if (lenderType === "bank") {
    const likely = Math.max(threeMonth, bankIrd);
    const warning = bankIrd > threeMonth
      ? `Banks use posted rates to calculate IRD, which typically inflates the penalty 2–3× vs our estimate. Call your bank for the exact number before deciding.`
      : null;
    return { amount: likely, method: bankIrd > threeMonth ? "ird" : "3month", threeMonth, ird: bankIrd, warning };
  }

  // Broker lender — use whichever is higher
  const likely = Math.max(threeMonth, ird);
  return { amount: likely, method: ird > threeMonth ? "ird" : "3month", threeMonth, ird, warning: null };
}

export default function RefinanceBreakEven({ inputs, outputs }: Props) {
  const [activeTab, setActiveTab] = useState<"rate" | "cashflow" | "equity">("rate");

  const {
    currentBalance, currentRate, interestRate, currentMonthlyPayment,
    monthsRemainingInTerm, lenderType, knownPenalty, amortizationYears,
    paymentFrequency, cashOutAmount,
  } = inputs;

  if (!currentBalance || !currentRate || !interestRate || !currentMonthlyPayment || !monthsRemainingInTerm) {
    return null;
  }

  const newPayment   = outputs.periodicPayment;
  const monthlySaving = currentMonthlyPayment - newPayment;
  const penalty      = calcPenalty(currentBalance, currentRate, interestRate, monthsRemainingInTerm, lenderType, knownPenalty);
  const breakEvenMonths = monthlySaving > 0 ? penalty.amount / monthlySaving : null;
  const breakEvenYears  = breakEvenMonths ? breakEvenMonths / 12 : null;

  // Same time-horizon interest comparison (over monthsRemaining)
  const ppy = getPaymentsPerYear(paymentFrequency);
  // ── Same time-horizon interest comparison (monthsRemainingInTerm) ──────
  // Compares interest paid only — balance is irrelevant because both paths
  // end with a mortgage that renews. The question is: which path costs less
  // in interest over the remaining term?
  // Path B adds the penalty as an upfront interest cost.
  const currentMonthlyRate = Math.pow(Math.pow(1 + currentRate / 200, 2), 1/12) - 1;
  const newMonthlyRate     = Math.pow(Math.pow(1 + interestRate / 200, 2), 1/12) - 1;

  // Path A: stay — accumulate interest portion only
  let pathABalance  = currentBalance;
  let pathAInterest = 0;
  for (let i = 0; i < monthsRemainingInTerm && pathABalance > 0; i++) {
    const interest  = pathABalance * currentMonthlyRate;
    const principal = Math.max(0, currentMonthlyPayment - interest);
    pathAInterest  += interest;
    pathABalance   -= Math.min(principal, pathABalance);
  }

  // Path B: break — penalty + interest portion at new rate
  let pathBBalance  = currentBalance + (cashOutAmount || 0);
  let pathBInterest = penalty.amount; // penalty = upfront cost of breaking
  for (let i = 0; i < monthsRemainingInTerm && pathBBalance > 0; i++) {
    const interest  = pathBBalance * newMonthlyRate;
    const principal = Math.max(0, newPayment - interest);
    pathBInterest  += interest;
    pathBBalance   -= Math.min(principal, pathBBalance);
  }

  const netSavingOverTerm = Math.round(pathAInterest - pathBInterest);
  const worthBreaking     = netSavingOverTerm > 0;

  const tabs = [
    { key: "rate",      label: "Lower rate" },
    { key: "cashflow",  label: "Free up cashflow" },
    { key: "equity",    label: "Access equity" },
  ] as const;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--ink-faint)" }}>Break-even analysis</p>
        <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          Should you break your mortgage?
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          True cost of breaking vs staying — over the same time horizon.
        </p>
      </div>

      {/* Break-even hero */}
      <div className="px-6 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-3 gap-4">

          {/* Penalty */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--ink-faint)" }}>
              {knownPenalty > 0 ? "Quoted penalty" : "Est. penalty"}
            </p>
            <p className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
              {formatCurrency(penalty.amount, 0, true)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              {knownPenalty > 0 ? "From your lender" : penalty.method === "ird" ? "IRD method" : "3-month interest"}
            </p>
          </div>

          {/* Monthly saving */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--ink-faint)" }}>Monthly saving</p>
            <p className="text-2xl font-semibold"
              style={{ color: monthlySaving > 0 ? "var(--green)" : "#ef4444" }}>
              {monthlySaving >= 0 ? "+" : ""}{formatCurrency(monthlySaving, 0)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              {formatCurrency(currentMonthlyPayment, 0)} → {formatCurrency(newPayment, 0)}
            </p>
          </div>

          {/* Break-even */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--ink-faint)" }}>Break-even</p>
            {breakEvenMonths !== null && monthlySaving > 0 ? (
              <>
                <p className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
                  {breakEvenMonths < 12
                    ? `${Math.ceil(breakEvenMonths)} mo`
                    : `${(breakEvenMonths / 12).toFixed(1)} yr`}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                  {breakEvenMonths <= monthsRemainingInTerm
                    ? "✓ within your term"
                    : "✗ beyond your term"}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-semibold" style={{ color: "#ef4444" }}>N/A</p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                  New payment is higher
                </p>
              </>
            )}
          </div>
        </div>

        {/* Verdict */}
        <div className="mt-4 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: worthBreaking ? "var(--green-light)" : "#fff7ed",
                   border: `1px solid ${worthBreaking ? "var(--green-border)" : "#fed7aa"}` }}>
          <span className="text-base mt-0.5">{worthBreaking ? "✓" : "⚠"}</span>
          <p className="text-sm" style={{ color: worthBreaking ? "var(--green)" : "#c2410c" }}>
            {worthBreaking
              ? `Breaking saves you ${formatCurrency(netSavingOverTerm, 0, true)} over your remaining ${monthsRemainingInTerm}-month term, even after the penalty.`
              : `After the ${formatCurrency(penalty.amount, 0, true)} penalty, breaking costs you ${formatCurrency(Math.abs(netSavingOverTerm), 0, true)} more over your remaining term. Consider waiting.`}
          </p>
        </div>

        {/* Bank penalty warning */}
        {penalty.warning && (
          <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
            style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
            <span className="text-base mt-0.5">⚠</span>
            <p className="text-xs" style={{ color: "#92400e" }}>{penalty.warning}</p>
          </div>
        )}
      </div>

      {/* Penalty breakdown */}
      {knownPenalty === 0 && (
        <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--ink-faint)" }}>Penalty estimate — both methods</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "3-month interest",
                amount: penalty.threeMonth,
                note: "Always applies — minimum penalty",
                highlight: penalty.method === "3month",
              },
              {
                label: lenderType === "bank" ? "IRD (bank posted rate)" : "IRD (fair market)",
                amount: penalty.ird,
                note: lenderType === "bank"
                  ? "Estimated — call your bank to confirm"
                  : "Rate difference × balance × remaining term",
                highlight: penalty.method === "ird",
              },
            ].map(({ label, amount, note, highlight }) => (
              <div key={label} className="rounded-xl p-4"
                style={{
                  background: highlight ? "var(--green-light)" : "#fafaf8",
                  border: `1px solid ${highlight ? "var(--green-border)" : "rgba(0,0,0,0.06)"}`,
                }}>
                <p className="text-xs font-semibold mb-1"
                  style={{ color: highlight ? "var(--green)" : "var(--ink-mid)" }}>{label}</p>
                <p className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
                  {formatCurrency(amount, 0, true)}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{note}</p>
                {highlight && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--green)" }}>
                    Likely applies ↑
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade-off tabs */}
      <div className="bg-white">
        <div className="flex border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {tabs.map(({ key, label }) => (
            <button key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-3 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === key ? "var(--green)" : "var(--ink-faint)",
                borderBottom: activeTab === key ? "2px solid var(--green)" : "2px solid transparent",
              }}>
              {label}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-3">
          {activeTab === "rate" && (
            <>
              <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
                You're trading your current rate of <strong>{currentRate}%</strong> for <strong>{interestRate}%</strong> — a <strong>{(currentRate - interestRate).toFixed(2)}%</strong> reduction.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Rate reduction" value={`${(currentRate - interestRate).toFixed(2)}%`} />
                <StatCard label="Monthly saving" value={formatCurrency(Math.abs(monthlySaving), 0)} color={monthlySaving > 0 ? "var(--green)" : "#ef4444"} />
                <StatCard label="Penalty payback" value={breakEvenMonths ? `${Math.ceil(breakEvenMonths)} months` : "N/A"} />
                <StatCard label={`Over ${monthsRemainingInTerm}mo term`} value={formatCurrency(Math.abs(netSavingOverTerm), 0, true)} color={worthBreaking ? "var(--green)" : "#ef4444"} note={worthBreaking ? "net saving" : "net cost"} />
              </div>
            </>
          )}

          {activeTab === "cashflow" && (
            <>
              <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
                A longer amortization at a lower rate frees up cashflow every month — but extends your total repayment timeline and increases total interest.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Cashflow freed" value={`+${formatCurrency(Math.max(0, monthlySaving), 0)}/mo`} color="var(--green)" />
                <StatCard label="Annualized" value={`+${formatCurrency(Math.max(0, monthlySaving) * 12, 0)}/yr`} color="var(--green)" />
                <StatCard label="New amortization" value={`${amortizationYears} years`} />
                <StatCard label="Break-even" value={breakEvenMonths ? `${Math.ceil(breakEvenMonths)} months` : "N/A"} />
              </div>
              {amortizationYears > 20 && (
                <div className="rounded-xl px-4 py-3 text-xs"
                  style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}>
                  Extending to {amortizationYears} years lowers your monthly payment but increases total interest paid. Use the cashflow saving to invest or pay down other debt to come out ahead.
                </div>
              )}
            </>
          )}

          {activeTab === "equity" && (
            <>
              {cashOutAmount > 0 ? (
                <>
                  <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
                    You're accessing <strong>{formatCurrency(cashOutAmount, 0, true)}</strong> in equity. This increases your mortgage balance and total interest.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Cash accessed" value={formatCurrency(cashOutAmount, 0, true)} color="var(--green)" />
                    <StatCard label="New balance" value={formatCurrency(outputs.loanAmount, 0, true)} />
                    <StatCard label="New payment" value={`${formatCurrency(newPayment, 0)}/mo`} />
                    <StatCard label="Equity remaining" value={`${(Math.max(0, 1 - outputs.ltv) * 100).toFixed(0)}%`} color={(1 - outputs.ltv) < 0.25 ? "#ef4444" : "var(--ink)"} />
                  </div>
                  <div className="rounded-xl px-4 py-3 text-xs"
                    style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)", color: "var(--ink-muted)" }}>
                    The true cost of this cash is the interest on {formatCurrency(cashOutAmount, 0, true)} at {interestRate}% over {amortizationYears} years — approximately {formatCurrency(cashOutAmount * interestRate / 100 * amortizationYears * 0.6, 0, true)}. Compare to your other financing options before deciding.
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    Add a cash-out amount in "Refine your estimate" to model equity access.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex gap-2 text-xs" style={{ background: "#fafaf8", borderTop: "1px solid rgba(0,0,0,0.05)", color: "var(--ink-faint)" }}>
        <span>⚠</span>
        <span>Penalty estimates are approximate. Always get the exact figure from your lender before making a decision. A broker can often negotiate a blend-and-extend as an alternative to breaking.</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, note }: { label: string; value: string; color?: string; note?: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.05)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>{label}</p>
      <p className="text-base font-semibold" style={{ color: color || "var(--ink)" }}>{value}</p>
      {note && <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{note}</p>}
    </div>
  );
}
