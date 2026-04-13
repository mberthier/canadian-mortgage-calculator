"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { formatCurrency } from "@/lib/formatters";
import Tooltip from "./Tooltip";
import { calculateMortgagePayment, calculateCMHCPremium } from "@/lib/mortgageMath";

interface Props {
  currentHomePrice:    number;
  currentRate:         number;
  currentAmortization: number;
  currentPropertyTax:  number;
  currentHeating:      number;
  currentCondoFees:    number;
  currentDownPayment?: number;
}

// Canadian median after-tax family income 2024 (Statistics Canada)
const CANADIAN_MEDIAN_INCOME = 92_000;

export default function AffordabilityCalculator({
  currentHomePrice, currentRate, currentAmortization,
  currentPropertyTax, currentHeating, currentCondoFees,
  currentDownPayment,
}: Props) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener("open-section", handler);
    return () => el.removeEventListener("open-section", handler);
  }, []);

  const [annualIncome, setIncome] = useState(CANADIAN_MEDIAN_INCOME);
  const [coIncome, setCoIncome]   = useState(0);
  const [monthlyDebts, setDebts]  = useState(0);
  // Sync down payment from sidebar when it changes (only if user hasn't overridden)
  const [downPayment, setDown]    = useState(currentDownPayment ?? 0);
  const [downOverridden, setDownOverridden] = useState(false);

  useEffect(() => {
    if (!downOverridden && currentDownPayment !== undefined) {
      setDown(currentDownPayment);
    }
  }, [currentDownPayment, downOverridden]);

  const GDS_LIMIT = 39;
  const TDS_LIMIT = 44;

  const stressRate    = Math.max(currentRate + 2, 5.25);
  const monthlyIncome = (annualIncome + coIncome) / 12;
  const cmhc          = calculateCMHCPremium(currentHomePrice, downPayment);
  const loan          = Math.max(0, currentHomePrice - downPayment) + cmhc;
  const mPayment      = calculateMortgagePayment(loan, stressRate, currentAmortization, "monthly");
  const mTax          = currentPropertyTax / 12;
  const gdsNum        = mPayment + mTax + currentHeating + currentCondoFees * 0.5;
  const tdsNum        = gdsNum + monthlyDebts;
  const gds           = monthlyIncome > 0 ? (gdsNum / monthlyIncome) * 100 : 0;
  const tds           = monthlyIncome > 0 ? (tdsNum / monthlyIncome) * 100 : 0;
  const qualifies     = gds <= GDS_LIMIT && tds <= TDS_LIMIT;

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
    const color = pct > limit ? "#ef4444" : pct > limit * 0.9 ? "var(--amber)" : "var(--green-mid)";
    return (
      <div className="w-full rounded-full h-1.5 overflow-hidden mt-2" style={{ background: "var(--cream-dark)" }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min((pct / limit) * 100, 100)}%`, background: color }} />
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="rounded-2xl bg-white border border-stone-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
        aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-800">Can you actually afford this?</p>
          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
            style={{ background: "var(--green-light)", color: "var(--green)" }}>GDS · TDS</span>
        </div>
        <span className="text-stone-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-5">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            Lenders qualify you at the stress test rate of <strong className="text-stone-600">{stressRate.toFixed(2)}%</strong>.
            CMHC limits: <strong className="text-stone-600">GDS ≤ {GDS_LIMIT}%</strong> and <strong className="text-stone-600">TDS ≤ {TDS_LIMIT}%</strong>.
            Pre-filled with Canadian median household income ({formatCurrency(CANADIAN_MEDIAN_INCOME, 0)}).
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Your Annual Income",  value: annualIncome, set: setIncome, override: false },
              { label: "Co-applicant Income", value: coIncome,     set: setCoIncome, override: false },
              { label: "Monthly Debts",        value: monthlyDebts, set: setDebts, override: false },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input type="text" inputMode="numeric"
                    value={value > 0 ? value.toLocaleString("en-CA") : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      set(raw ? parseInt(raw) : 0);
                    }}
                    className={inp} />
                </div>
              </div>
            ))}
            {/* Down payment — syncs from sidebar */}
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                Down Payment
                <Tooltip content="Pre-filled from your calculator. Edit here to see how a different down payment affects qualification." />
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="text" inputMode="numeric"
                  value={downPayment > 0 ? downPayment.toLocaleString("en-CA") : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setDown(raw ? parseInt(raw) : 0);
                    setDownOverridden(true);
                  }}
                  className={inp} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: "GDS", label: "Gross Debt Service", tip: "GDS measures your housing costs as a percentage of income. Includes mortgage P&I, property taxes, heating, and 50% of condo fees. CMHC limit is 39%.", sub: "P&I + taxes + heat + ½ condo", pct: gds, limit: GDS_LIMIT },
              { key: "TDS", label: "Total Debt Service",  tip: "TDS measures all debt obligations as a percentage of income. Includes GDS plus car loans, student loans, credit card minimums. CMHC limit is 44%.", sub: "GDS + all monthly debts",       pct: tds, limit: TDS_LIMIT },
            ].map(({ key, label, tip, sub, pct, limit }) => {
              const color = pct > limit ? "#ef4444" : pct > limit * 0.9 ? "var(--amber)" : "var(--green)";
              return (
                <div key={key} className="rounded-xl p-3 border border-stone-100" style={{ background: "var(--cream)" }}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-xs font-semibold text-stone-700 flex items-center">{key} — {label}<Tooltip content={tip} /></p>
                      <p className="text-xs text-stone-400">{sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold font-display" style={{ color }}>{pct.toFixed(1)}%</p>
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
            <p className="font-semibold text-sm" style={{ color: qualifies ? "var(--green)" : "#ef4444" }}>
              {qualifies ? "✓  You likely qualify for this mortgage" : "✗  This may exceed qualification limits"}
            </p>
            <p className="text-xs mt-1" style={{ color: qualifies ? "var(--green-mid)" : "#991b1b" }}>
              At stress test rate {stressRate.toFixed(2)}% · income {formatCurrency(annualIncome + coIncome, 0)}/yr
            </p>
          </div>

          <div className="rounded-xl p-4 border border-stone-100 bg-white">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Estimated max purchase price</p>
            <p className="font-display text-4xl leading-none mb-2" style={{ color: "var(--green)" }}>
              {formatCurrency(maxPrice, 0)}
            </p>
            <p className="text-xs text-stone-400">
              With {formatCurrency(downPayment, 0)} down · stress test rate {stressRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
