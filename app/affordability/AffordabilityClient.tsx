"use client";

import React, { useState, useMemo } from "react";
import { calculateMortgagePayment, calculateCMHCPremium } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

export default function AffordabilityClient() {
  const [income, setIncome]       = useState(120_000);
  const [coIncome, setCo]         = useState(0);
  const [debts, setDebts]         = useState(0);
  const [down, setDown]           = useState(150_000);
  const [rate, setRate]           = useState(3.89);
  const [tax, setTax]             = useState(5_200);
  const [heat, setHeat]           = useState(150);
  const [condo, setCondo]         = useState(0);

  const GDS_LIMIT = 39;
  const TDS_LIMIT = 44;

  const stressRate    = Math.max(rate + 2, 5.25);
  const monthlyIncome = (income + coIncome) / 12;
  const mTax          = tax / 12;

  const maxMonthly = Math.max(0, Math.min(
    monthlyIncome * (GDS_LIMIT / 100) - mTax - heat - condo * 0.5,
    monthlyIncome * (TDS_LIMIT / 100) - mTax - heat - condo * 0.5 - debts,
  ));

  const semi = stressRate / 100 / 2;
  const eff  = Math.pow(1 + semi, 2) - 1;
  const mr   = Math.pow(1 + eff, 1 / 12) - 1;
  const n    = 25 * 12;
  const maxLoan  = mr > 0 ? maxMonthly * (1 - Math.pow(1 + mr, -n)) / mr : maxMonthly * n;
  const maxPrice = Math.max(0, maxLoan + down);

  const bindingConstraint = (() => {
    const gdsMax = monthlyIncome * (GDS_LIMIT / 100) - mTax - heat - condo * 0.5;
    const tdsMax = monthlyIncome * (TDS_LIMIT / 100) - mTax - heat - condo * 0.5 - debts;
    return gdsMax <= tdsMax ? "GDS" : "TDS";
  })();

  const inp = "w-full pl-7 pr-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";
  const inpR = "w-full px-3 pr-8 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Your Annual Income", value: income, set: setIncome },
            { label: "Co-Applicant Income", value: coIncome, set: setCo },
            { label: "Monthly Debt Payments", value: debts, set: setDebts },
            { label: "Down Payment", value: down, set: setDown },
            { label: "Annual Property Tax", value: tax, set: setTax },
            { label: "Monthly Heating", value: heat, set: setHeat },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                <input type="number" min="0" step={value >= 10000 ? 1000 : 50} value={value}
                  onChange={(e) => set(Number(e.target.value))} className={inp} />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
              Interest Rate (stress test: {stressRate.toFixed(2)}%)
            </label>
            <div className="relative">
              <input type="number" min="0.5" max="15" step="0.05" value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))} className={`${inpR} pr-8`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 p-6" style={{ background: "#f8f8f8" }}>
        <div className="text-center mb-5">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
            Estimated Max Purchase Price
          </p>
          <p className="font-display text-5xl leading-none" style={{ color: "var(--green)" }}>
            {formatCurrency(maxPrice, 0)}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
            With {formatCurrency(down)} down · qualifying at {stressRate.toFixed(2)}% · limited by {bindingConstraint} ratio
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Max Monthly Payment", value: formatCurrency(maxMonthly, 2), color: "var(--green)" },
            { label: "Max Mortgage Amount", value: formatCurrency(maxLoan, 0, true), color: "var(--ink)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl bg-white border border-neutral-100 p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">{label}</p>
              <p className="font-semibold text-base" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
