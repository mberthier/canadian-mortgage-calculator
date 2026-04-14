"use client";

import React, { useState, useMemo } from "react";
import { calculateLandTransferTax } from "@/lib/mortgageMath";
import { PROVINCES } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

export default function LTTCalculatorClient() {
  const [price, setPrice]       = useState(750_000);
  const [province, setProvince] = useState("ON");
  const [city, setCity]         = useState("");
  const [ftb, setFtb]           = useState(false);

  const ltt    = useMemo(() => calculateLandTransferTax(price, province, city, ftb), [price, province, city, ftb]);
  const noRebate = useMemo(() => calculateLandTransferTax(price, province, city, false), [price, province, city]);

  const inp = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";
  const sel = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none";

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Purchase Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
              <input type="number" min="50000" max="10000000" step="10000" value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`${inp} pl-7`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Province</label>
            <div className="relative">
              <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); }} className={sel}>
                {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">▾</span>
            </div>
          </div>
          {province === "ON" && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">City</label>
              <div className="relative">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={sel}>
                  <option value="">Other Ontario</option>
                  <option value="Toronto">Toronto</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">▾</span>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setFtb((v) => !v)} role="switch" aria-checked={ftb} tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFtb((v) => !v)}
            className="relative w-10 h-5 rounded-full transition-colors shrink-0"
            style={{ background: ftb ? "var(--green)" : "#d6d3d1" }}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${ftb ? "translate-x-5" : ""}`} />
          </div>
          <span className="text-sm text-neutral-700 font-medium">First-time home buyer (applies rebate)</span>
        </label>
      </div>

      {/* Results */}
      <div className="border-t border-neutral-100 p-6" style={{ background: "#fafafa" }}>
        <div className="space-y-2.5 text-sm">
          {ltt.provincial > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Provincial LTT</span>
              <span className="font-medium text-neutral-800">{formatCurrency(ltt.provincial)}</span>
            </div>
          )}
          {ltt.municipal > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Toronto Municipal LTT</span>
              <span className="font-medium text-neutral-800">{formatCurrency(ltt.municipal)}</span>
            </div>
          )}
          {ltt.provincial === 0 && ltt.municipal === 0 && (
            <p className="text-neutral-500">No land transfer tax in this province.</p>
          )}
          {ltt.firstTimeBuyerRebate > 0 && (
            <div className="flex justify-between" style={{ color: "var(--green-mid)" }}>
              <span className="font-medium">First-time buyer rebate</span>
              <span className="font-medium">− {formatCurrency(ltt.firstTimeBuyerRebate)}</span>
            </div>
          )}
          {ltt.total > 0 && (
            <div className="flex justify-between text-base font-bold border-t border-neutral-200 pt-2.5 mt-1">
              <span className="text-neutral-800">Net Land Transfer Tax</span>
              <span style={{ color: "var(--green)" }}>{formatCurrency(ltt.net)}</span>
            </div>
          )}
          {ltt.firstTimeBuyerRebate > 0 && (
            <p className="text-xs pt-1" style={{ color: "var(--green-mid)" }}>
              You save {formatCurrency(ltt.firstTimeBuyerRebate)} as a first-time buyer.
              {noRebate.total > 0 && ` Full amount without rebate: ${formatCurrency(noRebate.total)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
