"use client";

import React from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import Tooltip from "./Tooltip";
import ShareButton from "./ShareButton";

interface Props {
  outputs:   MortgageOutputs;
  inputs:    MortgageInputs;
  shareURL?: string;
}

interface MetricProps {
  label:   string;
  value:   string;
  sub?:    string;
  tip?:    string;
  accent?: boolean;
}

function Metric({ label, value, sub, tip, accent }: MetricProps) {
  return (
    <div className="p-4">
      {/* Fixed-height label row so all values align regardless of wrapping */}
      <div className="flex items-start gap-0.5 mb-2" style={{ minHeight: "2.75rem" }}>
        <p className="text-xs font-medium uppercase tracking-wide leading-tight"
          style={{ color: "var(--ink-faint)" }}>{label}</p>
        {tip && <Tooltip content={tip} />}
      </div>
      <p className="text-xl font-semibold"
        style={{ color: accent ? "var(--brand-teal)" : "#1a1a1a" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ outputs, inputs, shareURL }: Props) {
  const mode    = inputs.mortgageMode;
  const hasCMHC = outputs.cmhcPremium > 0;
  const freq    = FREQUENCY_LABELS[inputs.paymentFrequency];

  const termInterest  = outputs.termInterestPaid ?? 0;
  const termPrincipal = outputs.termPrincipalPaid ?? 0;

  const refiInterestSaved = mode === "refinance" && outputs.currentPayment > 0
    ? Math.max(0, Math.round(
        (outputs.currentPayment - outputs.periodicPayment) * outputs.amortizationSchedule.length
      ))
    : 0;

  return (
    <div className="rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

      {/* Hero — payment + share */}
      <div className="px-6 pt-6 pb-5" style={{ background: "var(--green)" }}>
        {/* Top row: label + share button */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.65)" }}>
            {freq} Mortgage Payment
          </p>
          {shareURL && (
            <button
              onClick={async () => {
                try { await navigator.clipboard.writeText(shareURL); } catch {
                  const el = document.createElement("textarea");
                  el.value = shareURL;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
              title="Copy shareable link">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 4H3.5A1.5 1.5 0 002 5.5v5A1.5 1.5 0 003.5 12h5A1.5 1.5 0 0010 10.5V9M6 2h4.5A1.5 1.5 0 0112 3.5V8A1.5 1.5 0 0110.5 9.5h-4A1.5 1.5 0 015 8V3.5A1.5 1.5 0 016.5 2z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Share
            </button>
          )}
        </div>

        {/* Payment number */}
        <p className="font-display leading-none mb-1" style={{ fontSize: 52, color: "#fff" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>

        {/* Purchase: CMHC comparison */}
        {hasCMHC && (
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Without CMHC: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.paymentWithoutCMHC, 2)}</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>CMHC adds: </span>
              <span className="font-semibold text-white">
                {formatCurrency(outputs.periodicPayment - outputs.paymentWithoutCMHC, 2)}/payment
              </span>
            </div>
          </div>
        )}

        {/* Renewal: current vs new */}
        {mode === "renewal" && outputs.currentPayment > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Current payment: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              {outputs.periodicPayment > outputs.currentPayment ? (
                <><span style={{ color: "rgba(255,255,255,0.7)" }}>Increases by: </span>
                <span className="font-semibold text-white">+{formatCurrency(outputs.periodicPayment - outputs.currentPayment, 2)}</span></>
              ) : (
                <><span style={{ color: "rgba(255,255,255,0.7)" }}>Saves: </span>
                <span className="font-semibold text-white">{formatCurrency(outputs.currentPayment - outputs.periodicPayment, 2)}/period</span></>
              )}
            </div>
          </div>
        )}

        {/* Refinance: current vs new */}
        {mode === "refinance" && outputs.currentPayment > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Currently paying: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</span>
            </div>
            {refiInterestSaved > 0 && (
              <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Interest saved: </span>
                <span className="font-semibold text-white">{formatCurrency(refiInterestSaved, 0, true)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode-specific metrics — fixed label height for alignment */}

      {/* PURCHASE */}
      {mode === "purchase" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
          <Metric label="Monthly ownership"
            value={formatCurrency(outputs.totalMonthlyOwnership, 0)}
            sub="Mortgage + tax + heat"
            tip="Total monthly cost: mortgage payment, property tax, heating, home insurance, and condo fees. The number that matters for day-to-day budgeting." />
          <Metric label="Total interest"
            value={formatCurrency(outputs.totalInterest, 0, true)}
            sub={`Over ${inputs.amortizationYears} yr amortization`}
            tip="Total interest paid over the full amortization. Accelerated payments or lump sums can cut this significantly." />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="What you'll still owe when your term ends. This balance gets a new rate applied at renewal." />
          <Metric label="Mortgage amount"
            value={formatCurrency(outputs.insuredMortgage, 0, true)}
            sub={hasCMHC ? `Incl. ${formatCurrency(outputs.cmhcPremium, 0)} CMHC` : "No CMHC required"}
            tip={hasCMHC
              ? "Your mortgage includes the CMHC insurance premium added to your principal. You pay interest on it for the full amortization."
              : "20%+ down, no CMHC mortgage default insurance required."} />
        </div>
      )}

      {/* RENEWAL */}
      {mode === "renewal" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
          <Metric label="Interest this term"
            value={formatCurrency(termInterest, 0, true)}
            sub={`Over ${inputs.termYears}-yr term`}
            tip="Total interest you'll pay during this term only, not the full amortization. Reducing your balance before renewal day lowers this." />
          <Metric label="Principal paid"
            value={formatCurrency(termPrincipal, 0, true)}
            sub={`This ${inputs.termYears}-yr term`}
            tip="How much of your balance you'll pay down during this term. Extra payments go entirely to principal." />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="Your outstanding balance when this term ends, the amount your next rate will be applied to." />
          <Metric label="Total interest remaining"
            value={formatCurrency(outputs.totalInterest, 0, true)}
            sub={`Over ${inputs.renewalAmortization || inputs.amortizationYears} yr remaining`}
            tip="Total interest remaining over your full amortization from today. Accelerated payments can reduce this significantly." />
        </div>
      )}

      {/* REFINANCE */}
      {mode === "refinance" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
          <Metric label="New loan amount"
            value={formatCurrency(outputs.loanAmount, 0, true)}
            sub={inputs.cashOutAmount > 0 ? `Incl. ${formatCurrency(inputs.cashOutAmount, 0)} cash-out` : "No cash-out"}
            tip="Your new mortgage balance after refinancing, including any cash-out amount." />
          <Metric label="Total interest"
            value={formatCurrency(outputs.totalInterest, 0, true)}
            sub={`Over ${inputs.amortizationYears} yr amortization`}
            tip="Total interest on the refinanced mortgage over the full new amortization period." />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="What you'll owe when this new term ends." />
          <Metric label="Available equity"
            value={inputs.homeValue > 0 ? formatCurrency(Math.max(0, inputs.homeValue * 0.8 - outputs.loanAmount), 0, true) : " - "}
            sub="Up to 80% LTV remaining"
            tip="Additional equity you could still access while staying within the 80% LTV refinance limit." />
        </div>
      )}

      {/* CMHC notice */}
      {hasCMHC && mode === "purchase" && (
        <div className="px-5 py-3 border-t border-neutral-100 flex items-start gap-2"
          style={{ background: "#fffbeb" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="#d97706" strokeWidth="1.5"/>
            <path d="M7 4v4M7 9.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: "#92400e" }}>
            <span className="font-semibold">CMHC mortgage insurance applies.</span>{" "}
            Your {(inputs.downPaymentPercent).toFixed(1)}% down payment triggers a{" "}
            {formatCurrency(outputs.cmhcPremium, 0)} premium added to your mortgage. Not due at closing,
            but you pay interest on it for the full amortization period.
            {outputs.cmhcProvincialTax > 0 && (
              <span> Provincial tax on the premium ({formatCurrency(outputs.cmhcProvincialTax, 0)}) is due at closing.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
