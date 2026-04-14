"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { calculateBreakPenalty } from "@/lib/mortgageMath";
import { formatCurrency } from "@/lib/formatters";

export default function BreakPenalty() {
  const [open, setOpen]           = useState(false);

  // Auto-open when FeatureDiscovery pill is clicked
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener("open-section", handler);
    return () => el.removeEventListener("open-section", handler);
  }, []);  const [balance, setBalance]     = useState(400_000);
  const [originalRate, setOrig]   = useState(4.5);
  const [currentRate, setCurrent] = useState(3.89);
  const [remainingMonths, setMonths] = useState(36);
  const [isVariable, setVariable] = useState(false);

  const result = useMemo(
    () => calculateBreakPenalty(balance, originalRate, currentRate, remainingMonths, isVariable),
    [balance, originalRate, currentRate, remainingMonths, isVariable],
  );

  const inp = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-600 transition-colors";

  return (
    <div ref={sectionRef} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">What it costs to walk away early</p>
          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
            style={{ background: "#fef3c7", color: "var(--amber)" }}>Estimate</span>
        </div>
        <span className="text-slate-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            If you break your mortgage before the term ends — to refinance, sell, or switch lenders — your lender will charge a prepayment penalty. For fixed mortgages it's the greater of <strong className="text-slate-600">3-months' interest</strong> or the <strong className="text-slate-600">Interest Rate Differential (IRD)</strong>. Variable mortgages are always 3-months' interest.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Remaining Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" min="0" step="1000" value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className={`${inp} pl-7`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Your Contracted Rate
              </label>
              <div className="relative">
                <input type="number" min="0.1" max="20" step="0.05" value={originalRate}
                  onChange={(e) => setOrig(parseFloat(e.target.value) || 0)}
                  className={`${inp} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Current Rate (similar term)
              </label>
              <div className="relative">
                <input type="number" min="0.1" max="20" step="0.05" value={currentRate}
                  onChange={(e) => setCurrent(parseFloat(e.target.value) || 0)}
                  className={`${inp} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                Posted rate for remaining term
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Months Remaining
              </label>
              <input type="number" min="1" max="120" step="1" value={remainingMonths}
                onChange={(e) => setMonths(Number(e.target.value))}
                className={inp} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div onClick={() => setVariable((v) => !v)}
                role="switch" aria-checked={isVariable} tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setVariable((v) => !v)}
                className="relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer"
                style={{ background: isVariable ? "var(--green)" : "#d6d3d1" }}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isVariable ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-slate-700">Variable rate mortgage</span>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: "3-Month Interest", value: result.threeMonthInterest, highlight: !result.isIRD && !isVariable },
                { label: "IRD Penalty",       value: result.ird,               highlight: result.isIRD,               disabled: isVariable },
                { label: "Your Penalty",      value: result.penalty,           highlight: true,                       isTotal: true },
              ].map(({ label, value, highlight, disabled, isTotal }) => (
                <div key={label} className="p-3 text-center"
                  style={isTotal ? { background: "var(--cream)" } : {}}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--ink-faint)" }}>{label}</p>
                  <p className="font-semibold"
                    style={{
                      color: disabled ? "var(--ink-faint)" : isTotal ? "var(--red)" : highlight ? "var(--ink)" : "var(--ink-faint)",
                      fontSize: isTotal ? "1.25rem" : "1rem",
                    }}>
                    {disabled ? "N/A" : formatCurrency(value, 0)}
                  </p>
                  {highlight && !isTotal && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--green)" }}>▲ applies</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg px-3 py-2.5 text-xs leading-relaxed border border-slate-100"
            style={{ background: "var(--cream)", color: "var(--ink-muted)" }}>
            <strong className="text-slate-700">Estimate only.</strong> Actual penalties vary significantly by lender. Some use posted rates vs discounted rates for IRD; some apply different comparison periods. Big bank penalties are typically higher than monoline lenders. Always confirm with your lender before breaking your mortgage.
          </div>
        </div>
      )}
    </div>
  );
}
