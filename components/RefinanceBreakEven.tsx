"use client";

import React, { useMemo } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

interface Props {
  inputs:    MortgageInputs;
  outputs:   MortgageOutputs;
  setField:  <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

function solveRemainingAmortization(balance: number, annualRate: number, monthlyPayment: number): number | null {
  const minPmt = calculateMortgagePayment(balance, annualRate, 30, "monthly");
  if (monthlyPayment < minPmt) return null;
  const maxPmt = calculateMortgagePayment(balance, annualRate, 1, "monthly");
  if (monthlyPayment >= maxPmt) return 1;
  let lo = 0.5, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calculateMortgagePayment(balance, annualRate, mid, "monthly");
    if (Math.abs(pmt - monthlyPayment) < 0.005) return mid;
    pmt > monthlyPayment ? lo = mid : hi = mid;
  }
  return (lo + hi) / 2;
}

function estimatePenalty(balance: number, currentRate: number, newRate: number, months: number, lenderType: "bank" | "broker") {
  const threeMonth   = Math.round(balance * (currentRate / 100) / 12 * 3);
  const rateDiff     = Math.max(0, currentRate - newRate);
  const fairIrd      = Math.round(balance * (rateDiff / 100) * (months / 12));
  const effectiveIrd = lenderType === "bank" ? Math.round(fairIrd * 2.0) : fairIrd;
  const likely       = Math.max(threeMonth, effectiveIrd);
  const method       = effectiveIrd > threeMonth ? "ird" : "3month";
  return { threeMonth, ird: effectiveIrd, likely, method, bankWarning: lenderType === "bank" && effectiveIrd > threeMonth };
}

function runPath(balance: number, annualRate: number, payment: number, months: number) {
  const r = Math.pow(Math.pow(1 + annualRate / 200, 2), 1 / 12) - 1;
  let bal = balance, interest = 0, principal = 0;
  for (let i = 0; i < months && bal > 0.01; i++) {
    const i_ = bal * r;
    const p  = Math.min(Math.max(0, payment - i_), bal);
    interest += i_; principal += p; bal -= p;
  }
  return { interest: Math.round(interest), principal: Math.round(principal), endBalance: Math.round(bal) };
}

export default function RefinanceBreakEven({ inputs, setField }: Props) {
  const {
    currentBalance, currentRate, interestRate, currentMonthlyPayment,
    monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
    amortizationYears, paymentFrequency,
  } = inputs;

  const a = useMemo(() => {
    if (!currentBalance || !currentRate || !interestRate || !currentMonthlyPayment || !monthsRemainingInTerm) return null;

    const months      = monthsRemainingInTerm;
    const remainingAmort = solveRemainingAmortization(currentBalance, currentRate, currentMonthlyPayment);
    const sameAmort   = remainingAmort ?? 25;
    const extAmort    = amortizationYears > 0 ? amortizationYears : 25;
    const showExt     = Math.abs(extAmort - sameAmort) >= 0.5;
    const newBal      = currentBalance + (cashOutAmount || 0);

    const pmtSame     = calculateMortgagePayment(newBal, interestRate, sameAmort, paymentFrequency);
    const pmtExt      = calculateMortgagePayment(newBal, interestRate, extAmort,  paymentFrequency);

    const penaltyEst  = estimatePenalty(currentBalance, currentRate, interestRate, months, lenderType);
    const penaltyAmt  = knownPenalty > 0 ? knownPenalty : penaltyEst.likely;

    const pathA       = runPath(currentBalance, currentRate, currentMonthlyPayment, months);
    const pathBsame   = runPath(newBal, interestRate, pmtSame, months);
    const pathBext    = runPath(newBal, interestRate, pmtExt,  months);

    const savingSame  = Math.round(pathA.interest - (pathBsame.interest + penaltyAmt));
    const savingExt   = Math.round(pathA.interest - (pathBext.interest  + penaltyAmt));

    const beSame = (currentMonthlyPayment - pmtSame) > 0 ? penaltyAmt / (currentMonthlyPayment - pmtSame) : null;
    const beExt  = (currentMonthlyPayment - pmtExt)  > 0 ? penaltyAmt / (currentMonthlyPayment - pmtExt)  : null;

    // Same-payment payoff: if they keep paying current amount after breaking
    const samePayAmort = solveRemainingAmortization(newBal, interestRate, currentMonthlyPayment);
    const samePayPath  = samePayAmort
      ? runPath(newBal, interestRate, currentMonthlyPayment, Math.round(samePayAmort * 12))
      : null;
    const samePayInterestSaving = samePayPath
      ? Math.round(pathA.interest * (samePayAmort! / (months / 12)) - (samePayPath.interest + penaltyAmt))
      : null;

    // Prepayment impact (20% standard privilege)
    const P = 0.20;
    const lumpCurr = Math.round(currentBalance * P);
    const lumpNew  = Math.round(newBal * P);
    const pmtIncCurr = Math.round(currentMonthlyPayment * P);
    const pmtIncSame = Math.round(pmtSame * P);
    const pmtIncExt  = Math.round(pmtExt  * P);

    return {
      months, remainingAmort, sameAmort, extAmort, showExt, newBal,
      pmtSame, pmtExt, penaltyAmt, penaltyEst,
      pathA, pathBsame, pathBext,
      savingSame, savingExt, beSame, beExt,
      samePayAmort, samePayInterestSaving,
      lumpCurr, lumpNew, pmtIncCurr, pmtIncSame, pmtIncExt,
    };
  }, [currentBalance, currentRate, interestRate, currentMonthlyPayment,
      monthsRemainingInTerm, lenderType, knownPenalty, cashOutAmount,
      amortizationYears, paymentFrequency]);

  if (!a) return null;

  // Which scenario is currently selected — drives highlight + button state
  const selectedScenario = (() => {
    const cur = inputs.amortizationYears;
    if (!cur || Math.abs(cur - a.sameAmort) < 0.5) return "same";
    if (a.showExt && Math.abs(cur - a.extAmort) < 0.5) return "ext";
    return "same"; // default
  })();

  const {
    months, remainingAmort, sameAmort, extAmort, showExt,
    pmtSame, pmtExt, penaltyAmt, penaltyEst,
    pathA, pathBsame, pathBext,
    savingSame, savingExt, beSame, beExt,
    samePayAmort, samePayInterestSaving,
    lumpCurr, lumpNew, pmtIncCurr, pmtIncSame, pmtIncExt,
  } = a;

  const cols  = showExt ? "grid-cols-4" : "grid-cols-3";
  const labelW = "text-xs font-medium";

  const fmtBe = (be: number | null) => {
    if (!be || be <= 0) return "—";
    const within = be <= months;
    const label  = be < 12 ? `${Math.ceil(be)} mo` : `${(be / 12).toFixed(1)} yr`;
    return <span style={{ color: within ? "var(--green)" : "var(--ink-faint)" }}>{label}{within ? " ✓" : ""}</span>;
  };

  // Verdict
  const verdict = (() => {
    if (savingSame > 0 && (!showExt || savingExt > 0)) {
      return { ok: true, text: `Breaking saves ${formatCurrency(savingSame, 0, true)} in interest over ${months} months — after the ${formatCurrency(penaltyAmt, 0, true)} penalty. You recover the penalty in ${beSame ? `${Math.ceil(beSame)} months` : "N/A"}.` };
    }
    if (savingSame > 0) {
      const cashFreed = formatCurrency((currentMonthlyPayment - pmtExt) * months, 0, true);
      return { ok: true, text: `Breaking at the same amortization saves ${formatCurrency(savingSame, 0, true)} in interest. Extending to ${extAmort} years costs more in interest but frees ${cashFreed} in cashflow over the term.` };
    }
    if (showExt && savingExt > 0) {
      return { ok: false, text: `Breaking only saves interest if you extend to ${extAmort} years, but you'd end the term with ${formatCurrency(pathBext.endBalance - pathA.endBalance, 0, true)} more remaining. Consider waiting for renewal unless cashflow is urgent.` };
    }
    return { ok: false, text: `After the ${formatCurrency(penaltyAmt, 0, true)} penalty, neither option saves money over your remaining ${months} months. Consider waiting until renewal.` };
  })();

  const divider = { borderBottom: "1px solid rgba(0,0,0,0.05)" };
  const faint   = { color: "var(--ink-faint)" };
  const mid     = { color: "var(--ink-mid)" };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-white"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-4" style={divider}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={faint}>
          Break-even analysis
        </p>
        <p className="text-xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
          Should you break your mortgage?
        </p>
        {remainingAmort && (
          <p className="text-sm mt-1" style={mid}>
            Based on your balance and payment, you have approximately{" "}
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {Math.round(remainingAmort * 10) / 10} years
            </span>{" "}remaining on your amortization.
          </p>
        )}
      </div>

      {/* Comparison table */}
      <div>
        {/* Column headers */}
        <div className={`grid ${cols} px-6 py-3`}
          style={{ ...divider, background: "#fafaf8" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={faint}>
            Over {months} mo
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-center" style={mid}>Stay</p>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: selectedScenario === "same" ? "var(--green)" : savingSame > 0 ? "var(--green)" : "var(--ink-mid)" }}>
              Break{selectedScenario === "same" ? " ✓" : ""}
            </p>
            <p className="text-xs mt-0.5" style={faint}>{Math.round(sameAmort * 10) / 10}yr amort</p>
          </div>
          {showExt && (
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: selectedScenario === "ext" ? "var(--green)" : "var(--ink-mid)" }}>
                Break{selectedScenario === "ext" ? " ✓" : ""}
              </p>
              <p className="text-xs mt-0.5" style={faint}>{extAmort}yr amort</p>
            </div>
          )}
        </div>

        {/* Rows */}
        {[
          {
            label: "Monthly payment",
            a: formatCurrency(currentMonthlyPayment, 0),
            b: formatCurrency(pmtSame, 0),
            c: formatCurrency(pmtExt, 0),
          },
          {
            label: "Cashflow freed",
            a: <span style={faint}>—</span>,
            b: (() => {
              const d = currentMonthlyPayment - pmtSame;
              return <span style={{ color: d > 0 ? "var(--green)" : "#ef4444" }}>{d >= 0 ? "+" : ""}{formatCurrency(d, 0)}/mo</span>;
            })(),
            c: (() => {
              const d = currentMonthlyPayment - pmtExt;
              return <span style={{ color: d > 0 ? "var(--green)" : "#ef4444" }}>{d >= 0 ? "+" : ""}{formatCurrency(d, 0)}/mo</span>;
            })(),
          },
          {
            label: "Interest paid",
            a: <span style={{ color: "#ef4444" }}>{formatCurrency(pathA.interest, 0, true)}</span>,
            b: <span style={{ color: "var(--green)" }}>{formatCurrency(pathBsame.interest, 0, true)}</span>,
            c: <span style={{ color: "var(--green)" }}>{formatCurrency(pathBext.interest, 0, true)}</span>,
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
            b: (<>
              <span>{formatCurrency(pathBsame.endBalance, 0, true)}</span>
              {pathBsame.endBalance !== pathA.endBalance && (
                <span className="block text-xs mt-0.5" style={faint}>
                  {pathBsame.endBalance > pathA.endBalance ? "+" : ""}
                  {formatCurrency(pathBsame.endBalance - pathA.endBalance, 0, true)}
                </span>
              )}
            </>),
            c: (<>
              <span>{formatCurrency(pathBext.endBalance, 0, true)}</span>
              {pathBext.endBalance !== pathA.endBalance && (
                <span className="block text-xs mt-0.5" style={faint}>
                  {pathBext.endBalance > pathA.endBalance ? "+" : ""}
                  {formatCurrency(pathBext.endBalance - pathA.endBalance, 0, true)}
                </span>
              )}
            </>),
          },
          {
            label: <span>Break penalty{knownPenalty === 0 && <span style={faint}> (est.)</span>}</span>,
            a: <span style={faint}>—</span>,
            b: <span style={{ color: "#ef4444" }}>{formatCurrency(penaltyAmt, 0, true)}</span>,
            c: <span style={{ color: "#ef4444" }}>{formatCurrency(penaltyAmt, 0, true)}</span>,
          },
        ].map((row, i) => (
          <div key={i} className={`grid ${cols} px-6 py-3.5 items-start`} style={divider}>
            <p className={`${labelW} pt-0.5`} style={mid}>{row.label}</p>
            <div className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{row.a}</div>
            <div className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{row.b}</div>
            {showExt && <div className="text-sm font-semibold text-center" style={{ color: "var(--ink)" }}>{row.c}</div>}
          </div>
        ))}

        {/* Net interest saving */}
        <div className={`grid ${cols} px-6 py-3.5 items-center`}
          style={{ background: savingSame > 0 ? "var(--green-light)" : "#fff7ed", ...divider }}>
          <p className={`${labelW} font-semibold`} style={{ color: "var(--ink)" }}>Net interest saving</p>
          <p className="text-sm text-center" style={faint}>—</p>
          <p className="text-sm font-semibold text-center"
            style={{ color: savingSame > 0 ? "var(--green)" : "#ef4444" }}>
            {savingSame > 0 ? `saves ${formatCurrency(savingSame, 0, true)}` : `costs ${formatCurrency(Math.abs(savingSame), 0, true)}`}
          </p>
          {showExt && (
            <div className="text-center">
              <p className="text-xs font-semibold"
                style={{ color: savingExt > 0 ? "var(--green)" : "#ef4444" }}>
                {savingExt > 0 ? `saves ${formatCurrency(savingExt, 0, true)}` : `costs ${formatCurrency(Math.abs(savingExt), 0, true)}`}
              </p>
              {savingExt <= 0 && (
                <p className="text-xs mt-0.5" style={faint}>
                  {formatCurrency((currentMonthlyPayment - pmtExt) * months, 0, true)} freed
                </p>
              )}
            </div>
          )}
        </div>

        {/* Penalty payback */}
        <div className={`grid ${cols} px-6 py-3.5 items-center`} style={divider}>
          <p className={`${labelW}`} style={mid}>Penalty payback</p>
          <p className="text-sm text-center" style={faint}>—</p>
          <p className="text-sm font-semibold text-center">{fmtBe(beSame)}</p>
          {showExt && <p className="text-sm font-semibold text-center">{fmtBe(beExt)}</p>}
        </div>
      </div>

        {/* Select scenario buttons */}
        <div className={`grid ${cols} px-6 py-4 items-center`}
          style={{ background: "#fafaf8", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={faint}>Select scenario</p>
          <p className="text-sm text-center" style={faint}>—</p>

          {/* Same amort select */}
          <div className="flex justify-center">
            {selectedScenario === "same" ? (
              <span className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "var(--green)", color: "#fff" }}>
                Selected ✓
              </span>
            ) : (
              <button
                onClick={() => setField("amortizationYears", Math.round(sameAmort))}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}>
                Select
              </button>
            )}
          </div>

          {/* Ext amort select */}
          {showExt && (
            <div className="flex justify-center">
              {selectedScenario === "ext" ? (
                <span className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                  style={{ background: "var(--green)", color: "#fff" }}>
                  Selected ✓
                </span>
              ) : (
                <button
                  onClick={() => setField("amortizationYears", extAmort)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}>
                  Select
                </button>
              )}
            </div>
          )}
        </div>

      {/* Verdict */}
      <div className="px-6 py-4" style={divider}>
        <div className="rounded-xl px-4 py-3"
          style={{
            background: verdict.ok ? "var(--green-light)" : "#fff7ed",
            border: `1px solid ${verdict.ok ? "var(--green-border)" : "#fed7aa"}`,
          }}>
          <p className="text-sm leading-relaxed"
            style={{ color: verdict.ok ? "var(--green)" : "#c2410c" }}>
            {verdict.text}
          </p>
        </div>
      </div>

      {/* Penalty breakdown */}
      {knownPenalty === 0 && (
        <div className="px-6 py-4" style={divider}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={faint}>
            Penalty estimate — both methods
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "3-month interest", amount: penaltyEst.threeMonth, note: "Minimum — always applies", active: penaltyEst.method === "3month" },
              { label: lenderType === "bank" ? "IRD (bank posted rate)" : "IRD (fair market)", amount: penaltyEst.ird, note: lenderType === "bank" ? "Estimate — call your bank" : "Rate diff × balance × remaining term", active: penaltyEst.method === "ird" },
            ].map(({ label, amount, note, active }) => (
              <div key={label}>
                <p className="text-xs mb-1"
                  style={{ color: active ? "var(--green)" : "var(--ink-faint)" }}>
                  {label}{active && <span className="ml-1.5 font-semibold">↑ likely applies</span>}
                </p>
                <p className="text-xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
                  {formatCurrency(amount, 0, true)}
                </p>
                <p className="text-xs mt-0.5" style={faint}>{note}</p>
              </div>
            ))}
          </div>
          {penaltyEst.bankWarning && (
            <p className="text-xs mt-3 pt-3" style={{ ...faint, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              ⚠ Banks use posted rates for IRD, typically inflating the penalty 2–3×. This estimate uses 2× — your actual may be higher. Call your bank before deciding.
            </p>
          )}
        </div>
      )}

      {/* Same-payment insight */}
      {samePayAmort && (currentMonthlyPayment - pmtSame) > 0 && (
        <div className="px-6 py-4" style={divider}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={faint}>
            If you keep your current payment
          </p>
          <p className="text-sm leading-relaxed" style={mid}>
            Continuing to pay {formatCurrency(currentMonthlyPayment, 0)}/month after breaking at {Math.round(sameAmort * 10) / 10} years — you'd be mortgage-free in{" "}
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {Math.round(samePayAmort * 10) / 10} years
            </span>
            {samePayInterestSaving && samePayInterestSaving > 0 && (
              <>, saving an additional{" "}
                <span className="font-semibold" style={{ color: "var(--green)" }}>
                  {formatCurrency(samePayInterestSaving, 0, true)}
                </span>{" "}in interest vs the lower payment.</>
            )}
          </p>
        </div>
      )}

      {/* Prepayment impact */}
      <div className="px-6 py-4" style={divider}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={faint}>
          Prepayment privilege impact
        </p>
        <p className="text-sm leading-relaxed" style={mid}>
          Your annual lump sum allowance{" "}
          {lumpNew !== lumpCurr
            ? <>changes from{" "}
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{formatCurrency(lumpCurr, 0, true)}</span> to{" "}
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{formatCurrency(lumpNew, 0, true)}</span>
              </>
            : <>stays at <span className="font-semibold" style={{ color: "var(--ink)" }}>{formatCurrency(lumpNew, 0, true)}</span></>
          }{" "}(20% of balance). Your payment increase ceiling drops from{" "}
          <span className="font-semibold" style={{ color: "var(--ink)" }}>+{formatCurrency(pmtIncCurr, 0)}/mo</span> to{" "}
          <span className="font-semibold" style={{ color: "var(--ink)" }}>+{formatCurrency(pmtIncSame, 0)}/mo</span>
          {showExt && pmtIncExt !== pmtIncSame
            ? <> (or +{formatCurrency(pmtIncExt, 0)}/mo at {extAmort}yr)</>
            : null
          }.{" "}
          <span style={faint}>Check your new mortgage contract for exact terms.</span>
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-3">
        <p className="text-xs" style={faint}>
          Estimates only. Get your exact penalty from your lender before deciding — enter it in Refine your estimate to use your actual figure.
        </p>
      </div>
    </div>
  );
}
