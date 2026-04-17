"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

// Statistics Canada 2024 median after-tax family income
const CANADIAN_MEDIAN_INCOME = 100_000; // Round number near Statistics Canada 2024 median

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

  const [annualIncome, setIncome] = useState(0);
  const [coIncome, setCoIncome]   = useState(0);
  const [monthlyDebts, setDebts]  = useState(0);
  const [downPayment, setDown]    = useState(currentDownPayment ?? 0);
  const [downSynced, setDownSynced] = useState(true);

  // Keep down payment synced with sidebar unless user has overridden it
  useEffect(() => {
    if (downSynced && currentDownPayment !== undefined) {
      setDown(currentDownPayment);
    }
  }, [currentDownPayment, downSynced]);

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

  const gdsColor = gds > GDS_LIMIT ? "#ef4444" : gds > GDS_LIMIT * 0.9 ? "var(--amber)" : "var(--green)";
  const tdsColor = tds > TDS_LIMIT ? "#ef4444" : tds > TDS_LIMIT * 0.9 ? "var(--amber)" : "var(--green)";

  function GaugeBar({ pct, limit }: { pct: number; limit: number }) {
    const color = pct > limit ? "#ef4444" : pct > limit * 0.9 ? "var(--amber)" : "var(--green)";
    return (
      <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#e8e8e8" }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min((pct / limit) * 100, 100)}%`, background: color }} />
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
      {/* Header, always visible */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v6l4 2"
              stroke="var(--brand-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand-teal)" }}>
            Can you actually afford this?
          </p>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink-mid)" }}
          aria-expanded={open}>
          <span className="text-base leading-none">{open ? "−" : "+"}</span>
        </button>
      </div>
      {!open && (
        <div className="px-5 py-3">
          <p className="text-sm text-neutral-600">
            Enter your income to calculate your GDS and TDS ratios, the two numbers lenders use to decide if you qualify.
          </p>
        </div>
      )}

      {open && (
        <div className="border-t border-neutral-100">
          {/* Prompt when no income yet */}
          {annualIncome === 0 && coIncome === 0 && (
            <div className="px-6 py-5 text-center" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <p className="text-sm font-medium text-neutral-700 mb-1">Enter your income below to see your ratios</p>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                GDS and TDS tell you whether you qualify at this mortgage size.
              </p>
            </div>
          )}

          {/* GDS/TDS gauges + verdict, only when income entered */}
          {(annualIncome > 0 || coIncome > 0) && (
            <>
              <div className="px-6 py-4 grid grid-cols-2 gap-3">
                {[
                  { key: "GDS", pct: gds, limit: GDS_LIMIT, color: gdsColor,
                    tip: "Gross Debt Service ratio. Measures your housing costs as a percentage of gross income. Includes: mortgage principal and interest, property tax, heating costs, and 50% of condo fees. Lender limit: 39%." },
                  { key: "TDS", pct: tds, limit: TDS_LIMIT, color: tdsColor,
                    tip: "Total Debt Service ratio. Takes GDS and adds all your other monthly debt payments. Includes: car loans, student loans, credit card minimum payments, lines of credit. Lender limit: 44%." },
                ].map(({ key, pct, limit, color, tip }) => (
                  <div key={key} className="rounded-xl bg-white border border-neutral-100 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-600 flex items-center">
                        {key}<Tooltip content={tip} />
                      </span>
                      <span className="text-xs text-neutral-400">limit {limit}%</span>
                    </div>
                    <p className="text-2xl font-semibold font-display leading-none mb-2" style={{ color }}>
                      {pct.toFixed(1)}%
                    </p>
                    <GaugeBar pct={pct} limit={limit} />
                  </div>
                ))}
              </div>
              <div className="px-6 py-3"
                style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: qualifies ? "var(--green-light)" : "#fef2f2" }}>
                <p className="text-sm font-semibold" style={{ color: qualifies ? "var(--green)" : "#ef4444" }}>
                  {qualifies
                    ? `✓ At ${formatCurrency(annualIncome + coIncome, 0)}/yr gross income, you likely qualify`
                    : `✗ At ${formatCurrency(annualIncome + coIncome, 0)}/yr gross income, this may exceed qualification limits`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: qualifies ? "var(--green-mid)" : "#991b1b" }}>
                  Qualifying at stress test rate {stressRate.toFixed(2)}%
                </p>
              </div>
            </>
          )}

          {/* Inputs */}
          <div className="px-6 py-4 space-y-4" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Enter your gross (pre-tax) annual income, lenders use this to calculate how much you qualify for.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  label: "Gross annual income",
                  value: annualIncome, set: setIncome,
                  tip: "Your total pre-tax income from all sources, employment, self-employment, rental income. This is what lenders use, not your take-home pay.",
                  placeholder: "e.g. 95,000",
                },
                {
                  label: "Co-applicant income",
                  value: coIncome, set: setCoIncome,
                  tip: "If applying with a partner or co-signer, add their gross annual income here. Leave at $0 if applying alone.",
                  placeholder: "e.g. 75,000",
                },
                {
                  label: "Monthly debts",
                  value: monthlyDebts, set: setDebts,
                  tip: "Monthly minimum payments on all existing debts: car loans, student loans, credit card minimums, lines of credit, child support. Do not include the mortgage you are calculating, that is already included in TDS.",
                  placeholder: "e.g. 500",
                },
              ] as const).map(({ label, value, set, tip, placeholder }) => (
                <div key={label}>
                  <label className="flex items-center text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide gap-0.5">
                    {label}<Tooltip content={tip} />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                    <input type="text" inputMode="numeric"
                      placeholder={placeholder}
                      value={value > 0 ? value.toLocaleString("en-CA") : ""}
                      onChange={(e) => set(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                  Down payment
                  <Tooltip content="Pre-filled from your calculator inputs." />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input type="text" inputMode="numeric"
                    value={downPayment > 0 ? downPayment.toLocaleString("en-CA") : ""}
                    onChange={(e) => {
                      setDown(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0);
                      setDownSynced(false);
                    }}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Max purchase price */}
            {maxPrice > 0 && (
              <div className="rounded-xl p-4 border border-neutral-100 bg-white">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                  Estimated max purchase price
                </p>
                <p className="font-display text-3xl leading-none mb-1" style={{ color: "var(--brand-teal)" }}>
                  {formatCurrency(maxPrice, 0)}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  With {formatCurrency(downPayment, 0)} down · stress test rate {stressRate.toFixed(2)}%
                </p>
              </div>
            )}

            <Link href="/affordability"
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--green)" }}>
              Full affordability & stress test calculator →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
