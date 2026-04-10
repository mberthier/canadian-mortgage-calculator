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
import FeatureDiscovery        from "@/components/FeatureDiscovery";
import AboutSection            from "@/components/AboutSection";
import IllustrationHero        from "@/components/illustrations/IllustrationHero";
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
      At this rate, you'd pay{" "}
      <span className="font-semibold text-stone-900">{payment} {freq}</span> for the first {inputs.termYears} years,
      leaving <span className="font-semibold text-stone-900">{balance} owing</span> at renewal.
      {" "}Your equity at that point would be{" "}
      <span className="font-semibold" style={{ color: "var(--green-mid)" }}>{equity}%</span>
      {parseInt(equity) >= 20
        ? " — enough to switch lenders or refinance without CMHC coming back into the picture."
        : ". Still below 20%, so if you refinanced you'd face CMHC rules again."}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          {/* Page header — identical structure to inner pages */}
          <div className="mt-8 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
              <div className="max-w-2xl min-w-0">
                <h1
                  className="font-display text-4xl leading-tight mb-3"
                  style={{ color: "var(--ink)" }}
                >
                  Canadian Mortgage Calculator
                </h1>
          
                <p
                  className="text-xl sm:text-xl font-medium mb-4"
                  style={{ color: "var(--ink)" }}
                >
                  Understand what you can afford before you talk to a bank
                </p>
          
                <p
                  className="text-base mb-6"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Complete Canadian mortgage calculations with no sign-up required.
                </p>
          
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "🔓 No email or account",
                    "🇨🇦 Canadian rules built in",
                    "📊 Complete and accurate",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-sm bg-white border"
                      style={{
                        color: "var(--ink-mid)",
                        borderColor: "var(--cream-dark)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

    <div className="hidden sm:flex justify-end shrink-0">
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: "var(--cream)",
          borderColor: "var(--cream-dark)",
        }}
      >
        <div className="w-32 md:w-36">
          <IllustrationHero />
        </div>
      </div>
    </div>
  </div>
</div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-8 items-start">

            {/* ── Left: Form ── */}
            <aside className="lg:sticky lg:top-20 lg:self-start">

              <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid var(--cream-dark)" }}>
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
              <SummaryCards outputs={outputs} inputs={inputs} shareURL={shareURL} />
              <ResultsNarrative outputs={outputs} inputs={inputs} />
              <FeatureDiscovery />

              {outputs.amortizationSchedule.length > 0 && (
                <>
                  {/* Charts — visual context */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <PaymentBreakdownChart outputs={outputs} inputs={inputs} />
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <AmortizationChart
                        schedule={outputs.amortizationSchedule}
                        amortizationYears={inputs.amortizationYears}
                        frequency={inputs.paymentFrequency}
                        homePrice={homePrice}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-100">
                    <PrincipalInterestByYear
                      schedule={outputs.amortizationSchedule}
                      amortizationYears={inputs.amortizationYears}
                      frequency={inputs.paymentFrequency}
                    />
                  </div>

                  {/* Feature discovery — before the detail tools */}
                  <FeatureDiscovery />

                  {/* Amortization table — collapsed by default */}
                  <AmortizationTable
                    schedule={outputs.amortizationSchedule}
                    frequency={inputs.paymentFrequency}
                    termYears={inputs.termYears}
                  />

                  {/* Power tools */}
                  <div data-section="stress-test"><StressTest outputs={outputs} inputs={inputs} /></div>
                  <div data-section="scenario-comparison"><MortgageComparison inputs={inputs} loanAmount={outputs.loanAmount} /></div>
                  <div data-section="affordability"><AffordabilityCalculator
                    currentHomePrice={inputs.homePrice}
                    currentRate={inputs.interestRate}
                    currentAmortization={inputs.amortizationYears}
                    currentPropertyTax={inputs.propertyTax}
                    currentHeating={inputs.heatingCost}
                    currentCondoFees={inputs.condoFees}
                  /></div>
                  <div data-section="break-penalty"><BreakPenalty /></div>
                </>
              )}
            </main>
          </div>

          {/* About section — full width outside the grid */}
          <AboutSection />
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
