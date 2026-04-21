"use client";

import React, { useMemo } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

// Solve remaining amortization from balance + rate + monthly payment
function solveRemainingAmortization(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
): number | null {
  const minPmt = calculateMortgagePayment(balance, annualRate, 30, "monthly");
  if (monthlyPayment < minPmt) return null;
  const maxPmt = calculateMortgagePayment(balance, annualRate, 1, "monthly");
  if (monthlyPayment >= maxPmt) return 1;
  let lo = 0.5, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calculateMortgagePayment(balance, annualRate, mid, "monthly");
    if (Math.abs(pmt - monthlyPayment) < 0.005) return mid;
    if (pmt > monthlyPayment) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Estimate break penalty
function estimatePenalty(
  balance: number,
  currentRate: number,
  newRate: number,
  monthsRemaining: number,
  lenderType: "bank" | "broker",
): { threeMonth: number; ird: number; likely: number; method: "3month" | "ird"; bankWarning: boolean } {
  const threeMonth   = Math.round(balance * (currentRate / 100) / 12 * 3);
  const rateDiff     = Math.max(0, currentRate - newRate);
  const fairIrd      = Math.round(balance * (rateDiff / 100) * (monthsRemaining / 12));
  const effectiveIrd = lenderType === "bank" ? Math.round(fairIrd * 2.0) : fairIrd;
  const likely       = Math.max(threeMonth, effectiveIrd);
  const method       = effectiveIrd > threeMonth ? "ird" : "3month";
  const bankWarning  = lenderType === "bank" && effectiveIrd > threeMonth;
  return { threeMonth, ird: effectiveIrd, likely, method, bankWarning };
}

// Run a path for N months — returns interest, principal, ending balance
function runPath(
  startBalance: number,
  annualRate: number,
  monthlyPayment: number,
  months: number,
): { interest: number; principal: number; endBalance: number } {
  const r = Math.pow(Math.pow(1 + annualRate / 200, 2), 1 / 12) - 1;
  let balance = startBalance;
  let interest = 0, principal = 0;
  for (let i = 0; i < months && balance > 0.01; i++) {
    const i_ = balance * r;
    const p  = Math.min(Math.max(0, monthlyPayment - i_), balance);
    interest += i_; principal += p; balance -= p;
  }
  return { interest: Math.round(interest), principal: Math.round(principal), endBalance: Math.round(balance) };
}

export default function RefinanceBreakEven({ inputs, outputs }: Props) {
  const {
    currentBalance, currentRate, interestRate, currentMonthlyPayment,
    monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
    amortizationYears, paymentFrequency,
  } = inputs;

  const a = useMemo(() => {
    if (!currentBalance || !currentRate || !interestRate ||
        !currentMonthlyPayment || !monthsRemainingInTerm) return null;

    const months = monthsRemainingInTerm;

    // Remaining amortization from actual mortgage state
    const remainingAmort = solveRemainingAmortization(currentBalance, currentRate, currentMonthlyPayment);
    const sameAmort      = remainingAmort ?? 25;

    // Extended amortization — user override or 25yr default
    // Only show third column if meaningfully different from sameAmort
    const extAmort       = amortizationYears > 0 ? amortizationYears : 25;
    const showExtended   = Math.abs(extAmort - sameAmort) >= 0.5;

    const newBalance = currentBalance + (cashOutAmount || 0);

    // Payments
    const pmtSame = calculateMortgagePayment(newBalance, interestRate, sameAmort, paymentFrequency);
    const pmtExt  = calculateMortgagePayment(newBalance, interestRate, extAmort,  paymentFrequency);

    // Penalty
    const penaltyEst    = estimatePenalty(currentBalance, currentRate, interestRate, months, lenderType);
    const penaltyAmount = knownPenalty > 0 ? knownPenalty : penaltyEst.likely;

    // Run all three paths
    const pathA    = runPath(currentBalance,  currentRate,   currentMonthlyPayment, months);
    const pathBsame = runPath(newBalance, interestRate, pmtSame, months);
    const pathBext  = runPath(newBalance, interestRate, pmtExt,  months);

    // Net saving = Path A interest − (Path B interest + penalty)
    const savingSame = Math.round(pathA.interest - (pathBsame.interest + penaltyAmount));
    const savingExt  = Math.round(pathA.interest - (pathBext.interest  + penaltyAmount));

    // Break-even for each path
    const beSame = (currentMonthlyPayment - pmtSame) > 0
      ? penaltyAmount / (currentMonthlyPayment - pmtSame) : null;
    const beExt  = (currentMonthlyPayment - pmtExt) > 0
      ? penaltyAmount / (currentMonthlyPayment - pmtExt)  : null;

    // Same-payment payoff insight
    const samePaymentAmort = solveRemainingAmortization(newBalance, interestRate, currentMonthlyPayment);

    // Prepayment impact (assume 20% privilege — standard Canadian)
    const PRIVILEGE = 0.20;
    const lumpSumCurrent = Math.round(currentBalance * PRIVILEGE);
    const lumpSumNew     = Math.round(newBalance * PRIVILEGE);
    const pmtIncCurrent  = Math.round(currentMonthlyPayment * PRIVILEGE);
    const pmtIncSame     = Math.round(pmtSame * PRIVILEGE);
    const pmtIncExt      = Math.round(pmtExt  * PRIVILEGE);

    return {
      months, remainingAmort, sameAmort, extAmort, showExtended, newBalance,
      pmtSame, pmtExt, penaltyAmount, penaltyEst,
      pathA, pathBsame, pathBext,
      savingSame, savingExt, beSame, beExt,
      samePaymentAmort,
      lumpSumCurrent, lumpSumNew,
      pmtIncCurrent, pmtIncSame, pmtIncExt,
    };
  }, [currentBalance, currentRate, interestRate, currentMonthlyPayment,
      monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
      amortizationYears, paymentFrequency]);

  if (!a) return null;

  const {
    months, remainingAmort, sameAmort, extAmort, showExtended,
    pmtSame, pmtExt, penaltyAmount, penaltyEst,
    pathA, pathBsame, pathBext,
    savingSame, savingExt, beSame, beExt,
    samePaymentAmort,
    lumpSumCurrent, lumpSumNew,
    pmtIncCurrent, pmtIncSame, pmtIncExt,
  } = a;

  const bestSaving = Math.max(savingSame, savingExt);

  // Verdict
  const verdict = (() => {
    if (savingSame > 0 && savingExt > 0) {
      return { positive: true, text: `Breaking makes financial sense. Same amortization saves ${formatCurrency(savingSame, 0, true)} in interest — the better choice if you can manage the payment.` };
    }
    if (savingSame > 0 && savingExt <= 0) {
      return { positive: true, text: `Breaking at the same amortization saves ${formatCurrency(savingSame, 0, true)} in interest. Extending to ${extAmort} years is not worth the extra interest cost over this term.` };
    }
    if (savingSame <= 0 && savingExt > 0) {
      return { positive: false, text: `Extending to ${extAmort} years shows a marginal saving, but you'll have significantly less equity. Consider waiting for renewal unless cashflow is urgent.` };
    }
    return { positive: false, text: `The ${formatCurrency(penaltyAmount, 0, true)} penalty outweighs the interest savings over your remaining ${months} months. Consider waiting until renewal.` };
  })();

  const cols = showExtended ? 4 : 3;
  const gridCols = showExtended ? "grid-cols-4" : "grid-cols-3";

  const fmtSaving = (v: number) => v > 0
    ? <span style={{ color: "var(--green)" }}>saves {formatCurrency(v, 0, true)}</span>
    : <span style={{ color: "#ef4444" }}>costs {formatCurrency(Math.abs(v), 0, true)}</span>;

  const fmtBe = (be: number | null) => {
    if (!be) return <span style={{ color: "var(--ink-faint)" }}>N/A</span>;
    const label = be < 12
      ? `${Math.ceil(be)} mo`
      : `${(be / 12).toFixed(1)} yr`;
    const within = be <= months;
    return <span style={{ color: within ? "var(--green)" : "#ef4444" }}>{label}</span>;
  };

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

      {/* Comparison table */}
      <div className="bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Column headers */}
        <div className={`grid ${gridCols} px-6 py-3`}
          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#fafaf8" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
            Over {months} mo
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-center" style={{ color: "var(--ink-mid)" }}>
            Stay
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-center"
            style={{ color: savingSame > 0 ? "var(--green)" : "var(--ink-mid)" }}>
            Break<br />
            <span className="text-xs font-normal normal-case">
              {Math.round(sameAmort * 10) / 10}yr amort
            </span>
          </p>
          {showExtended && (
            <p className="text-xs font-semibold uppercase tracking-wide text-center"
              style={{ color: savingExt > 0 ? "var(--green)" : "var(--ink-mid)" }}>
              Break<br />
              <span className="text-xs font-normal normal-case">{extAmort}yr amort</span>
            </p>
          )}
        </div>

        {/* Monthly payment */}
        <Row gridCols={gridCols} label="Monthly payment" showExt={showExtended}
          a={formatCurrency(currentMonthlyPayment, 0)}
          b={formatCurrency(pmtSame, 0)}
          c={formatCurrency(pmtExt, 0)} />

        {/* Cashflow freed */}
        <Row gridCols={gridCols} label="Cashflow freed" showExt={showExtended}
          a="—"
          b={<span style={{ color: currentMonthlyPayment - pmtSame > 0 ? "var(--green)" : "#ef4444" }}>
              {currentMonthlyPayment - pmtSame >= 0 ? "+" : ""}{formatCurrency(currentMonthlyPayment - pmtSame, 0)}/mo
             </span>}
          c={<span style={{ color: currentMonthlyPayment - pmtExt > 0 ? "var(--green)" : "#ef4444" }}>
              {currentMonthlyPayment - pmtExt >= 0 ? "+" : ""}{formatCurrency(currentMonthlyPayment - pmtExt, 0)}/mo
             </span>}
          highlight />

        {/* Interest paid */}
        <Row gridCols={gridCols} label="Interest paid" showExt={showExtended}
          a={<span style={{ color: "#ef4444" }}>{formatCurrency(pathA.interest, 0, true)}</span>}
          b={<span style={{ color: "var(--green)" }}>{formatCurrency(pathBsame.interest, 0, true)}</span>}
          c={<span style={{ color: "var(--green)" }}>{formatCurrency(pathBext.interest, 0, true)}</span>}
          highlight />

        {/* Principal paid */}
        <Row gridCols={gridCols} label="Principal paid" showExt={showExtended}
          a={formatCurrency(pathA.principal, 0, true)}
          b={formatCurrency(pathBsame.principal, 0, true)}
          c={formatCurrency(pathBext.principal, 0, true)} />

        {/* Balance at term end */}
        <Row gridCols={gridCols} label="Balance at term end" showExt={showExtended}
          a={formatCurrency(pathA.endBalance, 0, true)}
          b={<>
            <span>{formatCurrency(pathBsame.endBalance, 0, true)}</span>
            {pathBsame.endBalance !== pathA.endBalance && (
              <span className="text-xs block mt-0.5" style={{ color: "var(--ink-faint)" }}>
                {pathBsame.endBalance > pathA.endBalance ? "+" : ""}
                {formatCurrency(pathBsame.endBalance - pathA.endBalance, 0, true)}
              </span>
            )}
          </>}
          c={<>
            <span>{formatCurrency(pathBext.endBalance, 0, true)}</span>
            {pathBext.endBalance !== pathA.endBalance && (
              <span className="text-xs block mt-0.5" style={{ color: "var(--ink-faint)" }}>
                {pathBext.endBalance > pathA.endBalance ? "+" : ""}
                {formatCurrency(pathBext.endBalance - pathA.endBalance, 0, true)}
              </span>
            )}
          </>} />

        {/* Break penalty */}
        <div className={`grid ${gridCols} px-6 py-3.5 items-start`}
          style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: "#fafaf8" }}>
          <p className="text-xs font-medium" style={{ color: "var(--ink-mid)" }}>
            Break penalty{knownPenalty === 0 && <span style={{ color: "var(--ink-faint)" }}> (est.)</span>}
          </p>
          <p className="text-sm text-center" style={{ color: "var(--ink-faint)" }}>—</p>
          <p className="text-sm font-semibold text-center" style={{ color: "#ef4444" }}>
            {formatCurrency(penaltyAmount, 0, true)}
          </p>
          {showExtended && (
            <p className="text-sm font-semibold text-center" style={{ color: "#ef4444" }}>
              {formatCurrency(penaltyAmount, 0, true)}
            </p>
          )}
        </div>

        {/* Net saving */}
        <div className={`grid ${gridCols} px-6 py-4 items-center`}
          style={{ background: bestSaving > 0 ? "var(--green-light)" : "#fff7ed" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--ink-mid)" }}>
            Net interest saving
          </p>
          <p className="text-sm text-center" style={{ color: "var(--ink-faint)" }}>—</p>
          <p className="text-sm font-semibold text-center">{fmtSaving(savingSame)}</p>
          {showExtended && (
            <p className="text-sm font-semibold text-center">{fmtSaving(savingExt)}</p>
          )}
        </div>

        {/* Break-even */}
        <div className={`grid ${gridCols} px-6 py-3.5 items-center`}
          style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
          <p className="text-xs font-medium" style={{ color: "var(--ink-mid)" }}>Penalty payback</p>
          <p className="text-sm text-center" style={{ color: "var(--ink-faint)" }}>—</p>
          <p className="text-sm font-semibold text-center">{fmtBe(beSame)}</p>
          {showExtended && (
            <p className="text-sm font-semibold text-center">{fmtBe(beExt)}</p>
          )}
        </div>
      </div>

      {/* Verdict */}
      <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="rounded-xl px-4 py-3"
          style={{
            background: verdict.positive ? "var(--green-light)" : "#fff7ed",
            border: `1px solid ${verdict.positive ? "var(--green-border)" : "#fed7aa"}`,
          }}>
          <p className="text-sm" style={{ color: verdict.positive ? "var(--green)" : "#c2410c" }}>
            {verdict.text}
          </p>
        </div>
      </div>

      {/* Penalty breakdown */}
      {knownPenalty === 0 && (
        <div className="px-6 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-faint)" }}>
            Penalty estimate — both methods
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: "3-month interest", amount: penaltyEst.threeMonth, note: "Minimum — always applies", active: penaltyEst.method === "3month" },
              { label: lenderType === "bank" ? "IRD (bank posted rate)" : "IRD (fair market)", amount: penaltyEst.ird, note: lenderType === "bank" ? "Est. only — call your bank" : "Rate diff × balance × term", active: penaltyEst.method === "ird" },
            ] as const).map(({ label, amount, note, active }) => (
              <div key={label} className="rounded-xl p-4"
                style={{ background: active ? "var(--green-light)" : "#fafaf8", border: `1px solid ${active ? "var(--green-border)" : "rgba(0,0,0,0.06)"}` }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: active ? "var(--green)" : "var(--ink-mid)" }}>{label}</p>
                <p className="text-xl font-semibold" style={{ color: "var(--ink)" }}>{formatCurrency(amount, 0, true)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{note}</p>
                {active && <p className="text-xs font-semibold mt-1" style={{ color: "var(--green)" }}>Likely applies ↑</p>}
              </div>
            ))}
          </div>
          {penaltyEst.bankWarning && (
            <div className="mt-3 rounded-xl px-4 py-3 flex gap-2 text-xs"
              style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}>
              <span className="shrink-0">⚠</span>
              <span>Banks use posted rates for IRD, typically inflating the penalty 2–3×. The estimate uses 2× — your actual may be higher. Call your bank for the exact number.</span>
            </div>
          )}
        </div>
      )}

      {/* Same-payment insight */}
      {samePaymentAmort && (currentMonthlyPayment - pmtSame) > 0 && (
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
              {" "}and save significantly more in total interest.
            </p>
          </div>
        </div>
      )}

      {/* Prepayment impact */}
      <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="rounded-xl px-4 py-3 flex gap-3"
          style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
          <span className="shrink-0 mt-0.5">⚠</span>
          <div className="text-xs space-y-1" style={{ color: "#92400e" }}>
            <p className="font-semibold">Prepayment privilege impact</p>
            <p>
              Your annual lump sum allowance{" "}
              {lumpSumNew !== lumpSumCurrent
                ? <>changes from <span className="font-semibold">{formatCurrency(lumpSumCurrent, 0, true)}</span> to <span className="font-semibold">{formatCurrency(lumpSumNew, 0, true)}</span> (20% of new balance).</>
                : <>stays at <span className="font-semibold">{formatCurrency(lumpSumNew, 0, true)}</span> (20% of balance).</>
              }{" "}
              Your payment increase ceiling drops from{" "}
              <span className="font-semibold">+{formatCurrency(pmtIncCurrent, 0)}/mo</span> to{" "}
              <span className="font-semibold">+{formatCurrency(pmtIncSame, 0)}/mo</span>
              {showExtended && pmtIncExt !== pmtIncSame && <> (or +{formatCurrency(pmtIncExt, 0)}/mo at {extAmort}yr)</>}
              {" "}— check your new mortgage contract for exact terms.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex gap-2 text-xs"
        style={{ background: "#fafaf8", color: "var(--ink-faint)" }}>
        <span>⚠</span>
        <span>Estimates only. Always get your exact penalty from your lender before deciding. Enter it in "Refine your estimate" to use your actual figure.</span>
      </div>
    </div>
  );
}

// Reusable table row
function Row({
  gridCols, label, a, b, c, showExt, highlight,
}: {
  gridCols: string;
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  c: React.ReactNode;
  showExt: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`grid ${gridCols} px-6 py-3.5 items-start`}
      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: highlight ? undefined : undefined }}>
      <p className="text-xs font-medium" style={{ color: "var(--ink-mid)" }}>{label}</p>
      <p className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{a}</p>
      <div className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{b}</div>
      {showExt && <div className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{c}</div>}
    </div>
  );
}
