"use client";

import React, { useState, useMemo } from "react";
import { calculateBreakPenalty } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

export default function BreakPenaltyCalculatorClient() {
  const [balance, setBalance]         = useState(480_000);
  const [originalRate, setOrig]       = useState(4.5);
  const [currentRate, setCurrent]     = useState(3.89);
  const [remainingMonths, setMonths]  = useState(36);
  const [isVariable, setVariable]     = useState(false);

  const result = useMemo(
    () => calculateBreakPenalty(balance, originalRate, currentRate, remainingMonths, isVariable),
    [balance, originalRate, currentRate, remainingMonths, isVariable],
  );

  const inp = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 space-y-5">
        {/* Mortgage type */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Mortgage type
          </label>
          <div className="flex rounded-lg overflow-hidden border border-neutral-200 w-fit">
            {[false, true].map((v) => (
              <button key={String(v)} type="button" onClick={() => setVariable(v)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={isVariable === v
                  ? { background: "var(--green)", color: "#fff" }
                  : { background: "#fff", color: "var(--ink-mid)" }}>
                {v ? "Variable" : "Fixed"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
              Remaining balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
              <input type="text" inputMode="numeric"
                value={balance > 0 ? balance.toLocaleString("en-CA") : ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/[^0-9]/g, ""));
                  if (!isNaN(v)) setBalance(v);
                }}
                className={`${inp} pl-7`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
              Months remaining in term
            </label>
            <input type="number" min="1" max="120" step="1" value={remainingMonths}
              onChange={(e) => setMonths(Number(e.target.value))}
              className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
              Your contracted rate
            </label>
            <div className="relative">
              <input type="text" inputMode="decimal"
                value={originalRate > 0 ? originalRate.toFixed(2) : ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) setOrig(v);
                }}
                className={`${inp} pr-8`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
            </div>
          </div>

          {!isVariable && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                Lender's current rate
              </label>
              <div className="relative">
                <input type="text" inputMode="decimal"
                  value={currentRate > 0 ? currentRate.toFixed(2) : ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setCurrent(v);
                  }}
                  className={`${inp} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                The rate your lender currently offers for the same remaining term
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-neutral-100 p-6 space-y-4" style={{ background: "#fafafa" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border border-neutral-100 p-4 text-center">
              <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">3-Month Interest</p>
              <p className="text-2xl font-semibold" style={{ color: "var(--amber)" }}>
                {formatCurrency(result.threeMonthInterest, 0)}
              </p>
            </div>

            {!isVariable && (
              <div className="rounded-xl bg-white border border-neutral-100 p-4 text-center">
                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">IRD Penalty</p>
                <p className="text-2xl font-semibold" style={{ color: result.ird > result.threeMonthInterest ? "#ef4444" : "var(--ink-mid)" }}>
                  {formatCurrency(result.ird, 0)}
                </p>
              </div>
            )}

            <div className="rounded-xl p-4 text-center border"
              style={{ background: "var(--green)", borderColor: "var(--green)" }}>
              <p className="text-xs mb-1 uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>
                You'd Owe
              </p>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(result.penalty, 0)}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                {isVariable ? "3-month interest" : result.penalty === result.ird ? "IRD applies" : "3-month interest applies"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-neutral-100 p-4 text-sm"
            style={{ color: "var(--ink-mid)" }}>
            <p className="font-semibold text-neutral-800 mb-1">How this is calculated</p>
            {isVariable ? (
              <p>Variable rate mortgages always use 3-month interest: {formatCurrency(balance)} × {originalRate.toFixed(2)}% ÷ 12 × 3 = {formatCurrency(result.threeMonthInterest, 0)}</p>
            ) : (
              <p>
                For fixed mortgages, you pay the greater of 3-month interest ({formatCurrency(result.threeMonthInterest, 0)}) or the IRD ({formatCurrency(result.ird, 0)}).
                {result.ird > result.threeMonthInterest
                  ? " The IRD is higher because your contracted rate is significantly above current rates."
                  : " 3-month interest is higher, your contracted rate is close to current rates."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
