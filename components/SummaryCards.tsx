"use client";

import React, { useState } from "react";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  outputs: MortgageOutputs;
  inputs: MortgageInputs;
}

function MetricCard({ label, value, sub, valueColor }: {
  label: string; value: string; sub?: string; valueColor?: string;
}) {
  return (
    <div className="rounded-xl p-4 bg-white border border-stone-100">
      <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>{label}</p>
      <p className="text-xl font-semibold leading-tight" style={{ color: valueColor ?? "var(--ink)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ outputs, inputs }: Props) {
  const [showUpfrontDetail, setShowUpfrontDetail] = useState(false);
  const freqLabel  = FREQUENCY_LABELS[inputs.paymentFrequency];
  const mode       = inputs.mortgageMode;
  const isPurchase = mode === "purchase";
  const downPct    = inputs.homePrice > 0 ? ((inputs.downPayment / inputs.homePrice) * 100).toFixed(1) : "0";
  const equityPct  = inputs.homePrice > 0
    ? ((inputs.homePrice - outputs.termEndBalance) / inputs.homePrice * 100).toFixed(1) : "0";
  const hasCMHC    = outputs.cmhcPremium > 0;
  const earlyPayoff = outputs.effectiveAmortizationYears < inputs.amortizationYears - 0.1;

  return (
    <div className="space-y-4">
      {/* ── Hero payment ── */}
      <div className="rounded-2xl p-6" style={{ background: "var(--green)" }}>
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {freqLabel} Payment
        </p>
        <p className="font-display leading-none text-white" style={{ fontSize: "clamp(2.75rem, 8vw, 4.5rem)" }}>
          {formatCurrency(outputs.periodicPayment, 2)}
        </p>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.55)" }}>
          {inputs.interestRate}% · {inputs.amortizationYears}-yr amortization · {inputs.termYears}-yr term
        </p>

        {/* With/without CMHC comparison */}
        {hasCMHC && outputs.paymentWithoutCMHC > 0 && (
          <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
              Payment comparison
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Current ({downPct}% down + CMHC)</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(outputs.periodicPayment, 2)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>With 20% down (no CMHC)</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(outputs.paymentWithoutCMHC, 2)}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {outputs.periodicPayment > outputs.paymentWithoutCMHC
                    ? `saves ${formatCurrency(outputs.periodicPayment - outputs.paymentWithoutCMHC, 0)}/payment`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {earlyPayoff && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
            Paid off in {outputs.effectiveAmortizationYears.toFixed(1)} yrs with prepayments
          </div>
        )}
      </div>

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Monthly ownership"
          value={formatCurrency(outputs.totalMonthlyOwnership, 0)}
          sub="Mortgage + tax + insurance" />
        <MetricCard label="Total interest"
          value={formatCurrency(outputs.totalInterest, 0, true)}
          sub={`Over ${inputs.amortizationYears} years`}
          valueColor="var(--red)" />

        {/* Upfront cash — expandable, purchase mode only */}
        {isPurchase && (
          <div className="col-span-2 rounded-xl bg-white border border-stone-100 p-4">
            <button className="w-full text-left" onClick={() => setShowUpfrontDetail((o) => !o)}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
                  Total Upfront Cash
                </p>
                <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  {showUpfrontDetail ? "▲ hide" : "▼ breakdown"}
                </span>
              </div>
              <p className="text-xl font-semibold mt-1.5">{formatCurrency(outputs.totalUpfrontCash, 0)}</p>
            </button>

            {showUpfrontDetail && (
              <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-mid)" }}>Down payment ({downPct}%)</span>
                  <span className="font-medium">{formatCurrency(inputs.downPayment)}</span>
                </div>
                {outputs.ltt.net > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-mid)" }}>
                      Land transfer tax
                      {outputs.ltt.municipal > 0 && <span className="text-xs text-stone-400 ml-1">(prov + mun)</span>}
                    </span>
                    <span className="font-medium">{formatCurrency(outputs.ltt.net)}</span>
                  </div>
                )}
                {outputs.ltt.firstTimeBuyerRebate > 0 && (
                  <div className="flex justify-between text-xs" style={{ color: "var(--green-mid)" }}>
                    <span>First-time buyer rebate</span>
                    <span>− {formatCurrency(outputs.ltt.firstTimeBuyerRebate)}</span>
                  </div>
                )}
                {outputs.cmhcProvincialTax > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-mid)" }}>
                      {inputs.province === "ON" ? "RST" : inputs.province === "QC" ? "QST" : "PST"} on CMHC premium
                    </span>
                    <span className="font-medium">{formatCurrency(outputs.cmhcProvincialTax)}</span>
                  </div>
                )}
                {inputs.closingCosts > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--ink-mid)" }}>Closing costs</span>
                    <span className="font-medium">{formatCurrency(inputs.closingCosts)}</span>
                  </div>
                )}
                {outputs.gstHst.applies && (
                  <>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--ink-mid)" }}>
                        {["ON","NS","NB","NL","PE"].includes(inputs.province) ? "HST" : "GST"} — new build
                      </span>
                      <span className="font-medium">{formatCurrency(outputs.gstHst.gross)}</span>
                    </div>
                    {outputs.gstHst.federalRebate > 0 && (
                      <div className="flex justify-between text-xs" style={{ color: "var(--green-mid)" }}>
                        <span>New housing rebate</span>
                        <span>− {formatCurrency(outputs.gstHst.federalRebate)}</span>
                      </div>
                    )}
                  </>
                )}
                {inputs.closingCosts === 0 && (
                  <p className="text-xs pt-1" style={{ color: "var(--ink-faint)" }}>
                    Add closing costs in Advanced Options (legal, inspection, title insurance)
                  </p>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>{formatCurrency(outputs.totalUpfrontCash, 0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <MetricCard label="Mortgage amount"
          value={formatCurrency(outputs.insuredMortgage, 0, true)}
          sub={hasCMHC ? `Incl. ${formatCurrency(outputs.cmhcPremium, 0)} CMHC` : "No CMHC required"} />
        <MetricCard label="Balance at renewal"
          value={formatCurrency(outputs.termEndBalance, 0, true)}
          sub={`After ${inputs.termYears}-yr term`} />
      </div>

      {/* ── CMHC notice ── */}
      {hasCMHC && (
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--amber)" }}>
                CMHC Mortgage Insurance
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#a16207" }}>
                Premium of {formatCurrency(outputs.cmhcPremium, 0)} added to mortgage
                {outputs.cmhcProvincialTax > 0 && ` · ${inputs.province === "ON" ? "RST" : inputs.province === "QC" ? "QST" : "PST"} ${formatCurrency(outputs.cmhcProvincialTax, 0)} due at closing`}
              </p>
            </div>
            <p className="text-xl font-semibold shrink-0" style={{ color: "var(--amber)" }}>
              {formatCurrency(outputs.cmhcPremium, 0)}
            </p>
          </div>
        </div>
      )}

      {/* ── Term summary ── */}
      <div className="rounded-xl bg-white border border-stone-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--ink-faint)" }}>
          After {inputs.termYears}-Year Term
        </p>
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          {[
            { label: "Balance owing",  value: formatCurrency(outputs.termEndBalance,    0, true), color: "var(--ink)"       },
            { label: "Principal paid", value: formatCurrency(outputs.termPrincipalPaid, 0, true), color: "var(--green-mid)" },
            { label: "Interest paid",  value: formatCurrency(outputs.termInterestPaid,  0, true), color: "var(--red)"       },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-lg font-semibold" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{label}</p>
            </div>
          ))}
        </div>
        {isPurchase && inputs.homePrice > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink-faint)" }}>
              <span>Equity after term</span>
              <span className="font-medium" style={{ color: "var(--green-mid)" }}>
                {formatCurrency(inputs.homePrice - outputs.termEndBalance, 0, true)} ({equityPct}%)
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--cream-dark)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(equityPct), 100)}%`, background: "var(--green-mid)" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
