"use client";

import React, { useState } from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import Tooltip from "./Tooltip";
import ShareButton from "./ShareButton";

interface Props {
  outputs: MortgageOutputs;
  inputs:  MortgageInputs;
  shareURL?: string;
}

interface MetricProps {
  label: string;
  value: string;
  sub?: string;
  tip?: string;
  highlight?: boolean;
}

function Metric({ label, value, sub, tip, highlight }: MetricProps) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-white border border-stone-100" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-wide flex items-center gap-0.5 mb-1"
        style={{ color: "var(--ink-faint)" }}>
        {label}{tip && <Tooltip content={tip} />}
      </p>
      <p className="text-xl font-semibold text-stone-800">{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ outputs, inputs, shareURL }: Props) {
  const [showUpfront, setShowUpfront] = useState(false);
  const hasCMHC    = outputs.cmhcPremium > 0;
  const hasLTT     = outputs.ltt.net > 0;
  const hasGST     = outputs.gstHst.net > 0;
  const freq       = FREQUENCY_LABELS[inputs.paymentFrequency];
  const isPurchase = inputs.mortgageMode === "purchase";

  return (
    <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm">

      {/* Hero payment */}
      <div className="px-6 pt-6 pb-5" style={{ background: "var(--green)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "rgba(255,255,255,0.65)" }}>
          {freq} Payment
        </p>
        <p className="font-display leading-none mb-1" style={{ fontSize: 52, color: "#fff" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>
        {hasCMHC && (
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Without CMHC: </span>
              <span className="font-semibold text-white">{formatCurrency(outputs.paymentWithoutCMHC, 2)}</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>CMHC adds: </span>
              <span className="font-semibold text-white">
                {formatCurrency(outputs.periodicPayment - outputs.paymentWithoutCMHC, 2)}/{freq.toLowerCase().replace("ly","").replace("eekly","k").replace("monthly","mo").replace("bi-weekly","2wk")}
              </span>
            </div>
          </div>
        )}

        {/* Share button — prominent, in the hero */}
        {shareURL && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
            <ShareButton url={shareURL} variant="hero" />
          </div>
        )}
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-stone-100"
        style={{ background: "var(--cream)" }}>
        <Metric label="Monthly ownership"
          value={formatCurrency(outputs.totalMonthlyOwnership, 0)}
          sub="Mortgage + tax + heat"
          tip="Your total monthly cost of ownership: mortgage payment, property tax, heating, home insurance, and condo fees (if applicable). This is the number that matters for budgeting." />
        <Metric label="Total interest"
          value={formatCurrency(outputs.totalInterest, 0, true)}
          sub={`Over ${inputs.amortizationYears} years`}
          tip="The total interest you'll pay over the full amortization period. This number shrinks significantly with accelerated payments or lump sum prepayments." />
        <Metric label="Balance at renewal"
          value={formatCurrency(outputs.termEndBalance, 0, true)}
          sub={`After ${inputs.termYears}-yr term`}
          tip="How much you'll still owe when your current term ends and you need to renew. This is the number your future rate will be applied to." />
        <Metric label="Mortgage amount"
          value={formatCurrency(outputs.insuredMortgage, 0, true)}
          sub={hasCMHC ? `Incl. ${formatCurrency(outputs.cmhcPremium, 0)} CMHC` : "No CMHC required"}
          tip={hasCMHC
            ? "Your mortgage includes the CMHC insurance premium, which is added to your principal balance. You pay interest on this amount over your full amortization."
            : "Your down payment is 20% or more — no CMHC mortgage default insurance required."} />
      </div>

      {/* CMHC notice */}
      {hasCMHC && (
        <div className="px-5 py-3 border-t border-stone-100 flex items-start gap-2"
          style={{ background: "#fffbeb" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="#d97706" strokeWidth="1.5"/>
            <path d="M7 4v4M7 9.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: "#92400e" }}>
            <span className="font-semibold">CMHC mortgage insurance applies.</span>{" "}
            Your {(inputs.downPaymentPercent).toFixed(1)}% down payment triggers a{" "}
            {formatCurrency(outputs.cmhcPremium, 0)} premium added to your mortgage — not due at closing, but you'll pay interest on it for the full amortization period.
            {outputs.cmhcProvincialTax > 0 && (
              <span> Provincial tax on the premium ({formatCurrency(outputs.cmhcProvincialTax, 0)}) is due at closing.</span>
            )}
          </p>
        </div>
      )}

      {/* Upfront costs */}
      {isPurchase && (
        <div className="border-t border-stone-100">
          <button onClick={() => setShowUpfront(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors text-left"
            aria-expanded={showUpfront}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-700">Total upfront cash needed</p>
              <Tooltip content="Everything you need to bring to closing day — down payment, land transfer tax, CMHC provincial tax (ON/QC/SK), closing costs (legal fees, title insurance, inspection), and GST/HST on new builds. This is the full number you need in your bank account." />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-base font-semibold" style={{ color: "var(--green)" }}>
                {formatCurrency(outputs.totalUpfrontCash, 0)}
              </p>
              <span className="text-stone-400 text-lg leading-none">{showUpfront ? "−" : "+"}</span>
            </div>
          </button>

          {showUpfront && (
            <div className="px-5 pb-5 border-t border-stone-50 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-mid)" }}>Down payment</span>
                <span className="font-medium text-stone-800">{formatCurrency(inputs.downPayment)}</span>
              </div>
              {hasLTT && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-mid)" }}>Land transfer tax</span>
                    <span className="font-medium text-stone-800">{formatCurrency(outputs.ltt.provincial + outputs.ltt.municipal)}</span>
                  </div>
                  {outputs.ltt.firstTimeBuyerRebate > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--green-mid)" }}>
                      <span>First-time buyer rebate</span>
                      <span className="font-medium">− {formatCurrency(outputs.ltt.firstTimeBuyerRebate)}</span>
                    </div>
                  )}
                </>
              )}
              {outputs.cmhcProvincialTax > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-mid)" }}>Provincial tax on CMHC</span>
                  <span className="font-medium text-stone-800">{formatCurrency(outputs.cmhcProvincialTax)}</span>
                </div>
              )}
              {inputs.closingCosts > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-mid)" }}>Closing costs (est.)</span>
                  <span className="font-medium text-stone-800">{formatCurrency(inputs.closingCosts)}</span>
                </div>
              )}
              {hasGST && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-mid)" }}>GST/HST (new build)</span>
                    <span className="font-medium text-stone-800">{formatCurrency(outputs.gstHst.gross)}</span>
                  </div>
                  {outputs.gstHst.federalRebate > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--green-mid)" }}>
                      <span>Federal new housing rebate</span>
                      <span className="font-medium">− {formatCurrency(outputs.gstHst.federalRebate)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-100 pt-2 mt-1">
                <span>Total upfront cash</span>
                <span style={{ color: "var(--green)" }}>{formatCurrency(outputs.totalUpfrontCash, 0)}</span>
              </div>
              {!inputs.closingCosts && (
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  Add closing costs in "More options" for a complete picture.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
