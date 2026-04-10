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
import ShareButton             from "@/components/ShareButton";
import RateHistoryChart        from "@/components/RateHistoryChart";
import FirstTimeBuyerGuide     from "@/components/FirstTimeBuyerGuide";
import Tooltip                 from "@/components/Tooltip";
import SiteLayout             from "@/components/SiteLayout";
import { FREQUENCY_LABELS }    from "@/lib/constants";
import { formatCurrency }      from "@/lib/formatters";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CrystalKey — Canadian Mortgage Calculator",
  "url": "https://crystalkey.ca",
  "description": "Canada's most comprehensive mortgage calculator. CMHC, land transfer tax, GDS/TDS, amortization schedule, stress test, and total upfront costs.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" },
  "featureList": [
    "Mortgage payment calculation with Canadian semi-annual compounding",
    "CMHC mortgage default insurance calculator",
    "Land transfer tax calculator for all provinces",
    "Full amortization schedule with CSV export",
    "Mortgage stress test scenarios",
    "GDS/TDS affordability calculator",
    "Purchase, Renewal, and Refinance modes",
  ],
  "inLanguage": "en-CA",
  "publisher": { "@type": "Organization", "name": "CrystalKey", "url": "https://crystalkey.ca" },
};

function ResultsNarrative({ outputs, inputs }: {
  outputs: ReturnType<typeof useMortgageCalculator>["outputs"];
  inputs: ReturnType<typeof useMortgageCalculator>["inputs"];
}) {
  const freq      = FREQUENCY_LABELS[inputs.paymentFrequency].toLowerCase();
  const payment   = formatCurrency(outputs.periodicPayment, 0);
  const balance   = formatCurrency(outputs.termEndBalance, 0, true);
  const equity    = inputs.homePrice > 0
    ? ((inputs.homePrice - outputs.termEndBalance) / inputs.homePrice * 100).toFixed(0)
    : "0";
  const isPurchase = inputs.mortgageMode === "purchase";

  if (!isPurchase) return null;

  return (
    <div className="rounded-xl px-4 py-3.5 text-sm leading-relaxed border border-stone-100"
      style={{ background: "var(--cream)", color: "var(--ink-mid)" }}>
      <span className="font-semibold text-stone-700">Your snapshot: </span>
      You'd pay <span className="font-semibold text-stone-900">{payment} {freq}</span> for
      the first {inputs.termYears} years, with{" "}
      <span className="font-semibold text-stone-900">{balance} still owing</span> at renewal.
      {" "}Your equity would be <span className="font-semibold" style={{ color: "var(--green-mid)" }}>{equity}%</span>
      {parseInt(equity) >= 20
        ? " — enough to refinance or switch lenders without penalty."
        : " — still below 20%, so CMHC rules would apply if you refinanced."}
    </div>
  );
}

export default function Home() {
  const {
    inputs, outputs, errors, shareURL,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  } = useMortgageCalculator();

  const isPurchase = inputs.mortgageMode === "purchase";
  const homePrice  = isPurchase ? inputs.homePrice : inputs.homeValue;

  return (
    <>
      <Script id="json-ld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteLayout>
        {/* Rate badge + share button injected into a top bar below the shared header */}
        <div className="border-b bg-white" style={{ borderColor: "var(--cream-dark)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--ink-faint)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Rates Apr 9, 2026
              <Tooltip content="Canadian mortgage rates use semi-annual compounding by law (Interest Act). This means interest compounds twice per year — unlike the US where monthly compounding is standard. Our calculations correctly apply this Canadian convention." />
            </div>
            <ShareButton url={shareURL} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] xl:grid-cols-[420px,1fr] gap-8 items-start">

            {/* ── Left: Form ── */}
            <aside>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--green)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  <RateHistoryChart
                    currentRate={inputs.interestRate}
                    onSelectRate={(r) => setField("interestRate", r)}
                  />
                  {inputs.mortgageMode === "purchase" && (
                    <FirstTimeBuyerGuide
                      homePrice={inputs.homePrice}
                      downPayment={inputs.downPayment}
                      downPercent={inputs.downPaymentPercent}
                      interestRate={inputs.interestRate}
                      province={inputs.province}
                      cmhcPremium={outputs.cmhcPremium}
                      stressTestRate={outputs.stressTestRate}
                      isFirstTimeBuyer={inputs.isFirstTimeBuyer}
                      onToggle={() => setField("isFirstTimeBuyer", !inputs.isFirstTimeBuyer)}
                    />
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                These numbers are a starting point, not a contract. A good broker will get you closer.
              </p>
            </aside>

            {/* ── Right: Results ── */}
            <main className="space-y-5 pb-24 lg:pb-0">
              <SummaryCards outputs={outputs} inputs={inputs} />
              <ResultsNarrative outputs={outputs} inputs={inputs} />

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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Monthly ownership</p>
                <p className="text-sm font-medium text-stone-700">
                  {formatCurrency(outputs.totalMonthlyOwnership, 0)}
                </p>
              </div>
              <ShareButton url={shareURL} />
            </div>
          </div>
        </div>
      </SiteLayout>
    </>
  );
}
