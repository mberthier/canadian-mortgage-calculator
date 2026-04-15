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
import FeatureDiscovery from "@/components/FeatureDiscovery";
import ShareButton from "@/components/ShareButton";
import Wordmark from "@/components/Wordmark";
import { useMortgageCalculator } from "@/hooks/useMortgageCalculator";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CrystalKey. Canadian Mortgage Calculator",
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
  const mode    = inputs.mortgageMode;

  if (mode === "purchase" && inputs.homePrice > 0) {
    const equity = (((inputs.homePrice - outputs.termEndBalance) / inputs.homePrice) * 100).toFixed(0);
    return (
      <div className="pl-4 py-1 text-sm leading-relaxed"
        style={{ borderLeft: "3px solid var(--brand-teal)", color: "var(--ink-mid)" }}>
        At {inputs.interestRate}%, you pay{" "}
        <span className="font-semibold text-neutral-900">{payment} {freq}</span>{" "}
        for {inputs.termYears} years, leaving{" "}
        <span className="font-semibold text-neutral-900">{balance}</span> at renewal.
        {" "}Equity at renewal:{" "}
        <span className="font-semibold" style={{ color: "var(--green)" }}>{equity}%</span>
        {parseInt(equity) >= 20
          ? ", above 20%, so you can switch lenders freely at renewal."
          : ", below 20%, CMHC rules would apply if you refinanced."}
      </div>
    );
  }

  if (mode === "renewal" && inputs.currentBalance > 0) {
    const termInt = formatCurrency(outputs.termInterestPaid, 0, true);
    return (
      <div className="pl-4 py-1 text-sm leading-relaxed"
        style={{ borderLeft: "3px solid var(--brand-teal)", color: "var(--ink-mid)" }}>
        At {inputs.interestRate}%, your new payment is{" "}
        <span className="font-semibold text-neutral-900">{payment} {freq}</span>.{" "}
        You'll pay{" "}
        <span className="font-semibold text-neutral-900">{termInt} in interest</span>{" "}
        this term and owe{" "}
        <span className="font-semibold text-neutral-900">{balance}</span> at your next renewal.
      </div>
    );
  }

  if (mode === "refinance" && inputs.currentBalance > 0) {
    const equity = inputs.homeValue > 0
      ? (((inputs.homeValue - outputs.loanAmount) / inputs.homeValue) * 100).toFixed(0)
      : null;
    return (
      <div className="pl-4 py-1 text-sm leading-relaxed"
        style={{ borderLeft: "3px solid var(--brand-teal)", color: "var(--ink-mid)" }}>
        Your new mortgage is{" "}
        <span className="font-semibold text-neutral-900">{formatCurrency(outputs.loanAmount, 0, true)}</span>{" "}
        at {inputs.interestRate}%{inputs.cashOutAmount > 0 ? `, including ${formatCurrency(inputs.cashOutAmount, 0)} cash-out` : ""}.
        {equity && (
          <>{" "}Remaining equity after refinancing:{" "}
          <span className="font-semibold" style={{ color: "var(--green)" }}>{equity}%</span>.</>
        )}
      </div>
    );
  }

  return null;
}

// ── Empty state — shown before user enters essential fields ──────────────────
function EmptyState({ mode, hasPrice, hasRate }: {
  mode: string; hasPrice: boolean; hasRate: boolean;
}) {
  const steps = mode === "purchase"
    ? [
        { label: "Home price",    done: hasPrice },
        { label: "Down payment",  done: hasPrice },
        { label: "Interest rate", done: hasRate  },
      ]
    : mode === "renewal"
      ? [
          { label: "Remaining balance", done: hasPrice },
          { label: "New rate",          done: hasRate  },
        ]
      : [
          { label: "Home value",     done: hasPrice },
          { label: "Balance owing",  done: hasPrice },
          { label: "New rate",       done: hasRate  },
        ];

  const doneCount = steps.filter(s => s.done).length;

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 flex flex-col items-center justify-center text-center px-8 py-14"
      style={{ minHeight: "320px" }}>
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--green-light)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="var(--green)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>

      <p className="text-base font-semibold text-neutral-900 mb-1">
        Your results will appear here
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
        Fill in a few numbers on the left to get started.
      </p>

      {/* Progress steps */}
      <div className="flex flex-col gap-2 w-full max-w-[240px] text-left">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
              style={step.done
                ? { background: "var(--green)", color: "#fff" }
                : { background: "#f0f0f0", color: "var(--ink-faint)" }}>
              {step.done
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                : i + 1}
            </span>
            <span className="text-sm"
              style={{ color: step.done ? "var(--ink)" : "var(--ink-faint)" }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {doneCount > 0 && doneCount < steps.length && (
        <p className="text-xs mt-5" style={{ color: "var(--green)" }}>
          Almost there — {steps.length - doneCount} more field{steps.length - doneCount > 1 ? "s" : ""} to go
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const {
    inputs, outputs, errors, shareURL,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  } = useMortgageCalculator();

  const isPurchase  = inputs.mortgageMode === "purchase";
  const isRenewal   = inputs.mortgageMode === "renewal";
  const isRefinance = inputs.mortgageMode === "refinance";

  const hasResults = (() => {
    if (isPurchase)  return inputs.homePrice > 0 && inputs.downPaymentPercent > 0 && inputs.interestRate > 0;
    if (isRenewal)   return inputs.currentBalance > 0 && inputs.interestRate > 0;
    if (isRefinance) return inputs.homeValue > 0 && inputs.currentBalance > 0 && inputs.interestRate > 0;
    return false;
  })();
  const homePrice  = isPurchase ? inputs.homePrice : inputs.homeValue;

  return (
    <>
      <Script id="json-ld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* ── Hero header ── */}
          <div className="mt-8 mb-8 text-center">
            <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>
              Canadian Mortgage Calculator
            </h1>
            <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
              Crystal clear numbers for one of the biggest financial decisions you'll make.
            </p>
          </div>

          {/* ── Mode selector, above everything ── */}
          <ModeSelector mode={inputs.mortgageMode} onChange={setMode} />

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-8 items-start">

            {/* Left, guided inputs only */}
            <aside>
              <div className="rounded-2xl bg-white p-5"
                style={{ border: "1px solid #e8e8e8" }}>
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
                Estimates only, not financial advice. Consult a licensed broker before decisions.
              </p>
            </aside>

            {/* Right — results */}
            <main className="space-y-5 pb-24 lg:pb-0">
              {!hasResults ? (
                <EmptyState
                  mode={inputs.mortgageMode}
                  hasPrice={isPurchase ? inputs.homePrice > 0 : inputs.homeValue > 0 || inputs.currentBalance > 0}
                  hasRate={inputs.interestRate > 0}
                />
              ) : (
              <>
              <SummaryCards outputs={outputs} inputs={inputs} shareURL={shareURL} />

              {/* Plain English summary */}
              <ResultsNarrative outputs={outputs} inputs={inputs} />

              {/* Cash at closing — purchase only, above insights */}
              <CashSummary inputs={inputs} outputs={outputs} />

              {/* Insights, dynamic, contextual */}
              <InsightsPanel inputs={inputs} outputs={outputs} />

              {/* View amortization shortcut, above charts */}
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

              {/* Charts, fully mode-aware */}
              {outputs.amortizationSchedule.length > 0 && (
                <>
                  {/* PURCHASE: full chart suite */}
                  {isPurchase && (
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
                            homePrice={inputs.homePrice}
                            showEquity={true}
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
                    </>
                  )}

                  {/* RENEWAL: principal/interest split only, no fabricated equity */}
                  {inputs.mortgageMode === "renewal" && (
                    <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                      <PrincipalInterestByYear
                        schedule={outputs.amortizationSchedule}
                        amortizationYears={inputs.renewalAmortization || inputs.amortizationYears}
                        frequency={inputs.paymentFrequency}
                      />
                    </div>
                  )}

                  {/* REFINANCE: balance chart with real starting equity, plus principal/interest */}
                  {inputs.mortgageMode === "refinance" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Ownership pie only if costs were entered */}
                        {(inputs.propertyTax > 0 || inputs.heatingCost > 0 || inputs.condoFees > 0) && (
                          <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                            <PaymentBreakdownChart outputs={outputs} inputs={inputs} />
                          </div>
                        )}
                        <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                          <AmortizationChart
                            schedule={outputs.amortizationSchedule}
                            amortizationYears={inputs.amortizationYears}
                            frequency={inputs.paymentFrequency}
                            homePrice={inputs.homeValue > 0 ? inputs.homeValue : inputs.currentBalance}
                            initialEquity={inputs.homeValue > 0
                              ? Math.max(0, inputs.homeValue - inputs.currentBalance)
                              : 0}
                            showEquity={inputs.homeValue > 0}
                            title="Balance & equity over remaining amortization"
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
                    </>
                  )}

                  {/* Amortization table, all modes */}
                  <div data-section="amortization-table">
                    <AmortizationTable
                      schedule={outputs.amortizationSchedule}
                      frequency={inputs.paymentFrequency}
                      termYears={inputs.termYears}
                    />
                  </div>

                  {/* Renewal rate scenarios, all modes */}
                  <div data-section="stress-test">
                    <StressTest outputs={outputs} inputs={inputs} />
                  </div>

                  {/* Scenario comparison, all modes */}
                  <div data-section="scenario-comparison">
                    <MortgageComparison inputs={inputs} loanAmount={outputs.loanAmount} />
                  </div>

                  {/* Can you afford this?, purchase only */}
                  {isPurchase && (
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
                  )}

                  {/* Explore more, very bottom */}
                  <FeatureDiscovery />
                </>
              )}
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
