"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  amortizationYears: number;
  lumpSumsByYear: Record<number, number>;
  setLumpSumForYear: (year: number, amount: number) => void;
  interestSaved: number;
  paymentsSaved: number;
}

export default function LumpSumByYear({
  amortizationYears, lumpSumsByYear, setLumpSumForYear,
  interestSaved, paymentsSaved,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [rawValues, setRawValues] = useState<Record<number, string>>({});

  const yearsWithPayments = Object.values(lumpSumsByYear).filter((v) => v > 0).length;
  const total = Object.values(lumpSumsByYear).reduce((s, v) => s + (v || 0), 0);
  const yearsSaved  = Math.floor(paymentsSaved / 12);
  const monthsSaved = paymentsSaved % 12;

  return (
    <div className="border-t border-stone-100 pt-5">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
        aria-expanded={open}>
        <span>Lump Sum Payments</span>
        <div className="flex items-center gap-2">
          {yearsWithPayments > 0 && (
            <span className="text-xs font-medium rounded-full px-2 py-0.5 normal-case"
              style={{ background: "var(--green-light)", color: "var(--green)" }}>
              {yearsWithPayments} year{yearsWithPayments > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-base">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            Applied on your mortgage anniversary date — after the last payment of Year N,
            reducing the balance before Year N+1's first payment.
          </p>

          {/* Interest savings callout */}
          {interestSaved > 0 && (
            <div className="rounded-xl p-3 border" style={{ background: "var(--green-light)", borderColor: "var(--green-border)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--green)" }}>
                Your lump sums save you:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <p className="text-sm font-semibold" style={{ color: "var(--green)" }}>
                  {formatCurrency(interestSaved, 0)} in interest
                </p>
                {paymentsSaved > 0 && (
                  <p className="text-sm font-semibold" style={{ color: "var(--green)" }}>
                    {yearsSaved > 0 ? `${yearsSaved}yr ` : ""}{monthsSaved > 0 ? `${monthsSaved}mo ` : ""}shorter amortization
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
            {Array.from({ length: amortizationYears }, (_, i) => i + 1).map((year) => {
              const value    = lumpSumsByYear[year] ?? 0;
              const isFocused = focused === year;
              return (
                <div key={year} className="rounded-lg border p-2 transition-colors"
                  style={{
                    borderColor: value > 0 ? "var(--green-border)" : "#e7e5e4",
                    background:  value > 0 ? "var(--green-light)" : "#fff",
                  }}>
                  <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>After Yr {year}</p>
                  <div className="relative">
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                    <input type="text" inputMode="numeric" placeholder="0"
                      value={isFocused ? (rawValues[year] ?? "") : value > 0 ? value.toLocaleString("en-CA") : ""}
                      onChange={(e) => setRawValues((p) => ({ ...p, [year]: e.target.value.replace(/[^0-9]/g, "") }))}
                      onFocus={() => { setFocused(year); setRawValues((p) => ({ ...p, [year]: value > 0 ? String(value) : "" })); }}
                      onBlur={() => {
                        setFocused(null);
                        const v = parseInt(rawValues[year] ?? "0", 10);
                        setLumpSumForYear(year, isNaN(v) ? 0 : v);
                      }}
                      className="w-full bg-white border border-stone-200 rounded text-xs text-stone-900 pl-4 pr-1 py-1.5 focus:outline-none focus:border-green-700 placeholder-stone-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {total > 0 && (
            <p className="text-xs font-semibold" style={{ color: "var(--green)" }}>
              Total lump sums: {formatCurrency(total, 0)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
