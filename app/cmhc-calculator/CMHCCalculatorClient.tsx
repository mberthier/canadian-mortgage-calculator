"use client";

import React, { useState, useMemo } from "react";
import { calculateCMHCPremium, calculateCMHCProvincialTax, calculateMortgagePayment } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";
import { PROVINCES } from "@/lib/constants";

export default function CMHCCalculatorClient() {
  const [price, setPrice]       = useState(700_000);
  const [downPct, setDownPct]   = useState(10);
  const [rate, setRate]         = useState(3.89);
  const [amort, setAmort]       = useState(25);
  const [province, setProvince] = useState("ON");

  const down    = Math.round(price * (downPct / 100));
  const premium = useMemo(() => calculateCMHCPremium(price, down), [price, down]);
  const provTax = useMemo(() => calculateCMHCProvincialTax(premium, province), [premium, province]);
  const baseLoan     = Math.max(0, price - down);
  const insuredLoan  = baseLoan + premium;
  const paymentWith  = calculateMortgagePayment(insuredLoan, rate, amort, "monthly");
  const paymentWithout = calculateMortgagePayment(baseLoan, rate, amort, "monthly");
  const hasCMHC = premium > 0;
  const provName = PROVINCES.find(p => p.code === province)?.name ?? province;
  const provTaxName = province === "ON" ? "RST" : province === "QC" ? "QST" : "PST";

  const sel = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none";
  const inp = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Home Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
              <input type="number" min="100000" max="1500000" step="10000" value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`${inp} pl-7`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
              Down Payment — {formatCurrency(down, 0)}
            </label>
            <div className="relative">
              <input type="number" min="5" max="99" step="0.5" value={downPct}
                onChange={(e) => setDownPct(parseFloat(e.target.value))}
                className={`${inp} pr-8`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
            </div>
            <input type="range" min="5" max="30" step="0.5" value={downPct}
              onChange={(e) => setDownPct(parseFloat(e.target.value))}
              className="w-full mt-2 accent-blue-600" />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
              <span>5%</span><span style={{ color: "var(--green)" }} className="font-medium">20%</span><span>30%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Interest Rate</label>
            <div className="relative">
              <input type="number" min="0.5" max="15" step="0.05" value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className={`${inp} pr-8`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Province</label>
            <div className="relative">
              <select value={province} onChange={(e) => setProvince(e.target.value)} className={sel}>
                {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-neutral-100 p-6" style={{ background: hasCMHC ? "#f9f9f9" : "var(--green-light)" }}>
        {hasCMHC ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "CMHC Premium", value: formatCurrency(premium, 0), color: "var(--amber)" },
                { label: "Insured Mortgage", value: formatCurrency(insuredLoan, 0, true), color: "var(--ink)" },
                { label: "Monthly Payment", value: formatCurrency(paymentWith, 2), color: "var(--green)" },
                { label: provTaxName + " on CMHC (at closing)", value: provTax > 0 ? formatCurrency(provTax, 0) : "N/A in " + provName, color: provTax > 0 ? "var(--red)" : "var(--ink-faint)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl bg-white border border-neutral-100 p-3 text-center">
                  <p className="text-xs text-neutral-500 mb-1">{label}</p>
                  <p className="font-semibold text-base" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white border border-neutral-100 p-4">
              <p className="text-xs font-semibold text-neutral-600 mb-3">Payment comparison: {downPct.toFixed(1)}% down vs 20% down</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold" style={{ color: "var(--amber)" }}>{formatCurrency(paymentWith, 2)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">With CMHC ({downPct.toFixed(1)}% down)</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold" style={{ color: "var(--green)" }}>{formatCurrency(paymentWithout, 2)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Without CMHC (20% down)</p>
                </div>
              </div>
              <p className="text-xs text-center mt-3" style={{ color: "var(--ink-faint)" }}>
                Monthly saving by reaching 20% down: <span className="font-semibold text-neutral-700">{formatCurrency(paymentWith - paymentWithout, 2)}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-2xl font-semibold mb-1" style={{ color: "var(--green)" }}>No CMHC Required ✓</p>
            <p className="text-sm" style={{ color: "var(--green-mid)" }}>
              Your {downPct.toFixed(1)}% down payment is at or above 20% — no mortgage default insurance needed.
            </p>
            <p className="text-base font-semibold mt-3 text-neutral-800">
              Monthly payment: {formatCurrency(paymentWithout, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
