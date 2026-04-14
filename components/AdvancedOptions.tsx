"use client";

import React, { useState } from "react";
import { MortgageInputs } from "@/lib/types";
import { parseCurrency } from "@/lib/formatters";

interface Props {
  inputs: MortgageInputs;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

const inp = "w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";
const lbl = "block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide";

function CurrencyField({ id, label, hint, value, onChange }: {
  id: string; label: string; hint?: string; value: number; onChange: (v: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState("");
  return (
    <div>
      <label htmlFor={id} className={lbl}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
        <input id={id} type="text" inputMode="numeric"
          value={focused ? raw : value > 0 ? value.toLocaleString("en-CA") : ""}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9.]/g, ""))}
          onFocus={() => { setFocused(true); setRaw(value > 0 ? String(value) : ""); }}
          onBlur={() => { setFocused(false); onChange(Math.max(0, parseCurrency(raw))); }}
          placeholder="0" className={`${inp} pl-7`} />
      </div>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: {
  checked: boolean; onChange: () => void; label: string; sub?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={onChange} role="switch" aria-checked={checked} tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onChange()}
        className="relative w-10 h-5 rounded-full transition-colors shrink-0"
        style={{ background: checked ? "var(--green)" : "#d6d3d1" }}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <div>
        <p className="text-sm text-neutral-700 font-medium">{label}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
    </label>
  );
}

export default function AdvancedOptions({ inputs, setField }: Props) {
  const [open, setOpen]   = useState(false);
  const isPurchase        = inputs.mortgageMode === "purchase";

  return (
    <div className="border-t border-neutral-100 pt-5">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-expanded={open}>
        <span>Advanced Options</span>
        <span className="text-base">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <CurrencyField id="extra" label="Extra Payment per Period"
            hint="Added to every scheduled payment, shortens amortization"
            value={inputs.extraPayment} onChange={(v) => setField("extraPayment", v)} />
          <CurrencyField id="closing" label="Closing Costs"
            hint={isPurchase ? "Legal fees, inspection, title insurance, adjustments" : "Legal fees for renewal/refinance (~$500–$1,500)"}
            value={inputs.closingCosts} onChange={(v) => setField("closingCosts", v)} />
          {isPurchase && (
            <>
              <Toggle checked={inputs.isNewBuild}
                onChange={() => setField("isNewBuild", !inputs.isNewBuild)}
                label="New Build" sub="Adds GST/HST to upfront cash estimate" />
              <Toggle checked={inputs.includeCMHC}
                onChange={() => setField("includeCMHC", !inputs.includeCMHC)}
                label="Include CMHC Insurance"
                sub="Applies when down payment < 20%, up to $1.5M" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
