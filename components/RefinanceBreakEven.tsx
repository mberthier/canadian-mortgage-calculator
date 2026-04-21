"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment, solveRemainingAmortization } from "@/lib/mortgageMath";

interface Props {
  inputs:   MortgageInputs;
  outputs:  MortgageOutputs;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

// ── Math helpers ─────────────────────────────────────────────────────────────

function estimatePenalty(balance: number, currentRate: number, newRate: number, months: number, lenderType: "bank" | "broker") {
  const threeMonth   = Math.round(balance * (currentRate / 100) / 12 * 3);
  const rateDiff     = Math.max(0, currentRate - newRate);
  const fairIrd      = Math.round(balance * (rateDiff / 100) * (months / 12));
  const effectiveIrd = lenderType === "bank" ? Math.round(fairIrd * 2.0) : fairIrd;
  const likely       = Math.max(threeMonth, effectiveIrd);
  const method       = effectiveIrd > threeMonth ? "ird" : "3month";
  return { threeMonth, ird: effectiveIrd, likely, method, bankWarning: lenderType === "bank" && effectiveIrd > threeMonth };
}

function runPath(balance: number, rate: number, payment: number, months: number) {
  const r = Math.pow(Math.pow(1 + rate / 200, 2), 1 / 12) - 1;
  let bal = balance, interest = 0, principal = 0;
  for (let i = 0; i < months && bal > 0.01; i++) {
    const i_ = bal * r;
    const p  = Math.min(Math.max(0, payment - i_), bal);
    interest += i_; principal += p; bal -= p;
  }
  return { interest: Math.round(interest), principal: Math.round(principal), endBalance: Math.round(bal) };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RefinanceBreakEven({ inputs, outputs, setField }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const activeReason = inputs.refiScenario || "rate";

  const {
    currentBalance, currentRate, interestRate, currentMonthlyPayment,
    monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
    amortizationYears, paymentFrequency, homeValue,
  } = inputs;

  const a = useMemo(() => {
    if (!currentBalance || !currentRate || !interestRate ||
        !currentMonthlyPayment || !monthsRemainingInTerm) return null;

    const months      = monthsRemainingInTerm;
    const remainAmort = solveRemainingAmortization(currentBalance, currentRate, currentMonthlyPayment);
    const sameAmort   = remainAmort ?? 25;

    // extAmort: 25yr default, or user Refine override if different from sameAmort
    const userOverride = amortizationYears > 0 && Math.abs(amortizationYears - sameAmort) >= 0.5
      ? amortizationYears : null;
    const extAmort  = userOverride ?? 25;
    const showExt   = Math.abs(extAmort - sameAmort) >= 0.5;

    const newBal    = currentBalance + (cashOutAmount || 0);
    const pmtSame   = calculateMortgagePayment(newBal, interestRate, sameAmort, paymentFrequency);
    const pmtExt    = calculateMortgagePayment(newBal, interestRate, extAmort, paymentFrequency);

    const penaltyEst = estimatePenalty(currentBalance, currentRate, interestRate, months, lenderType);
    const penaltyAmt = knownPenalty > 0 ? knownPenalty : penaltyEst.likely;

    const pathA     = runPath(currentBalance, currentRate, currentMonthlyPayment, months);
    const pathBsame = runPath(newBal, interestRate, pmtSame, months);
    const pathBext  = runPath(newBal, interestRate, pmtExt, months);

    const savingSame = Math.round(pathA.interest - (pathBsame.interest + penaltyAmt));
    const savingExt  = Math.round(pathA.interest - (pathBext.interest + penaltyAmt));

    const monthlySavingSame = Math.round(currentMonthlyPayment - pmtSame);
    const monthlySavingExt  = Math.round(currentMonthlyPayment - pmtExt);

    const beSame = monthlySavingSame > 0 ? penaltyAmt / monthlySavingSame : null;
    const beExt  = monthlySavingExt  > 0 ? penaltyAmt / monthlySavingExt  : null;

    // Which scenario is selected
    const selectedScenario = amortizationYears > 0 && Math.abs(amortizationYears - sameAmort) < 0.5
      ? "same"
      : showExt && amortizationYears > 0 && Math.abs(amortizationYears - extAmort) < 0.5
        ? "ext"
        : "same";

    // Same-payment payoff
    const samePayAmort = solveRemainingAmortization(newBal, interestRate, currentMonthlyPayment);

    // Cash-out cost estimate: interest on the cash-out portion
    const cashOutInterestCost = cashOutAmount > 0
      ? Math.round(cashOutAmount * (interestRate / 100) * sameAmort * 0.6)
      : 0;

    // Equity after break
    const equityPct = homeValue > 0
      ? Math.max(0, (1 - pathBsame.endBalance / homeValue) * 100)
      : null;

    // Prepayment (20% standard privilege)
    const pmtIncCurr = Math.round(currentMonthlyPayment * 0.20);
    const pmtIncSame = Math.round(pmtSame * 0.20);
    const lumpCurr   = Math.round(currentBalance * 0.20);
    const lumpNew    = Math.round(newBal * 0.20);

    return {
      months, remainAmort, sameAmort, extAmort, showExt, newBal,
      pmtSame, pmtExt, penaltyAmt, penaltyEst,
      pathA, pathBsame, pathBext,
      savingSame, savingExt,
      monthlySavingSame, monthlySavingExt,
      beSame, beExt, selectedScenario,
      samePayAmort, cashOutInterestCost, equityPct,
      pmtIncCurr, pmtIncSame, lumpCurr, lumpNew,
    };
  }, [currentBalance, currentRate, interestRate, currentMonthlyPayment,
      monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
      amortizationYears, paymentFrequency, homeValue]);

  // For cashflow scenario: set amortizationYears=25 so mortgageMath uses it
  // For rate/equity: keep amortizationYears=0 so mortgageMath uses the solver
  useEffect(() => {
    if (!a) return;
    if (activeReason === "cashflow" && inputs.amortizationYears !== 25) {
      setField("amortizationYears", 25);
    } else if ((activeReason === "rate" || activeReason === "equity") && inputs.amortizationYears !== 0) {
      setField("amortizationYears", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReason]);

  if (!a) return null;

  const {
    months, remainAmort, sameAmort, extAmort, showExt,
    pmtSame, pmtExt, penaltyAmt, penaltyEst,
    pathA, pathBsame, pathBext,
    savingSame, savingExt,
    monthlySavingSame, monthlySavingExt,
    beSame, beExt, selectedScenario,
    samePayAmort, cashOutInterestCost, equityPct,
    pmtIncCurr, pmtIncSame, lumpCurr, lumpNew,
  } = a;

  const rateReduction = (currentRate - interestRate).toFixed(2);
  const worthBreaking = savingSame > 0;

  const fmtBe = (be: number | null) => {
    if (!be || be <= 0) return "N/A";
    if (be < 12) return `${Math.ceil(be)} months`;
    return `${(be / 12).toFixed(1)} years`;
  };

  const divider = { borderBottom: "1px solid rgba(0,0,0,0.05)" };
  const faint   = { color: "var(--ink-faint)" };
  const mid     = { color: "var(--ink-mid)" };
  const ink     = { color: "var(--ink)" };
  const green   = { color: "var(--green)" };

  // Verdict text — plain language
  const verdictText = (() => {
    if (!beSame) return `With no monthly saving at this rate, breaking doesn't make financial sense. Wait for your renewal in ${months} months.`;
    const withinTerm = beSame <= months;

    if (activeReason === "cashflow") {
      const be = beExt ?? beSame;
      const saving = showExt ? monthlySavingExt : monthlySavingSame;
      const withinExt = be ? be <= months : false;
      if (saving > 0 && withinExt) {
        return `Your payment drops by ${formatCurrency(saving, 0)}/month — that's ${formatCurrency(saving * 12, 0, true)} freed up every year. You recover the ${formatCurrency(penaltyAmt, 0, true)} penalty in ${fmtBe(be)}.`;
      }
      if (saving > 0) {
        return `Your payment drops by ${formatCurrency(saving, 0)}/month but you'd need ${fmtBe(be)} to recover the penalty — beyond your term end. The cashflow benefit is real but the penalty timing is unfavourable.`;
      }
    }

    if (activeReason === "equity") {
      const available = inputs.homeValue > 0
        ? Math.max(0, inputs.homeValue * 0.8 - currentBalance)
        : 0;
      if (available <= 0) return `Your current mortgage is already at or above 80% of your home value. You don't have accessible equity to refinance for cash.`;
      return `You can access up to ${formatCurrency(available, 0, true)} in equity. The ${formatCurrency(penaltyAmt, 0, true)} break penalty is the upfront cost — weigh it against what you'd do with the cash. ${withinTerm ? `You recover the penalty in ${fmtBe(beSame)} through lower interest.` : "Consider timing this at renewal to avoid the penalty."}`;
    }

    // Default: rate scenario
    if (worthBreaking && withinTerm) {
      return `You recover the ${formatCurrency(penaltyAmt, 0, true)} penalty in ${fmtBe(beSame)}, then save ${formatCurrency(monthlySavingSame, 0)} every month after that. Over your remaining ${months} months, you come out ${formatCurrency(savingSame, 0, true)} ahead in interest.`;
    }
    if (worthBreaking && !withinTerm) {
      return `You'd recover the penalty in ${fmtBe(beSame)} — after your term ends. Breaking costs more than it saves over the remaining ${months} months. Consider waiting for renewal.`;
    }
    return `After the ${formatCurrency(penaltyAmt, 0, true)} penalty, the interest savings over ${months} months don't cover the cost. Consider waiting until renewal.`;
  })();

  const cols = showExt ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-white"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* ── Section 1: The answer ── */}
      <div className="px-6 pt-5 pb-5" style={divider}>

        {/* Cash-out prompt — equity scenario only */}
        {activeReason === "equity" && (
          <div className="mb-4 rounded-xl p-4"
            style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--ink)" }}>
              How much equity do you want to access?
            </p>
            {inputs.homeValue > 0 && (
              <p className="text-xs mb-3" style={faint}>
                Maximum available:{" "}
                <span className="font-semibold" style={{ color: "var(--green)" }}>
                  {formatCurrency(Math.max(0, inputs.homeValue * 0.8 - currentBalance), 0, true)}
                </span>
                {" "}(80% of home value − current balance)
              </p>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--ink-faint)" }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={inputs.cashOutAmount > 0 ? inputs.cashOutAmount.toLocaleString("en-CA") : ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value.replace(/,/g, ""));
                  setField("cashOutAmount", isNaN(v) ? 0 : v);
                }}
                placeholder="e.g. 50,000"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "rgba(0,0,0,0.12)",
                  background: "#fff",
                  color: "var(--ink)",
                }}
              />
            </div>
            {inputs.homeValue > 0 && inputs.cashOutAmount > 0 && inputs.cashOutAmount > Math.max(0, inputs.homeValue * 0.8 - currentBalance) && (
              <p className="text-xs mt-2" style={{ color: "#ef4444" }}>
                Exceeds 80% LTV cap. Reduce the amount or check your home value.
              </p>
            )}
            {inputs.cashOutAmount > 0 && (
              <p className="text-xs mt-2" style={{ color: "var(--green)" }}>
                New mortgage balance: {formatCurrency(currentBalance + inputs.cashOutAmount, 0, true)}
              </p>
            )}
          </div>
        )}

        {/* Rate context */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={faint}>
          Break-even analysis
        </p>
        <p className="text-sm mb-4" style={mid}>
          Trading{" "}
          <span className="font-semibold" style={ink}>{currentRate}%</span>
          {" "}→{" "}
          <span className="font-semibold" style={ink}>{interestRate}%</span>
          {" "}— a <span className="font-semibold" style={green}>{rateReduction}%</span> rate reduction
          {" "}with <span className="font-semibold" style={ink}>{months} months</span> left in your term.
          {remainAmort && (
            <span style={faint}>{" "}You have approximately {Math.round(remainAmort * 10) / 10} years left on your mortgage.</span>
          )}
        </p>

        {/* Three key numbers — context-aware */}
        <div className="grid grid-cols-3 gap-3 mb-4">

          {/* Card 1: varies by reason */}
          {activeReason === "rate" && (
            <div className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
              <p className="text-xs mb-1.5" style={faint}>Rate reduction</p>
              <p className="text-xl font-semibold" style={green}>−{rateReduction}%</p>
              <p className="text-xs mt-1" style={faint}>{currentRate}% → {interestRate}%</p>
            </div>
          )}
          {activeReason === "cashflow" && (
            <div className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
              <p className="text-xs mb-1.5" style={faint}>Monthly saving</p>
              <p className="text-xl font-semibold" style={green}>
                {monthlySavingExt > 0 ? `+${formatCurrency(monthlySavingExt, 0)}/mo` : monthlySavingSame > 0 ? `+${formatCurrency(monthlySavingSame, 0)}/mo` : "None"}
              </p>
              <p className="text-xs mt-1" style={faint}>
                {formatCurrency(monthlySavingExt * 12, 0, true)}/yr freed up
              </p>
            </div>
          )}
          {activeReason === "equity" && (
            <div className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
              <p className="text-xs mb-1.5" style={faint}>Equity available</p>
              <p className="text-xl font-semibold" style={green}>
                {inputs.homeValue > 0
                  ? formatCurrency(Math.max(0, inputs.homeValue * 0.8 - currentBalance), 0, true)
                  : "—"}
              </p>
              <p className="text-xs mt-1" style={faint}>at 80% LTV max</p>
            </div>
          )}

          {/* Card 2: penalty — always */}
          <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-xs mb-1.5" style={faint}>
              {knownPenalty > 0 ? "Penalty (quoted)" : "Est. penalty"}
            </p>
            <p className="text-xl font-semibold" style={ink}>
              {formatCurrency(penaltyAmt, 0, true)}
            </p>
            <p className="text-xs mt-1" style={faint}>
              {penaltyEst.method === "ird" ? "IRD method" : "3-month interest"}
            </p>
          </div>

          {/* Card 3: varies by reason */}
          {activeReason === "rate" && (
            <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-xs mb-1.5" style={faint}>Interest saved</p>
              <p className="text-xl font-semibold"
                style={{ color: savingSame > 0 ? "var(--green)" : "var(--ink)" }}>
                {savingSame > 0 ? formatCurrency(savingSame, 0, true) : "None"}
              </p>
              <p className="text-xs mt-1" style={faint}>over {months} months</p>
            </div>
          )}
          {activeReason === "cashflow" && (
            <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-xs mb-1.5" style={faint}>Penalty payback</p>
              <p className="text-xl font-semibold"
                style={{ color: beExt && beExt <= months ? "var(--green)" : "var(--ink)" }}>
                {fmtBe(beExt ?? beSame)}
              </p>
              <p className="text-xs mt-1" style={{ color: beExt && beExt <= months ? "var(--green)" : "var(--ink-faint)" }}>
                {(beExt ?? beSame) && (beExt ?? beSame)! <= months ? "✓ within your term" : "✗ beyond your term"}
              </p>
            </div>
          )}
          {activeReason === "equity" && (
            <div className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-xs mb-1.5" style={faint}>Equity after refi</p>
              <p className="text-xl font-semibold" style={ink}>
                {equityPct !== null ? `${equityPct.toFixed(0)}%` : "—"}
              </p>
              <p className="text-xs mt-1" style={faint}>of home value</p>
            </div>
          )}
        </div>

        {/* Verdict */}
        <div className="rounded-xl px-4 py-3.5"
          style={{
            background: worthBreaking ? "var(--green-light)" : "#fff7ed",
            border: `1px solid ${worthBreaking ? "var(--green-border)" : "#fed7aa"}`,
          }}>
          <p className="text-sm leading-relaxed"
            style={{ color: worthBreaking ? "var(--green)" : "#c2410c" }}>
            {verdictText}
          </p>
        </div>

        {/* Bank warning */}
        {penaltyEst.bankWarning && knownPenalty === 0 && (
          <p className="text-xs mt-3" style={faint}>
Bank penalties are often 2–3× higher than estimates because they use posted rates for their calculation. Call your bank for the exact number before deciding.
          </p>
        )}

        {/* Cash-out context */}
        {cashOutAmount > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="text-sm" style={mid}>
              You're also accessing{" "}
              <span className="font-semibold" style={ink}>{formatCurrency(cashOutAmount, 0, true)}</span>{" "}
              in equity. The interest cost of this cash is approximately{" "}
              <span className="font-semibold" style={ink}>{formatCurrency(cashOutInterestCost, 0, true)}</span>{" "}
              over {Math.round(sameAmort * 10) / 10} years at {interestRate}%.
              {equityPct !== null && (
                <span style={faint}>{" "}You retain {equityPct.toFixed(0)}% equity after refinancing.</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* ── Section 2: Full breakdown (collapsible) ── */}
      <div>
        <button
          onClick={() => setShowBreakdown(v => !v)}
          className="w-full px-6 py-3.5 flex items-center justify-between text-sm font-medium transition-colors"
          style={{ ...divider, color: "var(--ink-mid)", background: "#fafaf8" }}>
          <span>{showBreakdown ? "Hide" : "Show"} full breakdown</span>
          <span style={faint}>{showBreakdown ? "−" : "+"}</span>
        </button>

        {showBreakdown && (
          <div>
            {/* Table header */}
            <div className={`grid ${cols} px-6 py-3`}
              style={{ ...divider, background: "#fafaf8" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={faint}>
                Over {months} mo
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-center" style={mid}>Stay</p>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: selectedScenario === "same" ? "var(--green)" : "var(--ink-mid)" }}>
                  Break{selectedScenario === "same" ? " ✓" : ""}
                </p>
                <p className="text-xs mt-0.5" style={faint}>{Math.round(sameAmort * 10) / 10}yr payoff</p>
              </div>
              {showExt && (
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: selectedScenario === "ext" ? "var(--green)" : "var(--ink-mid)" }}>
                    Break{selectedScenario === "ext" ? " ✓" : ""}
                  </p>
                  <p className="text-xs mt-0.5" style={faint}>{extAmort}yr payoff</p>
                </div>
              )}
            </div>

            {/* Table rows */}
            {([
              {
                label: "Monthly payment",
                a: formatCurrency(currentMonthlyPayment, 0),
                b: formatCurrency(pmtSame, 0),
                c: formatCurrency(pmtExt, 0),
              },
              {
                label: "Cashflow freed",
                a: <span style={faint}>—</span>,
                b: <span style={{ color: monthlySavingSame > 0 ? "var(--green)" : "#ef4444" }}>
                     {monthlySavingSame >= 0 ? "+" : ""}{formatCurrency(monthlySavingSame, 0)}/mo
                     <span className="block text-xs font-normal" style={faint}>
                       {formatCurrency(monthlySavingSame * 12, 0, true)}/yr
                     </span>
                   </span>,
                c: <span style={{ color: monthlySavingExt > 0 ? "var(--green)" : "#ef4444" }}>
                     {monthlySavingExt >= 0 ? "+" : ""}{formatCurrency(monthlySavingExt, 0)}/mo
                     <span className="block text-xs font-normal" style={faint}>
                       {formatCurrency(monthlySavingExt * 12, 0, true)}/yr
                     </span>
                   </span>,
              },
              {
                label: "Interest paid",
                a: <span style={{ color: "#ef4444" }}>{formatCurrency(pathA.interest, 0, true)}</span>,
                b: <span style={green}>{formatCurrency(pathBsame.interest, 0, true)}</span>,
                c: <span style={green}>{formatCurrency(pathBext.interest, 0, true)}</span>,
              },
              {
                label: "Principal paid",
                a: formatCurrency(pathA.principal, 0, true),
                b: formatCurrency(pathBsame.principal, 0, true),
                c: formatCurrency(pathBext.principal, 0, true),
              },
              {
                label: "Balance at term end",
                a: formatCurrency(pathA.endBalance, 0, true),
                b: <>
                  {formatCurrency(pathBsame.endBalance, 0, true)}
                  {pathBsame.endBalance !== pathA.endBalance && (
                    <span className="block text-xs font-normal mt-0.5" style={faint}>
                      {pathBsame.endBalance > pathA.endBalance ? "+" : ""}
                      {formatCurrency(pathBsame.endBalance - pathA.endBalance, 0, true)}
                    </span>
                  )}
                </>,
                c: <>
                  {formatCurrency(pathBext.endBalance, 0, true)}
                  {pathBext.endBalance !== pathA.endBalance && (
                    <span className="block text-xs font-normal mt-0.5" style={faint}>
                      {pathBext.endBalance > pathA.endBalance ? "+" : ""}
                      {formatCurrency(pathBext.endBalance - pathA.endBalance, 0, true)}
                    </span>
                  )}
                </>,
              },
              {
                label: <span>Penalty{knownPenalty === 0 && <span style={faint}> (est.)</span>}</span>,
                a: <span style={faint}>—</span>,
                b: <span style={{ color: "#ef4444" }}>{formatCurrency(penaltyAmt, 0, true)}</span>,
                c: <span style={{ color: "#ef4444" }}>{formatCurrency(penaltyAmt, 0, true)}</span>,
              },
            ] as const).map((row, i) => (
              <div key={i} className={`grid ${cols} px-6 py-3.5 items-start`} style={divider}>
                <p className="text-xs font-medium pt-0.5" style={mid}>{row.label}</p>
                <div className="text-sm font-semibold text-center" style={ink}>{row.a}</div>
                <div className="text-sm font-semibold text-center rounded px-1"
                  style={{ ...ink, background: selectedScenario === "same" ? "var(--green-light)" : undefined }}>{row.b}</div>
                {showExt && (
                  <div className="text-sm font-semibold text-center rounded px-1"
                    style={{ ...ink, background: selectedScenario === "ext" ? "var(--green-light)" : undefined }}>
                    {row.c}
                  </div>
                )}
              </div>
            ))}

            {/* Net saving + penalty payback */}
            <div className={`grid ${cols} px-6 py-3.5 items-center`}
              style={{ background: savingSame > 0 ? "var(--green-light)" : "#fff7ed", ...divider }}>
              <p className="text-xs font-semibold" style={ink}>Interest saving</p>
              <p className="text-sm text-center" style={faint}>—</p>
              <p className="text-sm font-semibold text-center"
                style={{ color: savingSame > 0 ? "var(--green)" : "#ef4444" }}>
                {savingSame > 0 ? `saves ${formatCurrency(savingSame, 0, true)}` : `costs ${formatCurrency(Math.abs(savingSame), 0, true)}`}
              </p>
              {showExt && (
                <div className="text-center">
                  <p className="text-sm font-semibold"
                    style={{ color: savingExt > 0 ? "var(--green)" : "#ef4444" }}>
                    {savingExt > 0 ? `saves ${formatCurrency(savingExt, 0, true)}` : `costs ${formatCurrency(Math.abs(savingExt), 0, true)}`}
                  </p>
                  {savingExt <= 0 && monthlySavingExt > 0 && (
                    <p className="text-xs mt-0.5" style={faint}>
                      {formatCurrency(monthlySavingExt * months, 0, true)} freed
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={`grid ${cols} px-6 py-3.5 items-center`} style={divider}>
              <p className="text-xs font-medium" style={mid}>Penalty payback</p>
              <p className="text-sm text-center" style={faint}>—</p>
              <p className="text-sm font-semibold text-center"
                style={{ color: beSame && beSame <= months ? "var(--green)" : "var(--ink)" }}>
                {fmtBe(beSame)}
              </p>
              {showExt && (
                <p className="text-sm font-semibold text-center"
                  style={{ color: beExt && beExt <= months ? "var(--green)" : "var(--ink)" }}>
                  {fmtBe(beExt)}
                </p>
              )}
            </div>

            {/* Select scenario buttons */}
            <div className={`grid ${cols} px-6 py-4 items-center`}
              style={{ background: "#fafaf8", ...divider }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={faint}>Apply to hero</p>
              <p className="text-sm text-center" style={faint}>—</p>
              <div className="flex justify-center">
                {selectedScenario === "same" ? (
                  <span className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: "var(--green)", color: "#fff" }}>Selected ✓</span>
                ) : (
                  <button onClick={() => setField("amortizationYears", Math.round(sameAmort))}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}>
                    Select
                  </button>
                )}
              </div>
              {showExt && (
                <div className="flex justify-center">
                  {selectedScenario === "ext" ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{ background: "var(--green)", color: "#fff" }}>Selected ✓</span>
                  ) : (
                    <button onClick={() => setField("amortizationYears", extAmort)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}>
                      Select
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Penalty breakdown */}
            {knownPenalty === 0 && (
              <div className="px-6 py-4" style={divider}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={faint}>
                  How the penalty is calculated
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "3-month interest", amount: penaltyEst.threeMonth, note: "Always applies — the minimum", active: penaltyEst.method === "3month" },
                    { label: lenderType === "bank" ? "Interest rate differential (bank)" : "Interest rate differential", amount: penaltyEst.ird, note: lenderType === "bank" ? "Estimate — call your bank to confirm" : "Rate difference × balance × remaining term", active: penaltyEst.method === "ird" },
                  ].map(({ label, amount, note, active }) => (
                    <div key={label}>
                      <p className="text-xs mb-1" style={{ color: active ? "var(--green)" : "var(--ink-faint)" }}>
                        {label}{active && <span className="ml-1.5 font-semibold">← likely applies</span>}
                      </p>
                      <p className="text-xl font-semibold tracking-tight" style={ink}>
                        {formatCurrency(amount, 0, true)}
                      </p>
                      <p className="text-xs mt-0.5" style={faint}>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 3: Considerations ── */}
      <div className="px-6 py-4 space-y-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>

        {/* Same-payment insight */}
        {samePayAmort && monthlySavingSame > 0 && (
          <div className="flex gap-3 text-sm">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--green)" }} />
            <p style={mid}>
              If you keep paying {formatCurrency(currentMonthlyPayment, 0)}/month after breaking, you'd be mortgage-free in{" "}
              <span className="font-semibold" style={ink}>{Math.round(samePayAmort * 10) / 10} years</span>{" "}
              instead of {Math.round(sameAmort * 10) / 10} years.
            </p>
          </div>
        )}

        {/* Prepayment impact */}
        <div className="flex gap-3 text-sm">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--green)" }} />
          <p style={mid}>
            Your annual lump sum allowance{" "}
            {lumpNew !== lumpCurr
              ? <>changes from <span className="font-semibold" style={ink}>{formatCurrency(lumpCurr, 0, true)}</span> to <span className="font-semibold" style={ink}>{formatCurrency(lumpNew, 0, true)}</span></>
              : <>stays at <span className="font-semibold" style={ink}>{formatCurrency(lumpNew, 0, true)}</span></>
            }{" "}and your payment increase ceiling drops from{" "}
            <span className="font-semibold" style={ink}>+{formatCurrency(pmtIncCurr, 0)}/mo</span> to{" "}
            <span className="font-semibold" style={ink}>+{formatCurrency(pmtIncSame, 0)}/mo</span>.{" "}
            <span style={faint}>(Based on 20% prepayment privilege — check your contract.)</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4">
        <p className="text-xs" style={faint}>
          Estimates only. Get your exact penalty from your lender before deciding.
          {knownPenalty === 0 && " Enter it in Refine your estimate to use your actual figure."}
        </p>
      </div>
    </div>
  );
}
