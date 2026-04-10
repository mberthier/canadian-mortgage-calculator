"use client";

import React, { useMemo } from "react";
import { calculateLandTransferTax } from "@/lib/mortgageMath";
import { PROVINCES } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { MortgageInputs } from "@/lib/types";

interface Props {
  inputs: MortgageInputs;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

const sel = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors appearance-none cursor-pointer";
const lbl = "block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide";

export default function LandTransferTax({ inputs, setField }: Props) {
  const [open, setOpen] = React.useState(false);

  // ALL hooks must be called before any conditional return (Rules of Hooks)
  const ltt = useMemo(
    () => calculateLandTransferTax(inputs.homePrice, inputs.province, inputs.city, inputs.isFirstTimeBuyer),
    [inputs.homePrice, inputs.province, inputs.city, inputs.isFirstTimeBuyer],
  );

  // LTT only applies on purchase — early return AFTER all hooks
  if (inputs.mortgageMode !== "purchase") return null;

  return (
    <div className="border-t border-stone-100 pt-5">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
        aria-expanded={open}>
        <span>Land Transfer Tax</span>
        <div className="flex items-center gap-2">
          {ltt.net > 0 && <span className="normal-case font-normal text-stone-500">{formatCurrency(ltt.net, 0)}</span>}
          <span className="text-base">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Province</label>
              <div className="relative">
                <select value={inputs.province} onChange={(e) => setField("province", e.target.value)} className={sel}>
                  {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
              </div>
            </div>
            {inputs.province === "ON" && (
              <div>
                <label className={lbl}>City</label>
                <div className="relative">
                  <select value={inputs.city} onChange={(e) => setField("city", e.target.value)} className={sel}>
                    <option value="">Other Ontario</option>
                    <option value="Toronto">Toronto</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setField("isFirstTimeBuyer", !inputs.isFirstTimeBuyer)}
              role="switch" aria-checked={inputs.isFirstTimeBuyer} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setField("isFirstTimeBuyer", !inputs.isFirstTimeBuyer)}
              className="relative w-10 h-5 rounded-full transition-colors shrink-0"
              style={{ background: inputs.isFirstTimeBuyer ? "var(--green)" : "#d6d3d1" }}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inputs.isFirstTimeBuyer ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm text-stone-700">First-time home buyer</span>
          </label>

          <div className="rounded-lg border border-stone-100 p-3 space-y-2 text-sm" style={{ background: "var(--cream)" }}>
            {ltt.provincial > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Provincial LTT</span><span>{formatCurrency(ltt.provincial)}</span>
              </div>
            )}
            {ltt.municipal > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Toronto Municipal LTT</span><span>{formatCurrency(ltt.municipal)}</span>
              </div>
            )}
            {ltt.firstTimeBuyerRebate > 0 && (
              <div className="flex justify-between" style={{ color: "var(--green-mid)" }}>
                <span>First-time buyer rebate</span><span>− {formatCurrency(ltt.firstTimeBuyerRebate)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-stone-200 pt-2 text-stone-900">
              <span>Net Land Transfer Tax</span>
              <span style={ltt.net === 0 ? { color: "var(--green-mid)" } : {}}>{formatCurrency(ltt.net)}</span>
            </div>
            {ltt.net === 0 && ["SK","NL","NT","NU","YT"].includes(inputs.province) && (
              <p className="text-xs text-stone-400">No provincial land transfer tax in this province.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
