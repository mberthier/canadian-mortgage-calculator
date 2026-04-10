"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment, calculateCMHCPremium } from "@/lib/mortgageMath";

interface Props {
  currentHomePrice:    number;
  currentRate:         number;
  currentAmortization: number;
  currentPropertyTax:  number;
  currentHeating:      number;
  currentCondoFees:    number;
}

export default function AffordabilityCalculator({
  currentHomePrice, currentRate, currentAmortization,
  currentPropertyTax, currentHeating, currentCondoFees,
}: Props) {
  const [open, setOpen]             = useState(false);
  const [annualIncome, setIncome]   = useState(120_000);
  const [coIncome, setCoIncome]     = useState(0);
  const [monthlyDebts, setDebts]    = useState(0);
  const [downPayment, setDown]      = useState(150_000);

  // CMHC rules updated Dec 2024: GDS ≤ 39%, TDS ≤ 44%
  const GDS_LIMIT = 39;
  const TDS_LIMIT = 44;

  const stressRate     = Math.max(currentRate + 2, 5.25);
  const monthlyIncome  = (annualIncome + coIncome) / 12;
  const cmhc           = calculateCMHCPremium(currentHomePrice, downPayment);
  const loan           = Math.max(0, currentHomePrice - downPayment) + cmhc;
  const mPayment       = calculateMortgagePayment(loan, stressRate, currentAmortization, "monthly");
  const mTax           = currentPropertyTax / 12;
  // GDS: P&I + taxes + heat + 50% condo fees
  const gdsNum         = mPayment + mTax + currentHeating + currentCondoFees * 0.5;
  const tdsNum         = gdsNum + monthlyDebts;
  const gds            = monthlyIncome > 0 ? (gdsNum / monthlyIncome) * 100 : 0;
  const tds            = monthlyIncome > 0 ? (tdsNum / monthlyIncome) * 100 : 0;
  const qualifies      = gds <= GDS_LIMIT && tds <= TDS_LIMIT;

  // Max purchase price
  const maxMonthly = Math.max(0, Math.min(
    monthlyIncome * (GDS_LIMIT / 100) - mTax - currentHeating - currentCondoFees * 0.5,
    monthlyIncome * (TDS_LIMIT / 100) - mTax - currentHeating - currentCondoFees * 0.5 - monthlyDebts,
  ));
  const semi  = stressRate / 100 / 2;
  const eff   = Math.pow(1 + semi, 2) - 1;
  const mr    = Math.pow(1 + eff, 1 / 12) - 1;
  const n     = currentAmortization * 12;
  const maxLoan  = mr > 0 ? maxMonthly * (1 - Math.pow(1 + mr, -n)) / mr : maxMonthly * n;
  const maxPrice = Math.max(0, maxLoan + downPayment);

  const inp = "w-full pl-7 pr-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors";

  function GaugeBar({ pct, limit }: { pct: number; limit: number }) {
    const color = pct > limit ? "var(--red)" : pct > limit * 0.9 ? "var(--amber)" : "var(--green-mid)";
    return (
      <div className="w-full rounded-full h-1.5 overflow-hidden mt-2" style={{ background: "var(--cream-dark)" }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min((pct / limit) * 100, 100)}%`, background: color }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
        aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-800">Affordability & Qualification</p>
          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
            style={{ background: "var(--green-light)", color: "var(--green)" }}>GDS · TDS</span>
        </div>
        <span className="text-stone-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-5">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            Lenders qualify you at the stress test rate of <strong className="text-stone-600">{stressRate.toFixed(2)}%</strong>.
            As of December 2024, CMHC rules allow <strong className="text-stone-600">GDS ≤ {GDS_LIMIT}%</strong> and <strong className="text-stone-600">TDS ≤ {TDS_LIMIT}%</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Your Annual Income",  value: annualIncome, set: setIncome },
              { label: "Co-applicant Income", value: coIncome,     set: setCoIncome },
              { label: "Monthly Debts",        value: monthlyDebts, set: setDebts },
              { label: "Down Payment",         value: downPayment,  set: setDown },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input type="number" min="0" step={value >= 10000 ? 1000 : 100} value={value}
                    onChange={(e) => set(Number(e.target.value))} className={inp} />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { key: "GDS", label: "Gross Debt Service", sub: "P&I + taxes + heat + ½ condo", pct: gds, limit: GDS_LIMIT },
              { key: "TDS", label: "Total Debt Service",  sub: "GDS + all monthly debts",       pct: tds, limit: TDS_LIMIT },
            ].map(({ key, label, sub, pct, limit }) => {
              const color = pct > limit ? "var(--red)" : pct > limit * 0.9 ? "var(--amber)" : "var(--green)";
              return (
                <div key={key} className="rounded-xl p-3 border border-stone-100" style={{ background: "var(--cream)" }}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-xs font-semibold text-stone-700">{key} — {label}</p>
                      <p className="text-xs text-stone-400">{sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold font-display" style={{ color }}>
                        {pct.toFixed(1)}%
                      </p>
                      <p className="text-xs text-stone-400">limit {limit}%</p>
                    </div>
                  </div>
                  <GaugeBar pct={pct} limit={limit} />
                </div>
              );
            })}
          </div>

          <div className="rounded-xl p-4 border"
            style={qualifies
              ? { background: "var(--green-light)", borderColor: "var(--green-border)" }
              : { background: "#fef2f2", borderColor: "#fecaca" }}>
            <p className="font-semibold text-sm" style={{ color: qualifies ? "var(--green)" : "var(--red)" }}>
              {qualifies ? "✓  You likely qualify for this mortgage" : "✗  This may exceed qualification limits"}
            </p>
            <p className="text-xs mt-1" style={{ color: qualifies ? "var(--green-mid)" : "#991b1b" }}>
              At stress test rate {stressRate.toFixed(2)}% · income {formatCurrency(annualIncome + coIncome)}/yr
            </p>
          </div>

          <div className="rounded-xl p-4 border border-stone-100 bg-white">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Estimated max purchase price</p>
            <p className="font-display text-4xl leading-none mb-2" style={{ color: "var(--green)" }}>
              {formatCurrency(maxPrice, 0)}
            </p>
            <p className="text-xs text-stone-400">
              With {formatCurrency(downPayment)} down at stress test rate {stressRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
