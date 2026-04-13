"use client";

import React, { useState } from "react";
import { MortgageInputs, ValidationErrors, PaymentFrequency } from "@/lib/types";
import { AMORTIZATION_OPTIONS, TERM_OPTIONS, FREQUENCY_LABELS, PROVINCES } from "@/lib/constants";
import { parseCurrency, formatCurrency } from "@/lib/formatters";
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

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors";
const sel = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors appearance-none cursor-pointer";
const lbl = "block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
    </div>
  );
}

function TogglePair({
  label, value, onChange, tip,
}: { label: string; value: boolean; onChange: (v: boolean) => void; tip?: string }) {
  return (
    <div>
      <label className={`${lbl} flex items-center`}>
        {label}{tip && <Tooltip content={tip} />}
      </label>
      <div className="flex rounded-lg overflow-hidden border border-stone-200 w-fit">
        {[true, false].map((opt) => (
          <button key={String(opt)} type="button"
            onClick={() => onChange(opt)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={value === opt
              ? { background: "var(--green)", color: "#fff" }
              : { background: "#fff", color: "var(--ink-mid)" }}>
            {opt ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ id, label, tip, value, onChange, children }: {
  id: string; label: string; tip?: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={`${lbl} flex items-center`}>
        {label}{tip && <Tooltip content={tip} />}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
      </div>
    </div>
  );
}

export default function GuidedForm({
  inputs, errors,
  setHomePrice, setDownPayment, setDownPaymentPercent, setField,
  minimumDownPayment, cmhcPremium, ltv,
}: Props) {
  const [showCosts, setShowCosts]     = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dpMode, setDpMode]           = useState<"%" | "$">("%");
  const mode = inputs.mortgageMode;

  const DOWN_CHIPS = mode === "purchase"
    ? [5, 10, 20, 35]
    : [];

  const stressTestRate = Math.max(inputs.interestRate + 2, 5.25);

  return (
    <div className="space-y-4">

      {/* ── Province ─────────────────────────────────────────────────────── */}
      <SelectField id="province" label="Province" value={inputs.province}
        onChange={(v) => setField("province", v)}>
        {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
      </SelectField>

      {/* ── Purchase inputs ───────────────────────────────────────────────── */}
      {mode === "purchase" && (
        <>
          <Divider label="Property" />

          {/* Home price */}
          <div>
            <label htmlFor="home-price" className={lbl}>Home price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="home-price" type="text" inputMode="numeric"
                value={inputs.homePrice > 0 ? inputs.homePrice.toLocaleString("en-CA") : ""}
                onChange={(e) => setHomePrice(parseCurrency(e.target.value))}
                placeholder="750,000"
                className={`${errors.homePrice ? inp + " border-red-300" : inp} pl-7`} />
            </div>
            {errors.homePrice && <p className="text-xs text-red-600 mt-1">{errors.homePrice}</p>}
          </div>

          {/* Down payment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={lbl + " mb-0"}>Down payment
                <Tooltip content="Minimum is 5% under $500K; 5%+10% on $500K–$1.5M; 20% over $1.5M. Under 20% triggers CMHC insurance." />
              </label>
              <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
                {(["%", "$"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setDpMode(m)}
                    className="px-2.5 py-1 font-medium transition-colors"
                    style={dpMode === m
                      ? { background: "var(--green)", color: "#fff" }
                      : { background: "#fff", color: "var(--ink-mid)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {dpMode === "%" ? (
              <div className="relative">
                <input type="number" min="0" max="99" step="0.5"
                  value={inputs.downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                  className={`${errors.downPayment ? inp + " border-red-300" : inp} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="text" inputMode="numeric"
                  value={inputs.downPayment > 0 ? inputs.downPayment.toLocaleString("en-CA") : ""}
                  onChange={(e) => setDownPayment(parseCurrency(e.target.value))}
                  className={`${errors.downPayment ? inp + " border-red-300" : inp} pl-7`} />
              </div>
            )}

            {/* Quick chips */}
            {DOWN_CHIPS.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {DOWN_CHIPS.map((pct) => {
                  const active = Math.abs(inputs.downPaymentPercent - pct) < 0.5;
                  return (
                    <button key={pct} type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-colors border"
                      style={active
                        ? { background: "var(--green)", color: "#fff", borderColor: "var(--green)" }
                        : { background: "#fff", color: "var(--ink-mid)", borderColor: "var(--cream-dark)" }}>
                      {pct}%
                    </button>
                  );
                })}
              </div>
            )}

            {errors.downPayment && <p className="text-xs text-red-600 mt-1">{errors.downPayment}</p>}

            {/* CMHC status */}
            {inputs.homePrice > 0 && (
              <p className="text-xs mt-1.5">
                {cmhcPremium > 0
                  ? <span style={{ color: "var(--amber)" }}>
                      CMHC insurance applies — {formatCurrency(cmhcPremium, 0)} added to your mortgage
                    </span>
                  : <span style={{ color: "var(--green-mid)" }}>
                      20%+ down — no CMHC required ✓
                    </span>
                }
              </p>
            )}
          </div>

          {/* First-time buyer + New build */}
          <div className="grid grid-cols-2 gap-3">
            <TogglePair label="First-time buyer?" value={inputs.isFirstTimeBuyer}
              onChange={(v) => setField("isFirstTimeBuyer", v)}
              tip="Enables land transfer tax rebates (Ontario up to $4,000, Toronto +$4,475, BC full exemption under $500K, Manitoba up to $3,500) and the RRSP Home Buyers' Plan." />
            <TogglePair label="New build?" value={inputs.isNewBuild}
              onChange={(v) => setField("isNewBuild", v)}
              tip="New builds may be subject to GST/HST. A federal new housing rebate may apply for homes under $450,000." />
          </div>
        </>
      )}

      {/* ── Renewal inputs ────────────────────────────────────────────────── */}
      {mode === "renewal" && (
        <>
          <Divider label="Current mortgage" />
          <div>
            <label htmlFor="balance" className={lbl}>Remaining balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="balance" type="text" inputMode="numeric"
                value={inputs.currentBalance > 0 ? inputs.currentBalance.toLocaleString("en-CA") : ""}
                onChange={(e) => setField("currentBalance", parseCurrency(e.target.value))}
                placeholder="480,000" className={`${inp} pl-7`} />
            </div>
            {errors.currentBalance && <p className="text-xs text-red-600 mt-1">{errors.currentBalance}</p>}
          </div>
          <SelectField id="amort-renewal" label="Remaining amortization"
            tip="Years left on your original amortization."
            value={inputs.amortizationYears}
            onChange={(v) => setField("amortizationYears", Number(v))}>
            {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
          </SelectField>
        </>
      )}

      {/* ── Refinance inputs ──────────────────────────────────────────────── */}
      {mode === "refinance" && (
        <>
          <Divider label="Current situation" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="home-value" className={lbl}>Home value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input id="home-value" type="text" inputMode="numeric"
                  value={inputs.homeValue > 0 ? inputs.homeValue.toLocaleString("en-CA") : ""}
                  onChange={(e) => setField("homeValue", parseCurrency(e.target.value))}
                  placeholder="800,000" className={`${inp} pl-7`} />
              </div>
            </div>
            <div>
              <label htmlFor="balance-refi" className={lbl}>Remaining balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input id="balance-refi" type="text" inputMode="numeric"
                  value={inputs.currentBalance > 0 ? inputs.currentBalance.toLocaleString("en-CA") : ""}
                  onChange={(e) => setField("currentBalance", parseCurrency(e.target.value))}
                  placeholder="450,000" className={`${inp} pl-7`} />
              </div>
            </div>
          </div>

          {/* Equity display */}
          {inputs.homeValue > 0 && inputs.currentBalance > 0 && (
            <div className="rounded-lg px-3 py-2 text-xs flex justify-between"
              style={{ background: "var(--cream)", color: "var(--ink-mid)" }}>
              <span>Estimated equity</span>
              <span className="font-semibold" style={{ color: "var(--green)" }}>
                {formatCurrency(Math.max(0, inputs.homeValue - inputs.currentBalance), 0)}
                {" "}({(Math.max(0, (inputs.homeValue - inputs.currentBalance) / inputs.homeValue) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
          {errors.ltv && (
            <p className="text-xs text-red-600">{errors.ltv}</p>
          )}

          {/* Refinance goal */}
          <div>
            <label className={lbl}>Goal</label>
            <div className="space-y-1.5">
              {[
                { value: 0,  label: "Lower my payment" },
                { value: 1,  label: "Take cash out" },
                { value: 2,  label: "Consolidate debt" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="refi-goal"
                    checked={inputs.cashOutAmount === value * -1 && value === 0
                      ? inputs.cashOutAmount === 0
                      : value === 1 ? inputs.cashOutAmount > 0 : false}
                    onChange={() => {
                      if (value === 0) setField("cashOutAmount", 0);
                    }}
                    className="accent-green-700" />
                  <span className="text-sm text-stone-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cash out amount if applicable */}
          {inputs.cashOutAmount > 0 || true ? (
            <div>
              <label htmlFor="cash-out" className={lbl}>Cash-out amount <span className="normal-case font-normal text-stone-400">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input id="cash-out" type="text" inputMode="numeric"
                  value={inputs.cashOutAmount > 0 ? inputs.cashOutAmount.toLocaleString("en-CA") : ""}
                  onChange={(e) => setField("cashOutAmount", parseCurrency(e.target.value))}
                  placeholder="0" className={`${inp} pl-7`} />
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ── Mortgage terms ────────────────────────────────────────────────── */}
      <Divider label="Mortgage" />

      <div>
        <label htmlFor="rate" className={`${lbl} flex items-center`}>
          Interest rate
          <Tooltip content="Canadian mortgage rates compound semi-annually by law. Our calculator applies this correctly — most online calculators don't." />
        </label>
        <div className="relative">
          <input id="rate" type="number" min="0.1" max="30" step="0.05"
            value={inputs.interestRate}
            onChange={(e) => setField("interestRate", parseFloat(e.target.value) || 0)}
            className={`${errors.interestRate ? inp + " border-red-300" : inp} pr-8`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
        </div>
        <input type="range" min="0.5" max="10" step="0.05" value={inputs.interestRate}
          onChange={(e) => setField("interestRate", parseFloat(e.target.value))}
          className="w-full mt-2" />
        <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
          <span>0.5%</span>
          <span>Stress test: {stressTestRate.toFixed(2)}%</span>
          <span>10%</span>
        </div>
        {errors.interestRate && <p className="text-xs text-red-600 mt-1">{errors.interestRate}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField id="term" label="Term"
          tip="Length of your mortgage contract. After it ends you renew at prevailing rates. Most Canadians choose 5-year fixed."
          value={inputs.termYears}
          onChange={(v) => setField("termYears", Number(v))}>
          {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
        </SelectField>
        <SelectField id="amort"
          label={mode === "renewal" ? "Remaining amort." : "Amortization"}
          tip="Total time to pay off the mortgage. 25 years is the Canadian standard. 30 years is available for uninsured mortgages."
          value={inputs.amortizationYears}
          onChange={(v) => setField("amortizationYears", Number(v))}>
          {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} yrs</option>)}
        </SelectField>
      </div>

      {/* ── Monthly costs ─────────────────────────────────────────────────── */}
      <Divider label="Monthly costs" />

      <div>
        <label htmlFor="tax" className={lbl}>
          Annual property tax
          <Tooltip content="Your municipality charges this annually — typically 0.5%–1.5% of assessed value. Included in your GDS ratio calculation." />
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
          <input id="tax" type="number" min="0" step="100" value={inputs.propertyTax}
            onChange={(e) => setField("propertyTax", Number(e.target.value))}
            className={`${inp} pl-7`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
            /yr · {formatCurrency(inputs.propertyTax / 12, 0)}/mo
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="condo" className={lbl}>
          Condo / strata fees
          <Tooltip content="Lenders include 50% of condo fees in your GDS ratio. Leave at $0 if not applicable." />
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
          <input id="condo" type="number" min="0" step="50" value={inputs.condoFees}
            onChange={(e) => setField("condoFees", Number(e.target.value))}
            className={`${inp} pl-7`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">/mo</span>
        </div>
      </div>

      {/* Optional costs — collapsed */}
      <button type="button" onClick={() => setShowCosts(o => !o)}
        className="text-xs font-medium flex items-center gap-1 transition-colors"
        style={{ color: showCosts ? "var(--ink-mid)" : "var(--green)" }}>
        <span>{showCosts ? "− Hide" : "+ Add"} heating & insurance</span>
      </button>
      {showCosts && (
        <div className="space-y-3">
          <div>
            <label htmlFor="heat" className={lbl}>Heating / utilities</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="heat" type="number" min="0" step="10" value={inputs.heatingCost}
                onChange={(e) => setField("heatingCost", Number(e.target.value))}
                className={`${inp} pl-7`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">/mo</span>
            </div>
          </div>
          <div>
            <label htmlFor="insurance" className={lbl}>Home insurance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="insurance" type="number" min="0" step="100" value={inputs.homeInsurance}
                onChange={(e) => setField("homeInsurance", Number(e.target.value))}
                className={`${inp} pl-7`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">/yr</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Advanced ──────────────────────────────────────────────────────── */}
      <button type="button" onClick={() => setShowAdvanced(o => !o)}
        className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium border transition-colors"
        style={showAdvanced
          ? { background: "var(--cream-dark)", color: "var(--ink-mid)", borderColor: "var(--cream-dark)" }
          : { background: "var(--green-light)", color: "var(--green)", borderColor: "var(--green-border)" }}>
        <span>{showAdvanced ? "Hide advanced options" : "Advanced options"}</span>
        <span>{showAdvanced ? "−" : "+"}</span>
      </button>

      {showAdvanced && (
        <div className="space-y-3">
          <SelectField id="freq" label="Payment frequency"
            tip="Accelerated bi-weekly makes 26 half-monthly payments per year — equivalent to one extra monthly payment. Saves significant interest."
            value={inputs.paymentFrequency}
            onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
            {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </SelectField>
          <div>
            <label htmlFor="extra" className={lbl}>Extra payment per period</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="extra" type="number" min="0" step="50" value={inputs.extraPayment}
                onChange={(e) => setField("extraPayment", Number(e.target.value))}
                className={`${inp} pl-7`} />
            </div>
          </div>
          <div>
            <label htmlFor="closing" className={lbl}>Closing costs (est.)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input id="closing" type="number" min="0" step="500" value={inputs.closingCosts}
                onChange={(e) => setField("closingCosts", Number(e.target.value))}
                className={`${inp} pl-7`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
