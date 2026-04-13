"use client";

import React from "react";
import Script from "next/script";
import Breadcrumb from "@/components/Breadcrumb";
import SiteLayout from "@/components/SiteLayout";
import ModeSelector from "@/components/ModeSelector";
import GuidedForm from "@/components/GuidedForm";
import SummaryCards from "@/components/SummaryCards";
import InsightsPanel from "@/components/InsightsPanel";
import CashSummary from "@/components/CashSummary";
import PaymentBreakdownChart from "@/components/PaymentBreakdownChart";
import AmortizationChart from "@/components/AmortizationChart";
import PrincipalInterestByYear from "@/components/PrincipalInterestByYear";
import AmortizationTable from "@/components/AmortizationTable";
import StressTest from "@/components/StressTest";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";
import MortgageComparison from "@/components/MortgageComparison";
import BreakPenalty from "@/components/BreakPenalty";
import ShareButton from "@/components/ShareButton";
import FeatureDiscovery from "@/components/FeatureDiscovery";
import AboutSection from "@/components/AboutSection";
import { useMortgageCalculator } from "@/hooks/useMortgageCalculator";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CrystalKey — Canadian Mortgage Calculator",
  url: "https://crystalkey.ca",
  description:
    "Canada's most comprehensive mortgage calculator. CMHC, land transfer tax, GDS/TDS, amortization schedule, stress test, and total upfront costs.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  featureList: [
    "Mortgage payment calculation with Canadian semi-annual compounding",
    "CMHC mortgage default insurance calculator",
    "Land transfer tax calculator for all provinces",
    "Full amortization schedule with CSV export",
    "Mortgage stress test scenarios",
    "GDS/TDS affordability calculator",
    "Purchase, Renewal, and Refinance modes",
  ],
  inLanguage: "en-CA",
  publisher: { "@type": "Organization", name: "CrystalKey", url: "https://crystalkey.ca" },
};

function ResultsNarrative({
  outputs, inputs,
}: {
  outputs: ReturnType<typeof useMortgageCalculator>["outputs"];
  inputs: ReturnType<typeof useMortgageCalculator>["inputs"];
}) {
  const freq    = FREQUENCY_LABELS[inputs.paymentFrequency].toLowerCase();
  const payment = formatCurrency(outputs.periodicPayment, 0);
  const balance = formatCurrency(outputs.termEndBalance, 0, true);
  const equity  = inputs.homePrice > 0
    ? (((inputs.homePrice - outputs.termEndBalance) / inputs.homePrice) * 100).toFixed(0)
    : "0";

  if (inputs.mortgageMode !== "purchase") return null;

  return (
    <div className="rounded-xl px-4 py-3.5 text-sm leading-relaxed border border-stone-100"
      style={{ background: "var(--cream)", color: "var(--ink-mid)" }}>
      At this rate, you'd pay{" "}
      <span className="font-semibold text-stone-900">{payment} {freq}</span>{" "}
      for the first {inputs.termYears} years, leaving{" "}
      <span className="font-semibold text-stone-900">{balance} owing</span> at renewal.
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Breadcrumb crumbs={[
            { label: "CrystalKey", href: "/" },
            { label: "Mortgage Calculator" },
          ]} />

          {/* ── Hero header — your design, preserved exactly ── */}
          <div className="mt-8 mb-10">
            <div className="flex flex-col items-center text-center">
              <div className="max-w-3xl">
                <h1 className="font-display text-4xl leading-tight mb-3" style={{ color: "var(--ink)" }}>
                  Canadian Mortgage Calculator
                </h1>
                <p className="text-lg mb-5" style={{ color: "var(--ink-muted)" }}>
                  Buying a home in Canada is complicated. We give you the full picture so you don't have to guess.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "🔓 No email or account",
                    "🇨🇦 Canadian rules built in",
                    "📊 Complete and accurate",
                  ].map((item) => (
                    <span key={item}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm bg-white border"
                      style={{ color: "var(--ink-mid)", borderColor: "var(--cream-dark)" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-8 items-start">

            {/* Left — guided inputs only */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl bg-white p-5 shadow-sm"
                style={{ border: "1px solid var(--cream-dark)" }}>
                <div className="mb-5">
                  <ModeSelector mode={inputs.mortgageMode} onChange={setMode} />
                </div>
                <GuidedForm
                  inputs={inputs} errors={errors}
                  setHomePrice={setHomePrice}
                  setDownPayment={setDownPayment}
                  setDownPaymentPercent={setDownPaymentPercent}
                  setField={setField}
                  minimumDownPayment={outputs.minimumDownPayment}
                  cmhcPremium={outputs.cmhcPremium}
                  ltv={outputs.ltv}
                />
              </div>
              <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                These numbers are a starting point, not a contract. A good broker will get you closer.
              </p>
            </aside>

            {/* Right — results, insights, charts */}
            <main className="space-y-5 pb-24 lg:pb-0">
              {/* Payment hero */}
              <SummaryCards outputs={outputs} inputs={inputs} shareURL={shareURL} />

              {/* Plain English summary */}
              <ResultsNarrative outputs={outputs} inputs={inputs} />

              {/* Insights — dynamic, contextual */}
              <InsightsPanel inputs={inputs} outputs={outputs} />

              {/* Cash at closing — purchase only */}
              <CashSummary inputs={inputs} outputs={outputs} />

              {/* Charts */}
              {outputs.amortizationSchedule.length > 0 && (
                <>
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

                  {/* Feature discovery + power tools */}
                  <FeatureDiscovery />

                  <AmortizationTable
                    schedule={outputs.amortizationSchedule}
                    frequency={inputs.paymentFrequency}
                    termYears={inputs.termYears}
                  />

                  <div data-section="stress-test">
                    <StressTest outputs={outputs} inputs={inputs} />
                  </div>
                  <div data-section="scenario-comparison">
                    <MortgageComparison inputs={inputs} loanAmount={outputs.loanAmount} />
                  </div>
                  <div data-section="affordability">
                    <AffordabilityCalculator
                      currentHomePrice={inputs.homePrice}
                      currentRate={inputs.interestRate}
                      currentAmortization={inputs.amortizationYears}
                      currentPropertyTax={inputs.propertyTax}
                      currentHeating={inputs.heatingCost}
                      currentCondoFees={inputs.condoFees}
                    />
                  </div>
                  <div data-section="break-penalty">
                    <BreakPenalty />
                  </div>
                </>
              )}
            </main>
          </div>

          {/* About — full width below grid */}
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
