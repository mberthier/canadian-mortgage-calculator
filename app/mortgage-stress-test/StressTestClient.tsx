"use client";

import React, { useState } from "react";
import { calculateMortgagePayment } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

export default function StressTestClient() {
  const [price, setPrice]   = useState(700_000);
  const [down, setDown]     = useState(140_000);
  const [rate, setRate]     = useState(3.89);
  const [amort, setAmort]   = useState(25);
  const [income, setIncome] = useState(150_000);
  const [tax, setTax]       = useState(5_200);
  const [heat, setHeat]     = useState(150);

  const downPct       = price > 0 ? (down / price) * 100 : 0;
  const loan          = Math.max(0, price - down);
  const stressRate    = Math.max(rate + 2, 5.25);
  const monthlyActual = calculateMortgagePayment(loan, rate, amort, "monthly");
  const monthlyStress = calculateMortgagePayment(loan, stressRate, amort, "monthly");
  const monthlyIncome = income / 12;
  const mTax          = tax / 12;

  const gds = monthlyIncome > 0 ? ((monthlyStress + mTax + heat) / monthlyIncome) * 100 : 0;
  const tds = gds; // simplified (no other debts in this calculator)
  const passes = gds <= 39 && tds <= 44;

  const inp = "w-full pl-7 pr-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Home Price", value: price, set: setPrice },
            { label: "Down Payment", value: down, set: setDown },
            { label: "Gross Household Income", value: income, set: setIncome },
            { label: "Annual Property Tax", value: tax, set: setTax },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                <input type="number" min="0" step={value >= 10000 ? 10000 : 100} value={value}
                  onChange={(e) => set(Number(e.target.value))} className={inp} />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Contract Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">%</span>
              <input type="number" min="0.5" max="15" step="0.05" value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 p-6 space-y-4" style={{ background: "#fafafa" }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Your Contract Rate", value: `${rate.toFixed(2)}%`, color: "var(--green)" },
            { label: "Stress Test Rate", value: `${stressRate.toFixed(2)}%`, color: "var(--amber)" },
            { label: "Qualifying Payment", value: formatCurrency(monthlyStress, 0) + "/mo", color: "var(--ink)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl bg-white border border-neutral-100 p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">{label}</p>
              <p className="font-semibold text-base" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 border"
          style={passes
            ? { background: "var(--green-light)", borderColor: "var(--green-border)" }
            : { background: "#fef2f2", borderColor: "#fecaca" }}>
          <p className="font-semibold text-sm" style={{ color: passes ? "var(--green)" : "var(--red)" }}>
            {passes
              ? `✓  You pass the stress test. GDS ${gds.toFixed(1)}% is within the 39% limit`
              : `✗  You don't pass. GDS ${gds.toFixed(1)}% exceeds the 39% limit at the stress test rate`}
          </p>
          <p className="text-xs mt-1" style={{ color: passes ? "var(--green-mid)" : "#991b1b" }}>
            Actual monthly payment: {formatCurrency(monthlyActual, 0)} · Stress test payment: {formatCurrency(monthlyStress, 0)} · Down: {downPct.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
