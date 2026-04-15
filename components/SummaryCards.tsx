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
  label:     string;
  value:     string;
  sub?:      string;
  tip?:      string;
  highlight?: boolean;  // makes this metric visually stand out
}

function Metric({ label, value, sub, tip, highlight }: MetricProps) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-0.5 mb-2" style={{ minHeight: "2.75rem" }}>
        <p className="text-xs font-medium uppercase tracking-wide leading-tight"
          style={{ color: highlight ? "var(--ink-mid)" : "var(--ink-faint)" }}>{label}</p>
        {tip && <Tooltip content={tip} />}
      </div>
      <p className={highlight ? "text-2xl font-bold" : "text-xl font-semibold"}
        style={{ color: highlight ? "var(--brand-teal)" : "#1a1a1a" }}>{value}</p>
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

      {/* ── Hero ── */}
      <div className="px-6 pt-6 pb-0" style={{ background: "var(--green)" }}>
        {/* Label + share */}
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
        <p className="font-display leading-none" style={{ fontSize: 56, color: "#fff" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>

        {/* Contextual sub-line under the number */}
        <p className="text-sm mt-1.5 pb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {mode === "purchase" && outputs.totalInterest > 0 &&
            `+ ${formatCurrency(outputs.totalInterest, 0, true)} in interest over ${inputs.amortizationYears} years`}
          {mode === "renewal" && outputs.currentPayment > 0 && (() => {
            const diff = outputs.periodicPayment - outputs.currentPayment;
            if (Math.abs(diff) < 1) return "No change from your current payment";
            return diff > 0
              ? `Up ${formatCurrency(diff, 0)} from your current payment`
              : `Down ${formatCurrency(Math.abs(diff), 0)} from your current payment`;
          })()}
          {mode === "refinance" && outputs.currentPayment > 0 && (() => {
            const diff = outputs.periodicPayment - outputs.currentPayment;
            if (Math.abs(diff) < 1) return "Same as your current payment";
            return diff > 0
              ? `Up ${formatCurrency(diff, 0)} from your current payment`
              : `Saves ${formatCurrency(Math.abs(diff), 0)}/period vs your current payment`;
          })()}
        </p>

        {/* CMHC comparison pills */}
        {hasCMHC && (
          <div className="flex flex-wrap gap-2 pb-4 -mt-2">
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

        {/* Renewal pills */}
        {mode === "renewal" && outputs.currentPayment > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 -mt-2">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Previous payment: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</span>
            </div>
          </div>
        )}

        {/* Refinance pills */}
        {mode === "refinance" && refiInterestSaved > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 -mt-2">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Interest saved over amortization: </span>
              <span className="font-semibold text-white">{formatCurrency(refiInterestSaved, 0, true)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Metrics — no gap, flows directly from hero ── */}

      {/* PURCHASE */}
      {mode === "purchase" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
          <Metric label="Monthly ownership"
            value={formatCurrency(outputs.totalMonthlyOwnership, 0)}
            sub="All monthly costs"
            tip="Your full carrying cost: mortgage payment, property tax, heating, home insurance, and condo fees. The number to budget against." />
          <Metric label="Total interest"
            value={formatCurrency(outputs.totalInterest, 0, true)}
            sub={`Over ${inputs.amortizationYears} yr amortization`}
            tip="Total interest you will pay over the full amortization. This is the true cost of borrowing, and the number most affected by accelerated payments or extra lump sums."
            highlight />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="What you still owe when your current term ends. This is the balance your next rate will be applied to at renewal." />
          <Metric label="Mortgage amount"
            value={formatCurrency(outputs.insuredMortgage, 0, true)}
            sub={hasCMHC ? `Incl. ${formatCurrency(outputs.cmhcPremium, 0)} CMHC` : "No CMHC required"}
            tip={hasCMHC
              ? "Your mortgage includes the CMHC insurance premium added to your principal. You pay interest on it for the full amortization."
              : "20% or more down. No CMHC mortgage default insurance required."} />
        </div>
      )}

      {/* RENEWAL */}
      {mode === "renewal" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
          <Metric label="Interest this term"
            value={formatCurrency(termInterest, 0, true)}
            sub={`Over ${inputs.termYears}-yr term`}
            tip="Total interest charges during this term only, not the full amortization. A lump sum before renewal day reduces this directly."
            highlight />
          <Metric label="Principal paid"
            value={formatCurrency(termPrincipal, 0, true)}
            sub={`This ${inputs.termYears}-yr term`}
            tip="How much of your balance you will pay down during this term. Extra payments go entirely to principal." />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="Your outstanding balance when this term ends. The amount your next rate will be applied to." />
          <Metric label="Total interest remaining"
            value={formatCurrency(outputs.totalInterest, 0, true)}
            sub={`Over ${inputs.renewalAmortization || inputs.amortizationYears} yr remaining`}
            tip="Total interest charges remaining over your full amortization from today. Accelerated payments can reduce this significantly." />
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
            tip="Total interest on the refinanced mortgage over the full new amortization period."
            highlight />
          <Metric label="Balance at renewal"
            value={formatCurrency(outputs.termEndBalance, 0, true)}
            sub={`After ${inputs.termYears}-yr term`}
            tip="What you will owe when this new term ends." />
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
