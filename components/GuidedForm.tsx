"use client";

import React, { useState } from "react";
import { MortgageInputs, ValidationErrors, PaymentFrequency } from "@/lib/types";
import { AMORTIZATION_OPTIONS, TERM_OPTIONS, FREQUENCY_LABELS, PROVINCES } from "@/lib/constants";
import { parseCurrency, formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import { calculateMortgagePayment, calculateLandTransferTax } from "@/lib/mortgageMath";
import Tooltip from "./Tooltip";

interface Props {
  inputs: MortgageInputs;
  errors: ValidationErrors;
  outputs: {
    cmhcPremium: number;
    ltv: number;
    interestSavedByLumpSums: number;
    paymentsSavedByLumpSums: number;
    ltt: { net: number; provincial: number; municipal: number; firstTimeBuyerRebate: number };
    gstHst: { net: number };
  };
  setHomePrice: (v: number) => void;
  setDownPayment: (v: number) => void;
  setDownPaymentPercent: (v: number) => void;
  setLumpSumForYear: (year: number, amount: number) => void;
  setField: <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => void;
}

const inp = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors";
const sel = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-colors appearance-none cursor-pointer";
const lbl = "block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "var(--cream-dark)" }} />
    </div>
  );
}

function TogglePair({ label, value, onChange, tip }: {
  label: string; value: boolean; onChange: (v: boolean) => void; tip?: string;
}) {
  return (
    <div>
      <label className={`${lbl} flex items-center`}>{label}{tip && <Tooltip content={tip} />}</label>
      <div className="flex rounded-lg overflow-hidden border border-stone-200 w-fit">
        {([true, false] as const).map((opt) => (
          <button key={String(opt)} type="button" onClick={() => onChange(opt)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={value === opt ? { background: "var(--green)", color: "#fff" } : { background: "#fff", color: "var(--ink-mid)" }}>
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
      <label htmlFor={id} className={`${lbl} flex items-center`}>{label}{tip && <Tooltip content={tip} />}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
      </div>
    </div>
  );
}

function CurrencyInput({ id, label, tip, value, onChange, placeholder, suffix, readOnly }: {
  id: string; label: string; tip?: string; value: number;
  onChange?: (v: number) => void; placeholder?: string; suffix?: string; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState("");
  if (readOnly) {
    return (
      <div>
        <label className={`${lbl} flex items-center`}>{label}{tip && <Tooltip content={tip} />}</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
          <div className={`${inp} pl-7 bg-stone-50 text-stone-500`}>{value > 0 ? value.toLocaleString("en-CA") : "—"}</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className={`${lbl} flex items-center`}>{label}{tip && <Tooltip content={tip} />}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm select-none">$</span>
        <input id={id} type="text" inputMode="numeric"
          value={focused ? raw : value > 0 ? value.toLocaleString("en-CA") : ""}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9.]/g, ""))}
          onFocus={() => { setFocused(true); setRaw(value > 0 ? String(value) : ""); }}
          onBlur={() => { setFocused(false); onChange!(Math.max(0, parseCurrency(raw))); }}
          placeholder={placeholder ?? "0"}
          className={`${inp} pl-7 ${suffix ? "pr-16" : ""}`} />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none"
            style={{ color: "var(--ink-faint)" }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function RateInput({ id, label, tip, value, onChange, showSlider, sliderNote }: {
  id: string; label: string; tip?: string; value: number;
  onChange: (v: number) => void; showSlider?: boolean; sliderNote?: string;
}) {
  const [raw, setRaw]     = useState("");
  const [focused, setFoc] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={`${lbl} flex items-center`}>{label}{tip && <Tooltip content={tip} />}</label>
      <div className="relative">
        <input id={id} type="text" inputMode="decimal"
          value={focused ? raw : value > 0 ? value.toFixed(2) : ""}
          onChange={(e) => setRaw(e.target.value)}
          onFocus={() => { setFoc(true); setRaw(value > 0 ? String(value) : ""); }}
          onBlur={() => { setFoc(false); const v = parseFloat(raw); if (!isNaN(v) && v > 0) onChange(v); }}
          placeholder="0.00" className={`${inp} pr-8`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
      </div>
      {showSlider && (
        <>
          <input type="range" min="0.5" max="10" step="0.05" value={Math.min(value || 0.5, 10)}
            onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full mt-2" />
          {sliderNote && <p className="text-xs mt-0.5 text-center" style={{ color: "var(--ink-faint)" }}>{sliderNote}</p>}
        </>
      )}
    </div>
  );
}

function MoreToggle({ open, onToggle, label = "More options" }: { open: boolean; onToggle: () => void; label?: string }) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium border transition-colors"
      style={open
        ? { background: "var(--cream-dark)", color: "var(--ink-mid)", borderColor: "var(--cream-dark)" }
        : { background: "var(--green-light)", color: "var(--green)", borderColor: "var(--green-border)" }}>
      <span>{open ? `Hide ${label.toLowerCase()}` : label}</span>
      <span>{open ? "−" : "+"}</span>
    </button>
  );
}

export default function GuidedForm({ inputs, errors, outputs, setHomePrice, setDownPayment, setDownPaymentPercent, setLumpSumForYear, setField }: Props) {
  const [dpMode, setDpMode]             = useState<"%" | "$">("%");
  const [showCosts, setShowCosts]       = useState(false);
  const [showRepay, setShowRepay]       = useState(false);
  const [showLumpSum, setShowLumpSum]   = useState(false);
  // For renewal/refinance: track current (old) rate separately from new rate
  const [currentRate, setCurrentRate]   = useState(inputs.interestRate);
  const mode = inputs.mortgageMode;
  const stressRate = Math.max(inputs.interestRate + 2, 5.25);

  const currentPayment = inputs.currentBalance > 0 && currentRate > 0
    ? calculateMortgagePayment(inputs.currentBalance, currentRate, inputs.amortizationYears, inputs.paymentFrequency)
    : 0;

  const lumpSumTotal = Object.values(inputs.lumpSumsByYear).reduce((s, v) => s + (v || 0), 0);
  const yearsSaved = Math.floor(outputs.paymentsSavedByLumpSums / 12);
  const monthsSaved = outputs.paymentsSavedByLumpSums % 12;

  return (
    <div className="space-y-4">

      {/* Province */}
      <SelectField id="province" label="Province" value={inputs.province} onChange={(v) => setField("province", v)}>
        {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
      </SelectField>

      {/* ══════════════ PURCHASE ══════════════ */}
      {mode === "purchase" && (
        <>
          <Divider label="Property" />

          <CurrencyInput id="home-price" label="Home price" value={inputs.homePrice}
            onChange={setHomePrice} placeholder="750,000" />
          {errors.homePrice && <p className="text-xs text-red-600 -mt-2">{errors.homePrice}</p>}

          {/* Down payment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={lbl + " mb-0 flex items-center"}>Down payment
                <Tooltip content="Min. 5% under $500K; 5%+10% on $500K–$1.5M; 20% over $1.5M. Under 20% triggers CMHC insurance." />
              </label>
              <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
                {(["%", "$"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setDpMode(m)}
                    className="px-2.5 py-1 font-medium transition-colors"
                    style={dpMode === m ? { background: "var(--green)", color: "#fff" } : { background: "#fff", color: "var(--ink-mid)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {dpMode === "%" ? (
              <div className="relative">
                <input type="text" inputMode="decimal"
                  value={inputs.downPaymentPercent > 0 ? inputs.downPaymentPercent : ""}
                  onChange={(e) => { const v = parseFloat(e.target.value.replace(/[^0-9.]/g, "")); if (!isNaN(v)) setDownPaymentPercent(v); else if (!e.target.value) setDownPaymentPercent(0); }}
                  placeholder="20" className={`${errors.downPayment ? inp + " border-red-300" : inp} pr-8`} />
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
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 20, 35].map((pct) => {
                const active = Math.abs(inputs.downPaymentPercent - pct) < 0.3;
                return (
                  <button key={pct} type="button" onClick={() => setDownPaymentPercent(pct)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors border"
                    style={active ? { background: "var(--green)", color: "#fff", borderColor: "var(--green)" } : { background: "#fff", color: "var(--ink-mid)", borderColor: "var(--cream-dark)" }}>
                    {pct}%
                  </button>
                );
              })}
            </div>
            {errors.downPayment && <p className="text-xs text-red-600 mt-1">{errors.downPayment}</p>}
            {inputs.homePrice > 0 && (
              <p className="text-xs mt-1.5">
                {outputs.cmhcPremium > 0
                  ? <span style={{ color: "var(--amber)" }}>CMHC applies — {formatCurrency(outputs.cmhcPremium, 0)} added to mortgage</span>
                  : <span style={{ color: "var(--green-mid)" }}>20%+ down — no CMHC required ✓</span>}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TogglePair label="First-time buyer?" value={inputs.isFirstTimeBuyer}
              onChange={(v) => setField("isFirstTimeBuyer", v)}
              tip="Enables LTT rebates (Ontario up to $8,475 with Toronto, BC full exemption under $500K, Manitoba up to $3,500) and RRSP Home Buyers' Plan ($60K/person)." />
            <TogglePair label="New build?" value={inputs.isNewBuild}
              onChange={(v) => setField("isNewBuild", v)}
              tip="New builds may be subject to GST/HST. A federal new housing rebate applies for homes under $450,000." />
          </div>

          <Divider label="Mortgage" />

          <RateInput id="rate" label="Interest rate"
            tip="Canadian mortgage rates compound semi-annually by law — our calculator applies this correctly."
            value={inputs.interestRate} onChange={(v) => setField("interestRate", v)}
            showSlider sliderNote={`Qualifying (stress test): ${stressRate.toFixed(2)}%`} />
          {errors.interestRate && <p className="text-xs text-red-600 -mt-2">{errors.interestRate}</p>}

          <div className="grid grid-cols-2 gap-3">
            <SelectField id="term" label="Term"
              tip="Length of your mortgage contract before renewal. Most Canadians choose 5-year fixed."
              value={inputs.termYears} onChange={(v) => setField("termYears", Number(v))}>
              {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
            </SelectField>
            <SelectField id="amort" label="Amortization"
              tip="Total years to pay off the mortgage. 25 years is standard; 30 years for uninsured."
              value={inputs.amortizationYears} onChange={(v) => setField("amortizationYears", Number(v))}>
              {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} yrs</option>)}
            </SelectField>
          </div>

          {/* Other costs */}
          <Divider label="Other costs" />

          <CurrencyInput id="tax" label="Annual property tax"
            tip="Typically 0.5%–1.5% of assessed value. Included in your GDS ratio by lenders."
            value={inputs.propertyTax} onChange={(v) => setField("propertyTax", v)}
            suffix={inputs.propertyTax > 0 ? `${formatCurrency(inputs.propertyTax / 12, 0)}/mo` : "/yr"} />

          <CurrencyInput id="condo" label="Condo / strata fees"
            tip="Lenders include 50% of condo fees in your GDS ratio. Leave at $0 for houses."
            value={inputs.condoFees} onChange={(v) => setField("condoFees", v)} suffix="/mo" />

          <button type="button" onClick={() => setShowCosts(o => !o)}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: showCosts ? "var(--ink-mid)" : "var(--green)" }}>
            {showCosts ? "− Hide" : "+ Add"} monthly heating &amp; insurance
          </button>
          {showCosts && (
            <div className="space-y-3 pl-3 border-l-2" style={{ borderColor: "var(--green-light)" }}>
              <CurrencyInput id="heat" label="Monthly heating costs"
                tip="Lenders include your monthly heating cost in the GDS ratio. This covers gas, oil, and electric heating specifically — not general electricity, internet, or water. If unknown, lenders use $150/mo as a default."
                value={inputs.heatingCost} onChange={(v) => setField("heatingCost", v)} suffix="/mo" />
              <CurrencyInput id="insurance" label="Home insurance"
                tip="Required by your lender. Typically $1,000–$3,000/year."
                value={inputs.homeInsurance} onChange={(v) => setField("homeInsurance", v)} suffix="/yr" />
            </div>
          )}

          {/* Closing costs section */}
          <Divider label="Closing costs" />

          {/* LTT — read-only calculated */}
          {inputs.homePrice > 0 && (
            <div className="rounded-lg px-3 py-2.5 text-xs space-y-1.5 border"
              style={{ background: "var(--cream)", borderColor: "var(--cream-dark)" }}>
              {(outputs.ltt.provincial > 0 || outputs.ltt.municipal > 0) && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1" style={{ color: "var(--ink-mid)" }}>
                    Land transfer tax
                    <Tooltip content="A provincial tax paid on closing day when purchasing real estate. Most provinces charge 0.5%–2.5% of the purchase price. Toronto adds a municipal LTT on top. First-time buyers may be eligible for a rebate." />
                    <Link href="/land-transfer-tax" className="underline text-xs" style={{ color: "var(--green)" }}>details →</Link>
                  </span>
                  <span className="font-medium text-stone-700">
                    {formatCurrency(outputs.ltt.provincial + outputs.ltt.municipal, 0)}
                  </span>
                </div>
              )}
              {outputs.ltt.firstTimeBuyerRebate > 0 && (
                <div className="flex justify-between" style={{ color: "var(--green-mid)" }}>
                  <span>First-time buyer rebate</span>
                  <span className="font-medium">− {formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)}</span>
                </div>
              )}
              {outputs.gstHst.net > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--ink-mid)" }}>GST/HST (new build, net)</span>
                  <span className="font-medium text-stone-700">{formatCurrency(outputs.gstHst.net, 0)}</span>
                </div>
              )}
              {outputs.ltt.provincial === 0 && outputs.ltt.municipal === 0 && outputs.gstHst.net === 0 && (
                <span style={{ color: "var(--ink-faint)" }}>No LTT or GST in this province</span>
              )}
            </div>
          )}

          <CurrencyInput id="closing" label="Other closing costs"
            tip="Legal fees, title insurance, home inspection, adjustments. Typically $3,000–$5,000."
            value={inputs.closingCosts} onChange={(v) => setField("closingCosts", v)} />

          {/* Repay faster */}
          <MoreToggle open={showRepay} onToggle={() => setShowRepay(o => !o)} label="Repay faster" />
          {showRepay && (
            <div className="space-y-4 pl-3 border-l-2" style={{ borderColor: "var(--green-light)" }}>
              <SelectField id="freq" label="Payment frequency"
                tip="Accelerated bi-weekly = 26 half-monthly payments/year — equivalent to one extra monthly payment per year."
                value={inputs.paymentFrequency}
                onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
                {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </SelectField>
              {(inputs.paymentFrequency === "accelerated-biweekly" || inputs.paymentFrequency === "accelerated-weekly") && (
                <p className="text-xs" style={{ color: "var(--green-mid)" }}>
                  ✓ Accelerated payments add one extra monthly payment per year, reducing your amortization without feeling the difference.
                </p>
              )}
              {inputs.paymentFrequency !== "monthly" && inputs.paymentFrequency !== "accelerated-biweekly" && inputs.paymentFrequency !== "accelerated-weekly" && (
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  More frequent payments reduce your outstanding balance faster, saving a small amount of interest each period.
                </p>
              )}

              <CurrencyInput id="extra" label="Extra payment per period"
                tip="Added to every payment. Even $200 extra/month can shave years off your amortization."
                value={inputs.extraPayment} onChange={(v) => setField("extraPayment", v)} />
              {inputs.extraPayment > 0 && (
                <p className="text-xs" style={{ color: "var(--green-mid)" }}>
                  ✓ Adding {formatCurrency(inputs.extraPayment, 0)}/payment — see projected savings in the Insights panel.
                </p>
              )}

              {/* Lump sum */}
              <div>
                <button type="button" onClick={() => setShowLumpSum(o => !o)}
                  className="text-xs font-medium flex items-center gap-1 mb-2"
                  style={{ color: showLumpSum ? "var(--ink-mid)" : "var(--green)" }}>
                  {showLumpSum ? "− Hide" : "+ Add"} annual lump sum payments
                  <Tooltip content="Applied on your mortgage anniversary date each year. Most mortgages allow 10–20% of original principal/year penalty-free." />
                </button>
                {showLumpSum && (
                  <div className="space-y-2">
                    {outputs.interestSavedByLumpSums > 0 && (
                      <div className="rounded-lg px-3 py-2 text-xs border"
                        style={{ background: "var(--green-light)", borderColor: "var(--green-border)" }}>
                        <p className="font-semibold" style={{ color: "var(--green)" }}>
                          Saves {formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest
                        </p>
                        {outputs.paymentsSavedByLumpSums > 0 && (
                          <p style={{ color: "var(--green-mid)" }}>
                            Pays off {yearsSaved > 0 ? `${yearsSaved}yr ` : ""}{monthsSaved > 0 ? `${monthsSaved}mo ` : ""}earlier
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                      Applied on your anniversary date. Most mortgages allow 10–20% of original principal/year penalty-free.
                    </p>
                    {Array.from({ length: inputs.amortizationYears }, (_, i) => i + 1).map((year) => {
                      const val = inputs.lumpSumsByYear[year] ?? 0;
                      return (
                        <div key={year} className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 w-12 shrink-0">Year {year}</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                            <input type="text" inputMode="numeric"
                              value={val > 0 ? val.toLocaleString("en-CA") : ""}
                              onChange={(e) => setLumpSumForYear(year, parseCurrency(e.target.value))}
                              placeholder="0"
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-green-700/20 focus:border-green-700" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ RENEWAL ══════════════ */}
      {mode === "renewal" && (
        <>
          <Divider label="Current mortgage" />

          <CurrencyInput id="balance" label="Remaining balance"
            tip="Your outstanding balance at renewal."
            value={inputs.currentBalance} onChange={(v) => setField("currentBalance", v)} placeholder="480,000" />
          {errors.currentBalance && <p className="text-xs text-red-600 -mt-2">{errors.currentBalance}</p>}

          <RateInput id="current-rate" label="Current rate"
            tip="Your expiring contracted rate — used to calculate what you pay now for comparison."
            value={currentRate} onChange={setCurrentRate} />

          <SelectField id="amort-renewal" label="Remaining amortization"
            tip="Years left on your original amortization schedule."
            value={inputs.amortizationYears} onChange={(v) => setField("amortizationYears", Number(v))}>
            {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} years</option>)}
          </SelectField>

          <SelectField id="freq-renewal" label="Payment frequency"
            value={inputs.paymentFrequency}
            onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
            {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </SelectField>

          {currentPayment > 0 && (
            <div className="rounded-lg px-3 py-2.5 text-sm flex justify-between border"
              style={{ background: "var(--cream)", borderColor: "var(--cream-dark)" }}>
              <span style={{ color: "var(--ink-mid)" }}>Current payment at {currentRate.toFixed(2)}%</span>
              <span className="font-semibold text-stone-800">{formatCurrency(currentPayment, 2)}</span>
            </div>
          )}

          <Divider label="New terms" />

          <RateInput id="new-rate" label="New interest rate"
            tip="The rate you expect at renewal. Check broker rates for best available."
            value={inputs.interestRate} onChange={(v) => setField("interestRate", v)}
            showSlider sliderNote={`Qualifying (stress test): ${stressRate.toFixed(2)}%`} />
          {errors.interestRate && <p className="text-xs text-red-600 -mt-2">{errors.interestRate}</p>}

          <SelectField id="new-term" label="New term"
            tip="The length of the new contract you're renewing into."
            value={inputs.termYears} onChange={(v) => setField("termYears", Number(v))}>
            {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
          </SelectField>

          <MoreToggle open={showRepay} onToggle={() => setShowRepay(o => !o)} label="Repay faster" />
          {showRepay && (
            <div className="space-y-3 pl-3 border-l-2" style={{ borderColor: "var(--green-light)" }}>
              <CurrencyInput id="extra-renewal" label="Extra payment per period"
                value={inputs.extraPayment} onChange={(v) => setField("extraPayment", v)} />
              <div>
                <button type="button" onClick={() => setShowLumpSum(o => !o)}
                  className="text-xs font-medium flex items-center gap-1 mb-2"
                  style={{ color: showLumpSum ? "var(--ink-mid)" : "var(--green)" }}>
                  {showLumpSum ? "− Hide" : "+ Add"} annual lump sum payments
                </button>
                {showLumpSum && (
                  <div className="space-y-2">
                    {Array.from({ length: inputs.amortizationYears }, (_, i) => i + 1).map((year) => {
                      const val = inputs.lumpSumsByYear[year] ?? 0;
                      return (
                        <div key={year} className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 w-12 shrink-0">Year {year}</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                            <input type="text" inputMode="numeric"
                              value={val > 0 ? val.toLocaleString("en-CA") : ""}
                              onChange={(e) => setLumpSumForYear(year, parseCurrency(e.target.value))}
                              placeholder="0"
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-green-700/20" />
                          </div>
                        </div>
                      );
                    })}
                    {outputs.interestSavedByLumpSums > 0 && (
                      <div className="rounded-lg px-3 py-2 text-xs border"
                        style={{ background: "var(--green-light)", borderColor: "var(--green-border)" }}>
                        <p className="font-semibold" style={{ color: "var(--green)" }}>
                          Saves {formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ REFINANCE ══════════════ */}
      {mode === "refinance" && (
        <>
          <Divider label="Current situation" />

          <CurrencyInput id="home-value" label="Home value"
            tip="Current market value. Refinances are capped at 80% LTV."
            value={inputs.homeValue} onChange={(v) => setField("homeValue", v)} placeholder="800,000" />

          <CurrencyInput id="balance-refi" label="Remaining mortgage"
            tip="Your current outstanding balance."
            value={inputs.currentBalance} onChange={(v) => setField("currentBalance", v)} placeholder="450,000" />

          {inputs.homeValue > 0 && inputs.currentBalance > 0 && (
            <div className="rounded-lg px-3 py-2.5 text-xs flex justify-between border"
              style={{ background: "var(--cream)", borderColor: outputs.ltv > 0.8 ? "#fecaca" : "var(--cream-dark)" }}>
              <span style={{ color: "var(--ink-mid)" }}>Estimated equity</span>
              <span className="font-semibold" style={{ color: outputs.ltv > 0.8 ? "#ef4444" : "var(--green)" }}>
                {formatCurrency(Math.max(0, inputs.homeValue - inputs.currentBalance), 0)}
                {" "}({(Math.max(0, 1 - outputs.ltv) * 100).toFixed(0)}%)
                {outputs.ltv > 0.8 && " — above 80% LTV cap"}
              </span>
            </div>
          )}
          {errors.ltv && <p className="text-xs text-red-600">{errors.ltv}</p>}

          <RateInput id="current-rate-refi" label="Current rate"
            tip="Your existing contracted rate — used to compare current vs new payment."
            value={currentRate} onChange={setCurrentRate} />

          {currentPayment > 0 && (
            <div className="rounded-lg px-3 py-2.5 text-sm flex justify-between border"
              style={{ background: "var(--cream)", borderColor: "var(--cream-dark)" }}>
              <span style={{ color: "var(--ink-mid)" }}>Current payment at {currentRate.toFixed(2)}%</span>
              <span className="font-semibold text-stone-800">{formatCurrency(currentPayment, 2)}</span>
            </div>
          )}

          <Divider label="New mortgage" />

          <RateInput id="new-rate-refi" label="New interest rate"
            tip="The rate on the refinanced mortgage."
            value={inputs.interestRate} onChange={(v) => setField("interestRate", v)}
            showSlider sliderNote={`Qualifying (stress test): ${stressRate.toFixed(2)}%`} />
          {errors.interestRate && <p className="text-xs text-red-600 -mt-2">{errors.interestRate}</p>}

          <div className="grid grid-cols-2 gap-3">
            <SelectField id="new-term-refi" label="New term"
              value={inputs.termYears} onChange={(v) => setField("termYears", Number(v))}>
              {TERM_OPTIONS.map((y) => <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>)}
            </SelectField>
            <SelectField id="new-amort-refi" label="Amortization"
              tip="Resetting to a longer amortization lowers payments but increases total interest."
              value={inputs.amortizationYears} onChange={(v) => setField("amortizationYears", Number(v))}>
              {AMORTIZATION_OPTIONS.map((y) => <option key={y} value={y}>{y} yrs</option>)}
            </SelectField>
          </div>

          <CurrencyInput id="cash-out" label="Cash-out amount"
            tip="Additional equity to access. Total loan cannot exceed 80% of home value."
            value={inputs.cashOutAmount} onChange={(v) => setField("cashOutAmount", v)} />

          <MoreToggle open={showRepay} onToggle={() => setShowRepay(o => !o)} label="Repay faster" />
          {showRepay && (
            <div className="space-y-3 pl-3 border-l-2" style={{ borderColor: "var(--green-light)" }}>
              <SelectField id="freq-refi" label="Payment frequency"
                value={inputs.paymentFrequency}
                onChange={(v) => setField("paymentFrequency", v as PaymentFrequency)}>
                {(Object.entries(FREQUENCY_LABELS) as [PaymentFrequency, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </SelectField>
              <CurrencyInput id="extra-refi" label="Extra payment per period"
                value={inputs.extraPayment} onChange={(v) => setField("extraPayment", v)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
