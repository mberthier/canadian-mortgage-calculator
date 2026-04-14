"use client";

import React, { useState, useEffect } from "react";
import { MortgageInputs, ValidationErrors, PaymentFrequency } from "@/lib/types";
import { AMORTIZATION_OPTIONS, TERM_OPTIONS, FREQUENCY_LABELS } from "@/lib/constants";
import { parseCurrency, formatCurrency } from "@/lib/formatters";
import RatePresets from "./RatePresets";
import Tooltip from "./Tooltip";

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

const inp    = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-600 transition-colors placeholder-slate-300";
const inpErr = "w-full px-3 py-2.5 rounded-lg border border-red-300 bg-red-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors";
const lbl    = "text-xs font-medium text-slate-500 uppercase tracking-wide";
const sel    = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-600 transition-colors appearance-none cursor-pointer";

const TIPS = {
  homePrice:    "The purchase price of the property you're buying.",
  downPayment:  "The upfront cash payment. Minimum is 5% for homes under $500K, 5%+10% on $500K–$1.5M, and 20% above $1.5M.",
  cmhc:         "CMHC mortgage default insurance is required when your down payment is under 20%. The premium (2.8%–4.0%) is added to your mortgage balance.",
  interestRate: "Canadian mortgage rates are compounded semi-annually by law — unlike the US where monthly compounding is standard. Our math correctly applies this.",
  amortization: "Total time to pay off your mortgage. 25 years is most common. Longer = lower payments but more total interest.",
  term:         "Length of your current mortgage contract. After it ends, you renew at prevailing rates. Most Canadians choose 5-year fixed.",
  frequency:    "Accelerated bi-weekly splits your monthly payment in half, paid every 2 weeks. You make 26 payments = 13 months equivalent — saving significant interest.",
  propertyTax:  "Annual property tax from your municipality. Typically 0.5%–1.5% of assessed value. Your lender may collect this monthly.",
  homeInsurance:"Required by your lender. Typically $1,000–$3,000/year depending on property type and location.",
  condoFees:    "Monthly condo or strata fees. Lenders include 50% of condo fees in your GDS ratio calculation.",
  heatingCost:  "Estimated monthly heating costs. Included in your GDS ratio by lenders when assessing affordability.",
  balance:      "Your remaining mortgage balance — what you currently owe your lender.",
  homeValue:    "Current market value of your home. Used to calculate loan-to-value (LTV) ratio.",
  cashOut:      "Additional equity you want to access through refinancing. Total loan cannot exceed 80% of home value.",
  ltv:          "Loan-to-Value: your mortgage balance ÷ home value. Lenders cap refinances at 80% LTV.",
};

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 rounded-full" style={{ background: "var(--green)" }} />
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>{children}</p>
    </div>
  );
}

function Label({ text, tip, htmlFor }: { text: string; tip?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={`flex items-center ${lbl} mb-1.5 cursor-default`}>
      {text}{tip && <Tooltip content={tip} />}
    </label>
  );
}

function CurrencyInput({ id, label, tip, value, onChange, error, hint }: {
  id: string; label: string; tip?: string; value: number; onChange: (v: number) => void;
  error?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState("");
  return (
    <div>
      <Label text={label} tip={tip} htmlFor={id} />
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">$</span>
        <input id={id} type="text" inputMode="numeric"
          value={focused ? raw : value > 0 ? value.toLocaleString("en-CA") : ""}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9.]/g, ""))}
          onFocus={() => { setFocused(true); setRaw(value > 0 ? String(value) : ""); }}
          onBlur={() => { setFocused(false); onChange(Math.max(0, parseCurrency(raw))); }}
          placeholder="0" className={`${error ? inpErr : inp} pl-7`} />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>{hint}</p>}
    </div>
  );
}

function SelectField({ id, label, tip, value, onChange, children }: {
  id: string; label: string; tip?: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <Label text={label} tip={tip} htmlFor={id} />
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
      </div>
    </div>
  );
}

export default function CalculatorForm({
  inputs, errors, setHomePrice, setDownPayment,
  setDownPaymentPercent, setField, minimumDownPayment, cmhcPremium, ltv,
}: Props) {
  const [dpMode, setDpMode]       = useState<"percent" | "value">("percent");
  const [showMore, setShowMore]   = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const mode = inputs.mortgageMode;

  // Restore expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ck_showMore");
    if (saved === "true") setShowMore(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("ck_showMore", String(showMore));
  }, [showMore]);

  return (
    <div className="space-y-6">

      {/* ── Purchase: Price + Down ── */}
      {mode === "purchase" && (
        <div className="space-y-4">
          <CurrencyInput id="home-price" label="Home Price" tip={TIPS.homePrice}
            value={inputs.homePrice} onChange={setHomePrice} error={errors.homePrice} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label text="Down Payment" tip={TIPS.downPayment} />
              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
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
                  ? <span style={{ color: "var(--amber)" }}>+{formatCurrency(cmhcPremium, 0)} CMHC added to your mortgage<Tooltip content={TIPS.cmhc} /></span>
                  : <span style={{ color: "var(--green-mid)" }}>20%+ down — no CMHC ✓</span>}
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
      )}

      {/* ── Renewal ── */}
      {mode === "renewal" && (
        <div className="space-y-4">
          <CurrencyInput id="current-balance" label="Outstanding Balance" tip={TIPS.balance}
            value={inputs.currentBalance} onChange={(v) => setField("currentBalance", v)}
            error={errors.currentBalance} hint="Your remaining mortgage balance at renewal" />
        </div>
      )}

      {/* ── Refinance ── */}
      {mode === "refinance" && (
        <div className="space-y-4">
          <CurrencyInput id="current-balance" label="Current Balance" tip={TIPS.balance}
            value={inputs.currentBalance} onChange={(v) => setField("currentBalance", v)}
            error={errors.currentBalance} />
          <CurrencyInput id="home-value" label="Current Home Value" tip={TIPS.homeValue}
            value={inputs.homeValue} onChange={(v) => setField("homeValue", v)}
            hint={inputs.homeValue > 0 ? `LTV: ${(ltv * 100).toFixed(1)}% (max 80% for refinance)` : undefined} />
          <CurrencyInput id="cash-out" label="Cash-Out Amount (optional)" tip={TIPS.cashOut}
            value={inputs.cashOutAmount} onChange={(v) => setField("cashOutAmount", v)}
            hint="Additional equity you want to access" />
          {errors.ltv && (
            <div className="rounded-lg px-3 py-2 text-xs text-red-700 border border-red-200 bg-red-50">{errors.ltv}</div>
          )}
          {inputs.homeValue > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--ink-faint)" }}>
                <span className="flex items-center">Loan-to-value<Tooltip content={TIPS.ltv} /></span>
                <span className="font-medium" style={{ color: ltv > 0.8 ? "var(--red)" : "var(--green-mid)" }}>
                  {(ltv * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--cream-dark)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(ltv * 100, 100)}%`,
                    background: ltv > 0.8 ? "var(--red)" : ltv > 0.7 ? "var(--amber)" : "var(--green-mid)" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Rate (always visible) ── */}
      <div>
        <Label text="Interest Rate" tip={TIPS.interestRate} />
        <div className="relative">
          <input id="rate" type="number" min="0.1" max="30" step="0.01" value={inputs.interestRate}
            onChange={(e) => setField("interestRate", parseFloat(e.target.value) || 0)}
            className={`${errors.interestRate ? inpErr : inp} pr-8`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
        </div>
        <input type="range" min="0.5" max="12" step="0.05" value={inputs.interestRate}
          onChange={(e) => setField("interestRate", parseFloat(e.target.value))}
          className="w-full mt-2" aria-label="Interest rate" />
        <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
          <span>0.5%</span><span>12%</span>
        </div>
        {errors.interestRate && <p className="text-xs text-red-600 mt-1">{errors.interestRate}</p>}
      </div>

      {/* ── Progressive disclosure toggle ── */}
      <button
        onClick={() => setShowMore((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all"
        style={showMore
          ? { background: "var(--cream-dark)", color: "var(--ink-mid)" }
          : { background: "var(--green-light)", color: "var(--green)", border: "1px solid var(--green-border)" }}
        aria-expanded={showMore}
      >
        <span>{showMore ? "Hide options" : "More options — amortization, term, frequency…"}</span>
        <span className="text-base font-semibold">{showMore ? "−" : "+"}</span>
      </button>

      {/* ── More options ── */}
      {showMore && (
        <div className="space-y-5">
          {/* Rate presets */}
          <RatePresets inputs={inputs} setField={setField} />

          {/* Amortization + Term */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField id="amort"
              label={mode === "renewal" ? "Remaining Amortization" : "Amortization"}
              tip={TIPS.amortization} value={inputs.amortizationYears}
              onChange={(v) => setField("amortizationYears", Number(v))}>
              {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
            </SelectField>
            <SelectField id="term" label="Term" tip={TIPS.term} value={inputs.termYears}
              onChange={(v) => setField("termYears", Number(v))}>
              {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
            </SelectField>
          </div>

          {/* Frequency */}
          <SelectField id="freq" label="Payment Frequency" tip={TIPS.frequency}
            value={inputs.paymentFrequency}
            onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
            {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </SelectField>

          {/* Monthly Costs */}
          <div className="border-t border-slate-100 pt-4">
            <button onClick={() => setShowCosts((o) => !o)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-0"
              aria-expanded={showCosts}>
              <span>Monthly Costs</span>
              <span className="text-base">{showCosts ? "−" : "+"}</span>
            </button>
            {showCosts && (
              <div className="mt-4 space-y-4">
                <CurrencyInput id="tax" label="Annual Property Tax" tip={TIPS.propertyTax}
                  value={inputs.propertyTax} onChange={(v) => setField("propertyTax", v)}
                  hint={`${formatCurrency(inputs.propertyTax / 12)} per month`} />
                <CurrencyInput id="insurance" label="Annual Home Insurance" tip={TIPS.homeInsurance}
                  value={inputs.homeInsurance} onChange={(v) => setField("homeInsurance", v)}
                  hint={`${formatCurrency(inputs.homeInsurance / 12)} per month`} />
                <CurrencyInput id="condo" label="Condo / Strata Fees (monthly)" tip={TIPS.condoFees}
                  value={inputs.condoFees} onChange={(v) => setField("condoFees", v)} />
                <CurrencyInput id="heat" label="Heating / Utilities (monthly)" tip={TIPS.heatingCost}
                  value={inputs.heatingCost} onChange={(v) => setField("heatingCost", v)} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
