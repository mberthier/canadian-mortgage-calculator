"use client";

import React, { useState } from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { calculateMortgagePayment, getPaymentsPerYear } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";
import Tooltip from "./Tooltip";

interface Props {
  outputs:   MortgageOutputs;
  inputs:    MortgageInputs;
  shareURL?: string;
}

interface MetricProps {
  label:      string;
  value:      string;
  sub?:       string;
  tip?:       string;
  highlight?: boolean;
}

function Metric({ label, value, sub, tip, highlight }: MetricProps) {
  return (
    <div className="px-5 py-5 flex flex-col">
      {/* Label row — fixed 2-line height so all values align */}
      <div className="flex items-start gap-0.5 mb-2" style={{ minHeight: "2.5em" }}>
        <p className="text-xs font-medium uppercase tracking-wide leading-tight"
          style={{ color: highlight ? "var(--ink-mid)" : "var(--ink-faint)" }}>
          {label}
        </p>
        {tip && <Tooltip content={tip} />}
      </div>
      <p className={highlight ? "text-2xl font-bold" : "text-xl font-semibold"}
        style={{ color: highlight ? "var(--brand-teal)" : "#1a1a1a" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{sub}</p>
      )}
    </div>
  );
}

function H({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="font-semibold" style={{ color: color ?? "var(--ink)" }}>
      {children}
    </span>
  );
}

export default function SummaryCards({ outputs, inputs, shareURL }: Props) {
  const [copied, setCopied] = useState(false);
  const mode    = inputs.mortgageMode;
  const isPurchase = mode === "purchase";
  const hasCMHC = outputs.cmhcPremium > 0;
  const freq    = FREQUENCY_LABELS[inputs.paymentFrequency];
  const freqLow = freq.toLowerCase();

  const termInterest  = outputs.termInterestPaid  ?? 0;
  const termPrincipal = outputs.termPrincipalPaid ?? 0;

  const refiInterestSaved = mode === "refinance" && outputs.currentPayment > 0
    ? Math.max(0, Math.round(
        (outputs.currentPayment - outputs.periodicPayment) * outputs.amortizationSchedule.length
      ))
    : 0;

  const heroSub = (() => {
    const amort = inputs.amortizationYears;
    const rate  = inputs.interestRate;
    if (isPurchase) {
      const amount = hasCMHC
        ? `${formatCurrency(outputs.insuredMortgage, 0, true)} mortgage (incl. CMHC)`
        : `${formatCurrency(outputs.loanAmount, 0, true)} mortgage`;
      return `${amount} · ${rate}% · ${amort} years`;
    }
    if (mode === "renewal") {
      const remaining   = inputs.renewalAmortization || amort;
      const totalMonths = Math.round(remaining * 12);
      const y = Math.floor(totalMonths / 12);
      const m = totalMonths % 12;
      const amortLabel  = m === 0 ? `${y} years` : `${y}y ${m}mo`;
      return `${formatCurrency(inputs.currentBalance, 0, true)} balance · ${rate}% · ${amortLabel} remaining`;
    }
    if (mode === "refinance") {
      const cashOut = inputs.cashOutAmount > 0
        ? ` incl. ${formatCurrency(inputs.cashOutAmount, 0)} cash-out`
        : "";
      return `${formatCurrency(outputs.loanAmount, 0, true)} refinanced${cashOut} · ${rate}% · ${amort} years`;
    }
    return "";
  })();

  // Savings vs 25yr when user keeps their current payment
  const samePaymentSavings = (() => {
    if (mode !== "renewal") return null;
    if (!inputs.currentMonthlyPayment || !inputs.currentBalance || !inputs.interestRate) return null;
    const diff = Math.abs(outputs.periodicPayment - inputs.currentMonthlyPayment);
    if (diff > 0.05) return null; // not in same-payment mode
    const renewAmort = inputs.renewalAmortization || 25;
    if (renewAmort >= 25) return null; // only show when shorter than 25yr
    const ppy      = getPaymentsPerYear(inputs.paymentFrequency);
    const pmt25    = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 25, inputs.paymentFrequency);
    const int25    = Math.max(0, pmt25 * 25 * ppy - inputs.currentBalance);
    const intNow   = outputs.totalInterest;
    const saved    = Math.round(int25 - intNow);
    if (saved <= 0) return null;
    return saved;
  })();

  const handleCopy = async () => {
    if (!shareURL) return;
    try { await navigator.clipboard.writeText(shareURL); } catch {
      const el = document.createElement("textarea");
      el.value = shareURL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Cash summary lines (purchase only) ──────────────────────────────────────
  const cashLines: { label: string; value: number; negative?: boolean; muted?: boolean }[] = [];
  if (isPurchase && inputs.homePrice > 0) {
    cashLines.push({ label: "Down payment", value: inputs.downPayment });
    if (outputs.ltt.provincial > 0 || outputs.ltt.municipal > 0)
      cashLines.push({ label: "Land transfer tax", value: outputs.ltt.provincial + outputs.ltt.municipal });
    if (outputs.ltt.firstTimeBuyerRebate > 0)
      cashLines.push({ label: "First-time buyer rebate", value: outputs.ltt.firstTimeBuyerRebate, negative: true });
    if (outputs.cmhcProvincialTax > 0)
      cashLines.push({ label: "Provincial tax on CMHC", value: outputs.cmhcProvincialTax });
    cashLines.push(inputs.closingCosts > 0
      ? { label: "Closing costs", value: inputs.closingCosts }
      : { label: "Closing costs (est.)", value: 1500, muted: true });
    if (outputs.gstHst.net > 0)
      cashLines.push({ label: "GST/HST (new build, net)", value: outputs.gstHst.net });
  }

  // ── Narrative content ────────────────────────────────────────────────────────
  const narrativeContent = (() => {
    const balance  = formatCurrency(outputs.termEndBalance, 0, true);
    const termInt  = formatCurrency(termInterest, 0, true);
    const termPrin = formatCurrency(termPrincipal, 0, true);

    if (isPurchase && inputs.homePrice > 0) {
      const equityPct = (inputs.homePrice - outputs.termEndBalance) / inputs.homePrice * 100;
      const canSwitch = equityPct >= 20;
      return (
        <>
          <p className="text-sm leading-snug" style={{ color: "var(--ink-mid)" }}>
            Over your {inputs.termYears}-year term you will eliminate{" "}
            <H color="var(--green)">{termPrin}</H> of your mortgage balance and pay{" "}
            <H>{termInt}</H> in interest.
            {" "}At renewal you will owe <H>{balance}</H> with{" "}
            <H color={canSwitch ? "var(--green)" : "var(--amber)"}>{equityPct.toFixed(0)}% equity</H>
            {canSwitch
              ? ", enough to shop any lender freely without re-qualifying."
              : ", still below 20%, so CMHC rules would apply if you chose to refinance."}
          </p>
          <p className="text-xs mt-2 pt-2" style={{ color: "var(--ink-muted)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            Total interest over {inputs.amortizationYears} years at this rate:{" "}
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {formatCurrency(outputs.totalInterest, 0, true)}
            </span>. Accelerated payments or annual lump sums reduce this directly.
          </p>
        </>
      );
    }

    if (mode === "renewal" && inputs.currentBalance > 0) {
      const hasCurrent = outputs.currentPayment > 0;
      const diff = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
      return (
        <>
          <p className="text-sm leading-snug" style={{ color: "var(--ink-mid)" }}>
            This term you will pay <H>{termInt}</H> in interest and pay down{" "}
            <H color="var(--green)">{termPrin}</H> of your balance.
            {" "}At your next renewal you will owe <H>{balance}</H>.
          </p>
          {hasCurrent && Math.abs(diff) > 1 && (
            <p className="text-xs mt-2 pt-2" style={{ color: "var(--ink-muted)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              Payment {diff > 0 ? "increases" : "drops"} by{" "}
              <span className="font-medium" style={{ color: "var(--ink)" }}>
                {formatCurrency(Math.abs(diff), 0)}/{freqLow}
              </span>{" "}
              vs your previous payment.
            </p>
          )}
        </>
      );
    }

    if (mode === "refinance" && inputs.currentBalance > 0) {
      const equityPct = inputs.homeValue > 0
        ? (inputs.homeValue - outputs.loanAmount) / inputs.homeValue * 100
        : null;
      const hasCurrent = outputs.currentPayment > 0;
      const diff = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
      return (
        <>
          <p className="text-sm leading-snug" style={{ color: "var(--ink-mid)" }}>
            Your refinanced mortgage is <H>{formatCurrency(outputs.loanAmount, 0, true)}</H> at {inputs.interestRate}%
            {inputs.cashOutAmount > 0 && <>, including <H color="var(--green)">{formatCurrency(inputs.cashOutAmount, 0)}</H> cash-out</>}.
            {equityPct !== null && (
              <>{" "}You retain{" "}
              <H color={equityPct >= 20 ? "var(--green)" : "var(--amber)"}>{equityPct.toFixed(0)}% equity</H>.</>
            )}
          </p>
          {hasCurrent && Math.abs(diff) > 1 && (
            <p className="text-xs mt-2 pt-2" style={{ color: "var(--ink-muted)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              Payment {diff > 0 ? "increases" : "drops"} by{" "}
              <span className="font-medium" style={{ color: "var(--ink)" }}>
                {formatCurrency(Math.abs(diff), 0)}/{freqLow}
              </span>{" "}
              vs your current rate. This term you will pay{" "}
              <span className="font-medium" style={{ color: "var(--ink)" }}>{termInt}</span> in interest.
            </p>
          )}
        </>
      );
    }
    return null;
  })();

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* ── Hero ── */}
      <div className="px-6 pt-6 pb-0" style={{ background: "var(--green)" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            {freq} Mortgage Payment
          </p>
          {shareURL && (
            <button onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={copied
                ? { background: "rgba(255,255,255,0.3)", color: "#fff" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 4H3.5A1.5 1.5 0 002 5.5v5A1.5 1.5 0 003.5 12h5A1.5 1.5 0 0010 10.5V9M6 2h4.5A1.5 1.5 0 0112 3.5V8A1.5 1.5 0 0110.5 9.5h-4A1.5 1.5 0 015 8V3.5A1.5 1.5 0 016.5 2z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
          )}
        </div>
        <p className="font-display leading-none mt-2" style={{ fontSize: 60, color: "#fff", letterSpacing: "-0.02em" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>
        {heroSub && (
          <p className="text-sm mt-2.5 pb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
            {heroSub}
          </p>
        )}
        {hasCMHC && (
          <div className="flex flex-wrap gap-2 pb-5 -mt-2">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>CMHC adds: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.periodicPayment - outputs.paymentWithoutCMHC, 2)}/payment</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>Premium: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.cmhcPremium, 0)} added to balance</span>
            </div>
            {outputs.cmhcProvincialTax > 0 && (
              <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
                <span style={{ color: "rgba(255,255,255,0.65)" }}>Provincial tax at closing: </span>
                <span className="font-semibold text-white">{formatCurrency(outputs.cmhcProvincialTax, 0)}</span>
              </div>
            )}
          </div>
        )}
        {mode === "renewal" && outputs.currentPayment > 0 && (() => {
          const diff = outputs.periodicPayment - outputs.currentPayment;
          const hasDiff = Math.abs(diff) >= 1;
          return (
            <div className="pb-5 -mt-2">
              {/* Before / After comparison bar */}
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.10)" }}>
                <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <div className="px-4 py-3 text-center">
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Previous payment</p>
                    <p className="text-base font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</p>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Change</p>
                    <p className="text-base font-semibold"
                      style={{ color: diff > 1 ? "#fca5a5" : diff < -1 ? "#86efac" : "rgba(255,255,255,0.7)" }}>
                      {!hasDiff ? "No change" : `${diff > 0 ? "+" : ""}${formatCurrency(diff, 2)}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Same-payment savings pill */}
        {samePaymentSavings !== null && (
          <div className="pb-5 -mt-2">
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.10)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="#86efac" strokeWidth="1.5"/>
                <path d="M4.5 7l2 2 3-3" stroke="#86efac" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs">
                <span style={{ color: "rgba(255,255,255,0.65)" }}>
                  Maintaining your payment saves{" "}
                </span>
                <span className="font-semibold text-white">
                  {formatCurrency(samePaymentSavings, 0, true)} in interest
                </span>
                <span style={{ color: "rgba(255,255,255,0.65)" }}>
                  {" "}vs a 25-year amortization
                </span>
              </p>
            </div>
          </div>
        )}
        {mode === "refinance" && outputs.currentPayment > 0 && (() => {
          const diff = outputs.periodicPayment - outputs.currentPayment;
          const hasDiff = Math.abs(diff) >= 1;
          return (
            <div className="pb-5 -mt-2">
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.10)" }}>
                <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <div className="px-4 py-3 text-center">
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Current payment</p>
                    <p className="text-base font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</p>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Change</p>
                    <p className="text-base font-semibold"
                      style={{ color: diff > 1 ? "#fca5a5" : diff < -1 ? "#86efac" : "rgba(255,255,255,0.7)" }}>
                      {!hasDiff ? "No change" : `${diff > 0 ? "+" : ""}${formatCurrency(diff, 2)}`}
                    </p>
                  </div>
                </div>
              </div>
              {refiInterestSaved > 0 && (
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Saves {formatCurrency(refiInterestSaved, 0, true)} in total interest over the amortization
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── Metrics — flush against hero ── */}
      <div style={{ background: "#fff" }}>
        {isPurchase && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric label="Principal paid" value={formatCurrency(termPrincipal, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="How much of your mortgage balance you pay down during this term. The remainder is still owed at renewal." />
            <Metric label="Interest paid" value={formatCurrency(termInterest, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="Total interest charges during this term only — the cost of borrowing for these years." />
            <Metric label="Balance at renewal" value={formatCurrency(outputs.termEndBalance, 0, true)} sub={`After ${inputs.termYears}-yr term`} tip="What you still owe when your current term ends. Your next rate will be applied to this balance." />
            <Metric label="Total interest" value={formatCurrency(outputs.totalInterest, 0, true)} sub={`Over ${inputs.amortizationYears} years`} tip="Total interest over the full amortization at this rate. Accelerated payments or lump sums reduce this directly." highlight />
          </div>
        )}
        {mode === "renewal" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric label="Principal paid" value={formatCurrency(termPrincipal, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="How much debt you eliminate during this term." />
            <Metric label="Interest paid" value={formatCurrency(termInterest, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="Total interest charges this term." highlight />
            <Metric label="Balance at renewal" value={formatCurrency(outputs.termEndBalance, 0, true)} sub={`After ${inputs.termYears}-yr term`} tip="Your outstanding balance when this term ends." />
            <Metric label="Total interest left" value={formatCurrency(outputs.totalInterest, 0, true)} sub={`Over ${(() => { const r = inputs.renewalAmortization || inputs.amortizationYears; const tm = Math.round(r * 12); const y = Math.floor(tm/12); const m = tm%12; return m === 0 ? `${y} yr` : `${y}y ${m}mo`; })()} remaining`} tip="Total interest remaining over your full amortization from today." />
          </div>
        )}
        {mode === "refinance" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric label="Principal paid" value={formatCurrency(termPrincipal, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="How much of your refinanced balance you pay down during this term." />
            <Metric label="Interest paid" value={formatCurrency(termInterest, 0, true)} sub={`This ${inputs.termYears}-yr term`} tip="Total interest charges during this new term." />
            <Metric label="Balance at renewal" value={formatCurrency(outputs.termEndBalance, 0, true)} sub={`After ${inputs.termYears}-yr term`} tip="What you will owe when this new term ends." />
            <Metric label="Total interest" value={formatCurrency(outputs.totalInterest, 0, true)} sub={`Over ${inputs.amortizationYears} years`} tip="Total interest on the refinanced mortgage over the full amortization." highlight />
          </div>
        )}
      </div>

      {/* ── Cash needed at closing — redesigned zone ── */}
      {isPurchase && inputs.homePrice > 0 && cashLines.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fafaf8" }}>

          {/* Label → number → sub-line, stacked like the hero */}
          <div className="px-6 pt-5 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--ink-faint)" }}>
              Cash needed at closing
            </p>
            <p className="font-display leading-none mb-2"
              style={{ fontSize: 40, color: "#0B1927", letterSpacing: "-0.02em" }}>
              {formatCurrency(outputs.totalUpfrontCash, 0)}
            </p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Have this ready on closing day.
              {!inputs.closingCosts && (
                <span style={{ color: "var(--ink-faint)" }}> Closing costs estimated — add your figure in Refine your estimate.</span>
              )}
            </p>
          </div>

          {/* Breakdown as compact chips */}
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {cashLines.map(({ label, value, negative, muted }) => (
              <div key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: negative ? "#f0fdf4" : muted ? "#f5f5f5" : "#fff",
                  border: `1px solid ${negative ? "#bbf7d0" : muted ? "#e5e5e5" : "rgba(0,0,0,0.08)"}`,
                  color: negative ? "var(--green-mid)" : muted ? "var(--ink-faint)" : "var(--ink-mid)",
                }}>
                <span>{label}</span>
                <span className="font-semibold tabular-nums" style={{ color: negative ? "var(--green)" : muted ? "var(--ink-faint)" : "var(--ink)" }}>
                  {negative ? "−" : ""}{formatCurrency(value, 0)}
                </span>
              </div>
            ))}
          </div>

          {/* All-in monthly — only when costs entered */}
          {(inputs.propertyTax > 0 || inputs.heatingCost > 0 || inputs.condoFees > 0 || inputs.homeInsurance > 0) && (
            <div className="px-6 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                All-in monthly
                {inputs.propertyTax > 0 ? " + tax" : ""}
                {inputs.heatingCost > 0 ? " + heat" : ""}
                {inputs.condoFees > 0 ? " + condo" : ""}
              </p>
              <span className="text-base font-bold tabular-nums" style={{ color: "var(--brand-teal)" }}>
                {formatCurrency(outputs.totalMonthlyOwnership, 0)}/mo
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Narrative — plain caption, no box ── */}
      {narrativeContent && (
        <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {narrativeContent}
        </div>
      )}
    </div>
  );
}
