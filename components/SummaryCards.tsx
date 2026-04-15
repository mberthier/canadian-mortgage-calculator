"use client";

import React, { useState } from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/constants";
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
    <div className="px-5 py-5" style={highlight ? {
      borderLeft: "2px solid var(--brand-teal)",
    } : {}}>
      <div className="flex items-start gap-0.5 mb-3">
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

export default function SummaryCards({ outputs, inputs, shareURL }: Props) {
  const [copied, setCopied] = useState(false);
  const mode    = inputs.mortgageMode;
  const hasCMHC = outputs.cmhcPremium > 0;
  const freq    = FREQUENCY_LABELS[inputs.paymentFrequency];

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
    if (mode === "purchase") {
      const amount = hasCMHC
        ? `${formatCurrency(outputs.insuredMortgage, 0, true)} mortgage (incl. CMHC)`
        : `${formatCurrency(outputs.loanAmount, 0, true)} mortgage`;
      return `${amount} · ${rate}% · ${amort} years`;
    }
    if (mode === "renewal") {
      const remaining = inputs.renewalAmortization || amort;
      return `${formatCurrency(inputs.currentBalance, 0, true)} balance · ${rate}% · ${remaining} years remaining`;
    }
    if (mode === "refinance") {
      const cashOut = inputs.cashOutAmount > 0
        ? ` incl. ${formatCurrency(inputs.cashOutAmount, 0)} cash-out`
        : "";
      return `${formatCurrency(outputs.loanAmount, 0, true)} refinanced${cashOut} · ${rate}% · ${amort} years`;
    }
    return "";
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

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* ── Hero — no bottom padding, flows into metrics ── */}
      <div className="px-6 pt-6 pb-0" style={{ background: "var(--green)" }}>
        {/* Label + share */}
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
                : { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
              title="Copy shareable link">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 4H3.5A1.5 1.5 0 002 5.5v5A1.5 1.5 0 003.5 12h5A1.5 1.5 0 0010 10.5V9M6 2h4.5A1.5 1.5 0 0112 3.5V8A1.5 1.5 0 0110.5 9.5h-4A1.5 1.5 0 015 8V3.5A1.5 1.5 0 016.5 2z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
          )}
        </div>

        {/* Payment number */}
        <p className="font-display leading-none mt-2" style={{ fontSize: 60, color: "#fff", letterSpacing: "-0.02em" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>

        {/* Sub-line */}
        {heroSub && (
          <p className="text-sm mt-2.5 pb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
            {heroSub}
          </p>
        )}

        {/* CMHC pills */}
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

        {/* Renewal pills */}
        {mode === "renewal" && outputs.currentPayment > 0 && (
          <div className="flex flex-wrap gap-2 pb-5 -mt-2">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>Previous payment: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.currentPayment, 2)}</span>
            </div>
            {(() => {
              const diff = outputs.periodicPayment - outputs.currentPayment;
              if (Math.abs(diff) < 1) return null;
              return (
                <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <span style={{ color: "rgba(255,255,255,0.65)" }}>
                    {diff > 0 ? "Increases by: " : "Saves: "}
                  </span>
                  <span className="font-semibold text-white">
                    {diff > 0 ? "+" : ""}{formatCurrency(diff, 2)}/period
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* Refinance pill */}
        {mode === "refinance" && refiInterestSaved > 0 && (
          <div className="flex flex-wrap gap-2 pb-5 -mt-2">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>Interest saved over amortization: </span>
              <span className="font-semibold text-white">{formatCurrency(refiInterestSaved, 0, true)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Metrics — flush against hero, no gap ── */}
      <div style={{ background: "#fff" }}>

        {/* PURCHASE */}
        {mode === "purchase" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric
              label="Principal paid"
              value={formatCurrency(termPrincipal, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="How much of your mortgage balance you pay down during this term. The remainder is still owed at renewal." />
            <Metric
              label="Interest paid"
              value={formatCurrency(termInterest, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="Total interest charges during this term only — the cost of borrowing for these years." />
            <Metric
              label="Balance at renewal"
              value={formatCurrency(outputs.termEndBalance, 0, true)}
              sub={`After ${inputs.termYears}-yr term`}
              tip="What you still owe when your current term ends. Your next rate will be applied to this balance." />
            <Metric
              label="Total interest"
              value={formatCurrency(outputs.totalInterest, 0, true)}
              sub={`Over ${inputs.amortizationYears} years`}
              tip="Total interest over the full amortization at this rate. Accelerated payments or lump sums reduce this directly."
              highlight />
          </div>
        )}

        {/* RENEWAL */}
        {mode === "renewal" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric
              label="Principal paid"
              value={formatCurrency(termPrincipal, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="How much debt you eliminate during this term." />
            <Metric
              label="Interest paid"
              value={formatCurrency(termInterest, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="Total interest charges this term. A lump sum at renewal reduces the balance this is calculated on."
              highlight />
            <Metric
              label="Balance at renewal"
              value={formatCurrency(outputs.termEndBalance, 0, true)}
              sub={`After ${inputs.termYears}-yr term`}
              tip="Your outstanding balance when this term ends." />
            <Metric
              label="Total interest left"
              value={formatCurrency(outputs.totalInterest, 0, true)}
              sub={`Over ${inputs.renewalAmortization || inputs.amortizationYears} yr remaining`}
              tip="Total interest remaining over your full amortization from today." />
          </div>
        )}

        {/* REFINANCE */}
        {mode === "refinance" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-neutral-100">
            <Metric
              label="Principal paid"
              value={formatCurrency(termPrincipal, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="How much of your refinanced balance you pay down during this term." />
            <Metric
              label="Interest paid"
              value={formatCurrency(termInterest, 0, true)}
              sub={`This ${inputs.termYears}-yr term`}
              tip="Total interest charges during this new term." />
            <Metric
              label="Balance at renewal"
              value={formatCurrency(outputs.termEndBalance, 0, true)}
              sub={`After ${inputs.termYears}-yr term`}
              tip="What you will owe when this new term ends." />
            <Metric
              label="Total interest"
              value={formatCurrency(outputs.totalInterest, 0, true)}
              sub={`Over ${inputs.amortizationYears} years`}
              tip="Total interest on the refinanced mortgage over the full amortization."
              highlight />
          </div>
        )}
      </div>
    </div>
  );
}
