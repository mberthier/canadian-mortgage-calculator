"use client";

import React from "react";
import Script from "next/script";
import { useMortgageCalculator } from "@/hooks/useMortgageCalculator";
import ModeSelector            from "@/components/ModeSelector";
import CalculatorForm          from "@/components/CalculatorForm";
import SummaryCards            from "@/components/SummaryCards";
import PaymentBreakdownChart   from "@/components/PaymentBreakdownChart";
import AmortizationChart       from "@/components/AmortizationChart";
import PrincipalInterestByYear from "@/components/PrincipalInterestByYear";
import AmortizationTable       from "@/components/AmortizationTable";
import AdvancedOptions         from "@/components/AdvancedOptions";
import LumpSumByYear           from "@/components/LumpSumByYear";
import LandTransferTax         from "@/components/LandTransferTax";
import StressTest              from "@/components/StressTest";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";
import MortgageComparison      from "@/components/MortgageComparison";
import BreakPenalty            from "@/components/BreakPenalty";
import { FREQUENCY_LABELS }    from "@/lib/constants";
import { formatCurrency }      from "@/lib/formatters";

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CrystalKey — Canadian Mortgage Calculator",
  "url": "https://crystalkey.ca",
  "description": "Canada's most comprehensive mortgage calculator. Calculate payments, CMHC insurance, land transfer tax, amortization schedule, and total upfront costs.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CAD",
  },
  "featureList": [
    "Mortgage payment calculation",
    "CMHC insurance calculation",
    "Land transfer tax calculator",
    "Amortization schedule",
    "Mortgage stress test",
    "GDS/TDS affordability calculator",
    "Purchase, Renewal, and Refinance modes",
  ],
  "inLanguage": "en-CA",
  "publisher": {
    "@type": "Organization",
    "name": "CrystalKey",
    "url": "https://crystalkey.ca",
  },
};

export default function Home() {
  const {
    inputs, outputs, errors,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  } = useMortgageCalculator();

  const isPurchase = inputs.mortgageMode === "purchase";
  const homePrice  = isPurchase ? inputs.homePrice : inputs.homeValue;

  return (
    <>
      {/* JSON-LD structured data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen" style={{ background: "var(--cream)" }}>
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-20" style={{ borderColor: "var(--cream-dark)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--green)" }}>
                {/* Key icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="11" r="4"/>
                  <path d="M12 11h8M18 11v3M15 11v2"/>
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-stone-900 tracking-tight" style={{ fontSize: "15px" }}>CrystalKey</span>
                <span className="hidden sm:inline text-xs rounded-full px-2 py-0.5 font-medium"
                  style={{ background: "var(--green-light)", color: "var(--green)" }}>Canada</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "var(--ink-faint)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Rates Apr 9, 2026 · Semi-annual compounding
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] xl:grid-cols-[420px,1fr] gap-8 items-start">

            {/* ── Left: Form ── */}
            <aside>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--green)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="11" r="4"/>
                      <path d="M12 11h8M18 11v3M15 11v2"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>CrystalKey</span>
                </div>
                <h1 className="font-display text-3xl leading-tight" style={{ color: "var(--ink)" }}>
                  Canadian<br />Mortgage Calculator
                </h1>
                <p className="text-sm mt-2 italic" style={{ color: "var(--ink-faint)" }}>
                  Crystal clear mortgage calculations
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                  {["CMHC", "LTT", "GST/HST", "GDS/TDS", "Amortization"].map((f) => (
                    <span key={f} className="text-xs font-medium" style={{ color: "var(--ink-faint)" }}>· {f}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid var(--cream-dark)" }}>
                <div className="mb-6">
                  <ModeSelector mode={inputs.mortgageMode} onChange={setMode} />
                </div>

                <CalculatorForm
                  inputs={inputs} errors={errors}
                  setHomePrice={setHomePrice} setDownPayment={setDownPayment}
                  setDownPaymentPercent={setDownPaymentPercent} setField={setField}
                  minimumDownPayment={outputs.minimumDownPayment}
                  cmhcPremium={outputs.cmhcPremium}
                  ltv={outputs.ltv}
                />

                <div className="mt-6 space-y-0">
                  <LumpSumByYear
                    amortizationYears={inputs.amortizationYears}
                    lumpSumsByYear={inputs.lumpSumsByYear}
                    setLumpSumForYear={setLumpSumForYear}
                    interestSaved={outputs.interestSavedByLumpSums}
                    paymentsSaved={outputs.paymentsSavedByLumpSums}
                  />
                  <AdvancedOptions inputs={inputs} setField={setField} />
                  <LandTransferTax inputs={inputs} setField={setField} />
                </div>
              </div>

              <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                Estimates only · Not financial advice · Consult a licensed mortgage broker or financial advisor before making any real estate decisions.
              </p>
            </aside>

            {/* ── Right: Results ── */}
            <main className="space-y-5 pb-24 lg:pb-0">
              <SummaryCards outputs={outputs} inputs={inputs} />

              {outputs.amortizationSchedule.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid var(--cream-dark)" }}>
                      <PaymentBreakdownChart outputs={outputs} inputs={inputs} />
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid var(--cream-dark)" }}>
                      <AmortizationChart
                        schedule={outputs.amortizationSchedule}
                        amortizationYears={inputs.amortizationYears}
                        frequency={inputs.paymentFrequency}
                        homePrice={homePrice}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid var(--cream-dark)" }}>
                    <PrincipalInterestByYear
                      schedule={outputs.amortizationSchedule}
                      amortizationYears={inputs.amortizationYears}
                      frequency={inputs.paymentFrequency}
                    />
                  </div>

                  <AmortizationTable
                    schedule={outputs.amortizationSchedule}
                    frequency={inputs.paymentFrequency}
                    termYears={inputs.termYears}
                  />

                  <StressTest outputs={outputs} inputs={inputs} />
                  <MortgageComparison inputs={inputs} loanAmount={outputs.loanAmount} />
                  <AffordabilityCalculator
                    currentHomePrice={inputs.homePrice}
                    currentRate={inputs.interestRate}
                    currentAmortization={inputs.amortizationYears}
                    currentPropertyTax={inputs.propertyTax}
                    currentHeating={inputs.heatingCost}
                    currentCondoFees={inputs.condoFees}
                  />
                  <BreakPenalty />
                </>
              )}
            </main>
          </div>
        </div>

        {/* Mobile sticky footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white"
          style={{ borderColor: "var(--cream-dark)" }}>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                {FREQUENCY_LABELS[inputs.paymentFrequency]}
              </p>
              <p className="font-display text-2xl" style={{ color: "var(--green)" }}>
                {formatCurrency(outputs.periodicPayment, 2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Monthly ownership</p>
              <p className="text-sm font-medium text-stone-700">
                {formatCurrency(outputs.totalMonthlyOwnership, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
