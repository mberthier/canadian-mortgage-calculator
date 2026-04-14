"use client";

import React from "react";
import Script from "next/script";
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
import ShareButton from "@/components/ShareButton";
import FeatureDiscovery from "@/components/FeatureDiscovery";
import Wordmark from "@/components/Wordmark";
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
    <div className="pl-4 py-1 text-sm leading-relaxed"
      style={{ borderLeft: "3px solid var(--brand-teal)", color: "var(--ink-mid)" }}>
      At this rate, you'd pay{" "}
      <span className="font-semibold text-neutral-900">{payment} {freq}</span>{" "}
      for the first {inputs.termYears} years, leaving{" "}
      <span className="font-semibold text-neutral-900">{balance} owing</span> at renewal.
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
          {/* ── Hero header — your design, preserved exactly ── */}
          <div className="mt-8 mb-10">
            <div className="flex flex-col items-center text-center">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>
                  Canadian Mortgage Calculator
                </h1>
                <p className="text-lg mb-5" style={{ color: "var(--ink-muted)" }}>
                  Buying a home in Canada is complicated. We give you the full picture so you don't have to guess.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { icon: "M9 12l2 2 4-4", label: "No account needed" },
                    { icon: "M3 12h18M12 3l7 9-7 9-7-9 7-9z", label: "Canadian rules built in" },
                    { icon: "M3 3v18h18M7 16l4-4 4 4 4-8", label: "Complete & accurate" },
                  ].map(({ icon, label }) => (
                    <span key={label}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-white border"
                      style={{ color: "var(--ink-mid)", borderColor: "#e8e8e8" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={icon}/>
                      </svg>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-8 items-start">

            {/* Left — guided inputs only */}
            <aside>
              <div className="rounded-2xl bg-white p-5"
                style={{ border: "1px solid #e8e8e8" }}>
                <div className="mb-5">
                  <ModeSelector mode={inputs.mortgageMode} onChange={setMode} />
                </div>
                <GuidedForm
                  inputs={inputs} errors={errors}
                  outputs={{
                    cmhcPremium: outputs.cmhcPremium,
                    ltv: outputs.ltv,
                    interestSavedByLumpSums: outputs.interestSavedByLumpSums,
                    paymentsSavedByLumpSums: outputs.paymentsSavedByLumpSums,
                    currentPayment: outputs.currentPayment,
                    ltt: outputs.ltt,
                    gstHst: outputs.gstHst,
                  }}
                  setHomePrice={setHomePrice}
                  setDownPayment={setDownPayment}
                  setDownPaymentPercent={setDownPaymentPercent}
                  setLumpSumForYear={setLumpSumForYear}
                  setField={setField}
                />
              </div>
              <p className="text-xs mt-4 px-1 leading-relaxed" style={{ color: "var(--ink-faint)" }}>
                Estimates only — not financial advice. Consult a licensed broker before decisions.
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

              {/* View amortization shortcut — above charts */}
              {outputs.amortizationSchedule.length > 0 && (
                <button
                  onClick={() => {
                    const el = document.querySelector("[data-section=\"amortization-table\"]");
                    if (el) {
                      el.dispatchEvent(new CustomEvent("open-section", { bubbles: true }));
                      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                    }
                  }}
                  className="text-xs font-medium flex items-center gap-1.5 self-start"
                  style={{ color: "var(--green)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  View full amortization schedule ↓
                </button>
              )}

              {/* Charts */}
              {outputs.amortizationSchedule.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                      <PaymentBreakdownChart outputs={outputs} inputs={inputs} />
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                      <AmortizationChart
                        schedule={outputs.amortizationSchedule}
                        amortizationYears={inputs.amortizationYears}
                        frequency={inputs.paymentFrequency}
                        homePrice={homePrice}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                    <PrincipalInterestByYear
                      schedule={outputs.amortizationSchedule}
                      amortizationYears={inputs.amortizationYears}
                      frequency={inputs.paymentFrequency}
                    />
                  </div>

                  {/* Amortization table — above explore more */}
                  <div data-section="amortization-table">
                    <AmortizationTable
                      schedule={outputs.amortizationSchedule}
                      frequency={inputs.paymentFrequency}
                      termYears={inputs.termYears}
                    />
                  </div>

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
                      currentDownPayment={inputs.downPayment}
                    />
                  </div>

                  {/* Explore more — very bottom */}
                  <FeatureDiscovery />
                </>
              )}
            </main>
          </div>

        </div>

        {/* Mobile sticky footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
          style={{ borderColor: "#ebebea", background: "#ffffff" }}>
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                {FREQUENCY_LABELS[inputs.paymentFrequency]}
              </p>
              <p className="text-2xl font-semibold tracking-tight" style={{ color: "var(--green)" }}>
                {formatCurrency(outputs.periodicPayment, 2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Monthly ownership</p>
                <p className="text-sm font-medium text-neutral-700">
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
