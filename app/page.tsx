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

function H({ children, color }: { children: React.ReactNode; color?: string }) {
  return <span className="font-semibold" style={{ color: color ?? "var(--ink)" }}>{children}</span>;
}

function ResultsNarrative({
  outputs, inputs,
}: {
  outputs: ReturnType<typeof useMortgageCalculator>["outputs"];
  inputs:  ReturnType<typeof useMortgageCalculator>["inputs"];
}) {
  const freq     = FREQUENCY_LABELS[inputs.paymentFrequency].toLowerCase();
  const balance  = formatCurrency(outputs.termEndBalance, 0, true);
  const termInt  = formatCurrency(outputs.termInterestPaid, 0, true);
  const termPrin = formatCurrency(outputs.termPrincipalPaid, 0, true);
  const mode     = inputs.mortgageMode;

  const box: React.CSSProperties = {
    background: "var(--green-light)",
    border: "1px solid var(--green-border)",
    borderRadius: "1rem",
    padding: "1rem 1.25rem",
  };

  if (mode === "purchase" && inputs.homePrice > 0) {
    const equityPct = (inputs.homePrice - outputs.termEndBalance) / inputs.homePrice * 100;
    const canSwitch = equityPct >= 20;
    return (
      <div style={box}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
          Over your {inputs.termYears}-year term you will eliminate{" "}
          <H color="var(--green)">{termPrin}</H> of your mortgage balance and pay{" "}
          <H>{termInt}</H> in interest.
          {" "}At renewal you will owe <H>{balance}</H> with{" "}
          <H color={canSwitch ? "var(--green)" : "var(--amber)"}>{equityPct.toFixed(0)}% equity</H>
          {canSwitch
            ? ", enough to shop any lender freely without re-qualifying."
            : ", still below 20%, so CMHC rules would apply if you chose to refinance."}
        </p>
        <p className="text-xs mt-2.5 pt-2.5 border-t" style={{ color: "var(--ink-muted)", borderColor: "var(--green-border)" }}>
          Total interest over {inputs.amortizationYears} years at this rate:{" "}
          <span className="font-medium" style={{ color: "var(--ink)" }}>
            {formatCurrency(outputs.totalInterest, 0, true)}
          </span>. Accelerated payments or annual lump sums reduce this directly.
        </p>
      </div>
    );
  }

  if (mode === "renewal" && inputs.currentBalance > 0) {
    const hasCurrent = outputs.currentPayment > 0;
    const diff = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
    return (
      <div style={box}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
          This term you will pay <H>{termInt}</H> in interest and pay down{" "}
          <H color="var(--green)">{termPrin}</H> of your balance.
          {" "}At your next renewal you will owe <H>{balance}</H>.
        </p>
        {hasCurrent && Math.abs(diff) > 1 && (
          <p className="text-xs mt-2.5 pt-2.5 border-t" style={{ color: "var(--ink-muted)", borderColor: "var(--green-border)" }}>
            Payment {diff > 0 ? "increases" : "drops"} by{" "}
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {formatCurrency(Math.abs(diff), 0)}/{freq}
            </span>{" "}
            vs your current rate. Total interest remaining:{" "}
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {formatCurrency(outputs.totalInterest, 0, true)}
            </span>.
          </p>
        )}
      </div>
    );
  }

  if (mode === "refinance" && inputs.currentBalance > 0) {
    const equityPct = inputs.homeValue > 0
      ? (inputs.homeValue - outputs.loanAmount) / inputs.homeValue * 100
      : null;
    const hasCurrent = outputs.currentPayment > 0;
    const diff = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
    return (
      <div style={box}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
          Your refinanced mortgage is <H>{formatCurrency(outputs.loanAmount, 0, true)}</H> at {inputs.interestRate}%
          {inputs.cashOutAmount > 0 && <>, including <H color="var(--green)">{formatCurrency(inputs.cashOutAmount, 0)}</H> cash-out</>}.
          {equityPct !== null && (
            <>{" "}You retain{" "}
            <H color={equityPct >= 20 ? "var(--green)" : "var(--amber)"}>{equityPct.toFixed(0)}% equity</H>.</>
          )}
        </p>
        {hasCurrent && Math.abs(diff) > 1 && (
          <p className="text-xs mt-2.5 pt-2.5 border-t" style={{ color: "var(--ink-muted)", borderColor: "var(--green-border)" }}>
            Payment {diff > 0 ? "increases" : "drops"} by{" "}
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {formatCurrency(Math.abs(diff), 0)}/{freq}
            </span>{" "}
            vs your current rate. This term you will pay{" "}
            <span className="font-medium" style={{ color: "var(--ink)" }}>{termInt}</span> in interest.
          </p>
        )}
      </div>
    );
  }

  return null;
}

// ── ContextualExplore. 2-3 relevant links based on mode + inputs ────────────
function ContextualExplore({ mode, hasCMHC, isFirstTimeBuyer }: {
  mode: string; hasCMHC: boolean; isFirstTimeBuyer: boolean;
}) {
  const links = mode === "purchase"
    ? [
        hasCMHC && { label: "CMHC Insurance", sub: "Understand your premium", href: "/cmhc-calculator" },
        isFirstTimeBuyer && { label: "First-Time Buyers", sub: "Programs and rebates", href: "/first-time-buyer" },
        !isFirstTimeBuyer && { label: "Land Transfer Tax", sub: "All provinces", href: "/land-transfer-tax" },
        { label: "Affordability", sub: "How much can you borrow?", href: "/affordability" },
      ].filter(Boolean).slice(0, 3)
    : mode === "renewal"
      ? [
          { label: "Rate History", sub: "See where rates have been", href: "/mortgage-rates" },
          { label: "Break Penalty", sub: "Cost to exit your current mortgage", href: "/mortgage-break-penalty" },
          { label: "Mortgage Glossary", sub: "Every term explained", href: "/glossary" },
        ]
      : [
          { label: "Break Penalty", sub: "Calculate your break penalty first", href: "/mortgage-break-penalty" },
          { label: "Affordability", sub: "Confirm you qualify", href: "/affordability" },
          { label: "Rate History", sub: "See where rates have been", href: "/mortgage-rates" },
        ];

  const ICONS: Record<string, string> = {
    "/cmhc-calculator":      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "/land-transfer-tax":    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
    "/affordability":        "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v6l4 2",
    "/mortgage-rates":       "M22 12h-4l-3 9L9 3l-3 9H2",
    "/mortgage-break-penalty": "M12 22V12M12 12L7 7M12 12l5-5",
    "/first-time-buyer":     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
    "/glossary":             "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-neutral-100">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>
          Related tools
        </p>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(links as { label: string; sub: string; href: string }[]).map(({ label, sub, href }) => (
          <a key={href} href={href}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-neutral-50 border"
            style={{ borderColor: "#e8e8e8" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="mt-0.5 shrink-0" style={{ color: "var(--green)" }} aria-hidden="true">
              <path d={ICONS[href] ?? "M12 2a10 10 0 100 20A10 10 0 0012 2z"}/>
            </svg>
            <div>
              <p className="text-xs font-semibold leading-tight" style={{ color: "var(--ink)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── BreakdownSection, charts + tools collapsed behind a toggle ───────────────
function BreakdownSection({ outputs, inputs, isPurchase, isRefinance }: {
  outputs: ReturnType<typeof useMortgageCalculator>["outputs"];
  inputs:  ReturnType<typeof useMortgageCalculator>["inputs"];
  isPurchase:  boolean;
  isRefinance: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-colors text-sm font-medium"
        style={open
          ? { background: "#fff", borderColor: "#e8e8e8", color: "var(--ink-mid)" }
          : { background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }}>
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          {open ? "Hide detailed breakdown" : "See full breakdown, charts, amortization table, and more"}
        </span>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="space-y-5">
          {/* PURCHASE charts */}
          {isPurchase && (
            <>
              {(inputs.propertyTax > 0 || inputs.heatingCost > 0 || inputs.condoFees > 0) && (
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
              )}
              {!(inputs.propertyTax > 0 || inputs.heatingCost > 0 || inputs.condoFees > 0) && (
                <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                  <AmortizationChart
                    schedule={outputs.amortizationSchedule}
                    amortizationYears={inputs.amortizationYears}
                    frequency={inputs.paymentFrequency}
                    homePrice={inputs.homePrice}
                    showEquity={true}
                  />
                </div>
              )}
              <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                <PrincipalInterestByYear
                  schedule={outputs.amortizationSchedule}
                  amortizationYears={inputs.amortizationYears}
                  frequency={inputs.paymentFrequency}
                />
              </div>
            </>
          )}

          {/* RENEWAL charts */}
          {inputs.mortgageMode === "renewal" && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-100">
              <PrincipalInterestByYear
                schedule={outputs.amortizationSchedule}
                amortizationYears={inputs.renewalAmortization || inputs.amortizationYears}
                frequency={inputs.paymentFrequency}
              />
            </div>
          )}

          {/* REFINANCE charts */}
          {isRefinance && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* Amortization table */}
          <div data-section="amortization-table">
            <AmortizationTable
              schedule={outputs.amortizationSchedule}
              frequency={inputs.paymentFrequency}
              termYears={inputs.termYears}
            />
          </div>

          {/* Scenario comparison */}
          <div data-section="scenario-comparison">
            <MortgageComparison inputs={inputs} loanAmount={outputs.loanAmount} />
          </div>

        </div>
      )}

      {/* Contextual explore links, always visible at bottom */}
      <ContextualExplore
        mode={inputs.mortgageMode}
        hasCMHC={outputs.cmhcPremium > 0}
        isFirstTimeBuyer={inputs.isFirstTimeBuyer}
      />
    </div>
  );
}

// ── Empty state, shown before user enters essential fields ──────────────────
function EmptyState({ mode, hasPrice, hasRate, hasProvince }: {
  mode: string; hasPrice: boolean; hasRate: boolean; hasProvince: boolean;
}) {
  const steps = mode === "purchase"
    ? [
        { label: "Province",      done: hasProvince },
        { label: "Home price",    done: hasPrice },
        { label: "Down payment",  done: hasPrice },
        { label: "Interest rate", done: hasRate  },
      ]
    : mode === "renewal"
      ? [
          { label: "Province",          done: hasProvince },
          { label: "Remaining balance", done: hasPrice },
          { label: "New rate",          done: hasRate  },
        ]
      : [
          { label: "Province",       done: hasProvince },
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
          Almost there, {steps.length - doneCount} more field{steps.length - doneCount > 1 ? "s" : ""} to go
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const {
    inputs, outputs, errors, shareURL, mode,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  } = useMortgageCalculator();

  const isPurchase  = mode === "purchase";
  const isRenewal   = mode === "renewal";
  const isRefinance = mode === "refinance";

  const hasResults = (() => {
    if (!inputs.province) return false; // province required for all modes
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
          <ModeSelector mode={mode} onChange={setMode} />

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

            {/* Right, results */}
            <main className="space-y-5 pb-24 lg:pb-0">
              {!hasResults ? (
                <EmptyState
                  mode={inputs.mortgageMode}
                  hasProvince={inputs.province !== ""}
                  hasPrice={isPurchase ? inputs.homePrice > 0 : inputs.homeValue > 0 || inputs.currentBalance > 0}
                  hasRate={inputs.interestRate > 0}
                />
              ) : (
              <>
              <SummaryCards outputs={outputs} inputs={inputs} shareURL={shareURL} />

              {/* Plain English summary */}
              <ResultsNarrative outputs={outputs} inputs={inputs} />

              {/* Cash at closing, purchase only */}
              <CashSummary inputs={inputs} outputs={outputs} />

              {/* Insights */}
              <InsightsPanel inputs={inputs} outputs={outputs} />

              {/* Can you afford this? — purchase only */}
              {isPurchase && (
                <AffordabilityCalculator
                  currentHomePrice={inputs.homePrice}
                  currentRate={inputs.interestRate}
                  currentAmortization={inputs.amortizationYears}
                  currentPropertyTax={inputs.propertyTax}
                  currentHeating={inputs.heatingCost}
                  currentCondoFees={inputs.condoFees}
                  currentDownPayment={inputs.downPayment}
                />
              )}

              {/* Stress test, what if rates go up? */}
              {outputs.amortizationSchedule.length > 0 && (
                <StressTest outputs={outputs} inputs={inputs} />
              )}

              {/* Charts + tools, collapsed breakdown */}
              {outputs.amortizationSchedule.length > 0 && (
                <BreakdownSection
                  outputs={outputs}
                  inputs={inputs}
                  isPurchase={isPurchase}
                  isRefinance={isRefinance}
                />
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
