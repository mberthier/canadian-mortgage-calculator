"use client";

import React, { useState } from "react";
import { MortgageInputs, ValidationErrors, PaymentFrequency } from "@/lib/types";
import { AMORTIZATION_OPTIONS, TERM_OPTIONS, FREQUENCY_LABELS } from "@/lib/constants";
import { parseCurrency, formatCurrency } from "@/lib/formatters";
import RatePresets from "./RatePresets";

interface Props {
  inputs: MortgageInputs;
  errors: ValidationErrors;
  setHomePrice: (v: number) => void;
  setDownPayment: (v: number) => void;
  setDownPaymentPercent: (v: number) => void;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
  minimumDownPayment: number;
  cmhcPremium: number;
  ltv: number;
}

const inp    = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors placeholder-stone-300";
const inpErr = "w-full px-3 py-2.5 rounded-lg border border-red-300 bg-red-50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors";
const lbl    = "block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide";
const sel    = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors appearance-none cursor-pointer";

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 rounded-full" style={{ background: "var(--green)" }} />
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>
        {children}
      </p>
    </div>
  );
}

function CurrencyInput({ id, label, value, onChange, error, hint }: {
  id: string; label: string; value: number; onChange: (v: number) => void;
  error?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState("");
  return (
    <div>
      {label && <label htmlFor={id} className={lbl}>{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm select-none">$</span>
        <input id={id} type="text" inputMode="numeric"
          value={focused ? raw : value > 0 ? value.toLocaleString("en-CA") : ""}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9.]/g, ""))}
          onFocus={() => { setFocused(true); setRaw(value > 0 ? String(value) : ""); }}
          onBlur={() => { setFocused(false); onChange(Math.max(0, parseCurrency(raw))); }}
          placeholder="0"
          className={`${error ? inpErr : inp} pl-7`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>{hint}</p>}
    </div>
  );
}

function SelectField({ id, label, value, onChange, children }: {
  id: string; label: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={lbl}>{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
      </div>
    </div>
  );
}

export default function CalculatorForm({
  inputs, errors, setHomePrice, setDownPayment, setDownPaymentPercent,
  setField, minimumDownPayment, cmhcPremium, ltv,
}: Props) {
  const [dpMode, setDpMode]     = useState<"percent" | "value">("percent");
  const [showCosts, setShowCosts] = useState(false);
  const mode = inputs.mortgageMode;

  return (
    <div className="space-y-8">

      {/* ── Purchase-specific: Price + Down Payment ── */}
      {mode === "purchase" && (
        <div>
          <SectionHead>Property</SectionHead>
          <div className="space-y-4">
            <CurrencyInput id="home-price" label="Home Price"
              value={inputs.homePrice} onChange={setHomePrice} error={errors.homePrice} />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={lbl} style={{ marginBottom: 0 }}>Down Payment</label>
                <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
                  {(["percent", "value"] as const).map((m) => (
                    <button key={m} onClick={() => setDpMode(m)}
                      className="px-3 py-1 font-medium transition-colors"
                      style={dpMode === m
                        ? { background: "var(--green)", color: "#fff" }
                        : { background: "#fff", color: "var(--ink-mid)" }}>
                      {m === "percent" ? "%" : "$"}
                    </button>
                  ))}
                </div>
              </div>

              {dpMode === "percent" ? (
                <div className="relative">
                  <input type="number" min="0" max="99" step="0.5" value={inputs.downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                    className={`${errors.downPayment ? inpErr : inp} pr-8`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input type="text" inputMode="numeric"
                    value={inputs.downPayment > 0 ? inputs.downPayment.toLocaleString("en-CA") : ""}
                    onChange={(e) => setDownPayment(parseCurrency(e.target.value))}
                    className={`${errors.downPayment ? inpErr : inp} pl-7`} />
                </div>
              )}

              <div className="flex justify-between mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>
                <span>
                  {formatCurrency(inputs.downPayment)} ·{" "}
                  {inputs.downPaymentPercent < 20
                    ? <span style={{ color: "var(--amber)" }}>CMHC: {formatCurrency(cmhcPremium, 0)}</span>
                    : <span style={{ color: "var(--green-mid)" }}>No CMHC required</span>}
                </span>
              </div>
              {errors.downPayment && <p className="text-xs text-red-600 mt-0.5">{errors.downPayment}</p>}

              <input type="range" min="5" max="80" step="0.5"
                value={Math.min(inputs.downPaymentPercent, 80)}
                onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value))}
                className="w-full mt-3" aria-label="Down payment %" />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                <span>5%</span>
                <span className="font-medium" style={{ color: "var(--green)" }}>20%</span>
                <span>80%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Renewal-specific: Current Balance ── */}
      {mode === "renewal" && (
        <div>
          <SectionHead>Current Mortgage</SectionHead>
          <div className="space-y-4">
            <CurrencyInput id="current-balance" label="Outstanding Balance"
              value={inputs.currentBalance}
              onChange={(v) => setField("currentBalance", v)}
              error={errors.currentBalance}
              hint="Your remaining mortgage balance at renewal" />
          </div>
        </div>
      )}

      {/* ── Refinance-specific: Balance, Home Value, Cash Out ── */}
      {mode === "refinance" && (
        <div>
          <SectionHead>Current Mortgage</SectionHead>
          <div className="space-y-4">
            <CurrencyInput id="current-balance" label="Current Balance"
              value={inputs.currentBalance}
              onChange={(v) => setField("currentBalance", v)}
              error={errors.currentBalance} />
            <CurrencyInput id="home-value" label="Current Home Value"
              value={inputs.homeValue}
              onChange={(v) => setField("homeValue", v)}
              hint={inputs.homeValue > 0 ? `LTV: ${(ltv * 100).toFixed(1)}% (max 80% for refinance)` : undefined} />
            <CurrencyInput id="cash-out" label="Cash-Out Amount (optional)"
              value={inputs.cashOutAmount}
              onChange={(v) => setField("cashOutAmount", v)}
              hint="Additional equity you want to access" />
            {errors.ltv && (
              <div className="rounded-lg px-3 py-2 text-xs text-red-700 border border-red-200 bg-red-50">
                {errors.ltv}
              </div>
            )}
            {/* LTV bar */}
            {inputs.homeValue > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink-faint)" }}>
                  <span>Loan-to-value</span>
                  <span className="font-medium" style={{ color: ltv > 0.8 ? "var(--red)" : "var(--green-mid)" }}>
                    {(ltv * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--cream-dark)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(ltv * 100, 100)}%`,
                      background: ltv > 0.8 ? "var(--red)" : ltv > 0.7 ? "var(--amber)" : "var(--green-mid)",
                    }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mortgage terms (all modes) ── */}
      <div>
        <SectionHead>
          {mode === "purchase" ? "Mortgage" : mode === "renewal" ? "New Terms" : "New Mortgage"}
        </SectionHead>
        <div className="space-y-4">
          <RatePresets inputs={inputs} setField={setField} />

          <div>
            <label htmlFor="rate" className={lbl}>Interest Rate</label>
            <div className="relative">
              <input id="rate" type="number" min="0.1" max="30" step="0.01" value={inputs.interestRate}
                onChange={(e) => setField("interestRate", parseFloat(e.target.value) || 0)}
                className={`${errors.interestRate ? inpErr : inp} pr-8`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
            </div>
            <input type="range" min="0.5" max="12" step="0.05" value={inputs.interestRate}
              onChange={(e) => setField("interestRate", parseFloat(e.target.value))}
              className="w-full mt-2" aria-label="Interest rate" />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
              <span>0.5%</span><span>12%</span>
            </div>
            {errors.interestRate && <p className="text-xs text-red-600 mt-1">{errors.interestRate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField id="amort"
              label={mode === "renewal" ? "Remaining Amortization" : "Amortization"}
              value={inputs.amortizationYears}
              onChange={(v) => setField("amortizationYears", Number(v))}>
              {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
            </SelectField>
            <SelectField id="term" label="Term" value={inputs.termYears}
              onChange={(v) => setField("termYears", Number(v))}>
              {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
            </SelectField>
          </div>

          <SelectField id="freq" label="Payment Frequency" value={inputs.paymentFrequency}
            onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
            {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* ── Monthly Costs — collapsed by default ── */}
      <div className="border-t border-stone-100 pt-5">
        <button onClick={() => setShowCosts((o) => !o)}
          className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
          aria-expanded={showCosts}>
          <span>Monthly Costs</span>
          <span className="text-base">{showCosts ? "−" : "+"}</span>
        </button>
        {showCosts && (
          <div className="mt-4 space-y-4">
            <CurrencyInput id="tax" label="Annual Property Tax"
              value={inputs.propertyTax} onChange={(v) => setField("propertyTax", v)}
              hint={`${formatCurrency(inputs.propertyTax / 12)} per month`} />
            <CurrencyInput id="insurance" label="Annual Home Insurance"
              value={inputs.homeInsurance} onChange={(v) => setField("homeInsurance", v)}
              hint={`${formatCurrency(inputs.homeInsurance / 12)} per month`} />
            <CurrencyInput id="condo" label="Condo / Strata Fees (monthly)"
              value={inputs.condoFees} onChange={(v) => setField("condoFees", v)} />
            <CurrencyInput id="heat" label="Heating / Utilities (monthly)"
              value={inputs.heatingCost} onChange={(v) => setField("heatingCost", v)} />
          </div>
        )}
      </div>
    </div>
  );
}
