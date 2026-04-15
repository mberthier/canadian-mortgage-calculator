"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment } from "@/lib/mortgageMath";
import { RATE_PRESETS } from "@/lib/constants";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

type InsightType = "win" | "opportunity" | "warning" | "caution" | "info";

interface Insight {
  type:     InsightType;
  priority: number;
  headline: string;
  detail:   string;
  link?:    { href: string; label: string };
  brokerCTA?: string; // inline broker prompt within detail
}

// ── Rate gap helper ───────────────────────────────────────────────────────────

function getBestAvailableRate(mortgageType: "insured" | "insurable" | "uninsurable"): number {
  // Best 5yr fixed from RATE_PRESETS — insured and insurable get same rate, uninsurable +0.20
  const best5yr = Math.min(...RATE_PRESETS.filter(r => r.term === 5).map(r => r.rate));
  return mortgageType === "uninsurable" ? best5yr + 0.20 : best5yr;
}

function getMortgageType(inputs: MortgageInputs): "insured" | "insurable" | "uninsurable" {
  const { homePrice, downPaymentPercent, amortizationYears } = inputs;
  if (homePrice > 1_500_000 || amortizationYears > 25) return "uninsurable";
  if (downPaymentPercent < 20) return "insured";
  return "insurable";
}

function computeRateGapSavings(inputs: MortgageInputs, outputs: MortgageOutputs): {
  mortgageType: "insured" | "insurable" | "uninsurable";
  bestRate: number;
  savings: number;
} | null {
  if (!inputs.interestRate || outputs.loanAmount <= 0) return null;
  const mortgageType = getMortgageType(inputs);
  const bestRate     = getBestAvailableRate(mortgageType);
  const gap          = inputs.interestRate - bestRate;
  if (gap <= 0.1) return null; // less than 0.1% gap, not worth showing

  const currentTotal = outputs.periodicPayment * outputs.amortizationSchedule.length;
  const bestPmt      = calculateMortgagePayment(outputs.loanAmount, bestRate, inputs.amortizationYears, inputs.paymentFrequency);
  const bestTotal    = bestPmt * outputs.amortizationSchedule.length;
  const savings      = Math.round(currentTotal - bestTotal);

  if (savings < 500) return null;
  return { mortgageType, bestRate, savings };
}

// ── Priority framework ────────────────────────────────────────────────────────
// P1: changes the decision or costs money if missed
// P2: high-value and actionable
// P3: confirms good position or moderate opportunity
// P4: informational context

function getInsights(inputs: MortgageInputs, outputs: MortgageOutputs): Insight[] {
  const ins: Insight[] = [];
  const mode = inputs.mortgageMode;

  if (mode === "purchase") {
    const down  = inputs.downPaymentPercent;
    const price = inputs.homePrice;
    if (!price) return [];

    if (down < 10 && price > 0) {
      ins.push({
        type: "warning", priority: 1,
        headline: `Under 10% down — a 5% price drop would put you underwater`,
        detail: `With ${down.toFixed(1)}% down, a 5% decline in home value wipes out your entire equity. You would owe more than the home is worth. Not a reason not to buy, but it matters if your circumstances change and you need to sell within the first few years.`,
      });
    }

    if (down < 20 && outputs.cmhcPremium > 0) {
      const pmt           = calculateMortgagePayment(outputs.cmhcPremium, inputs.interestRate, inputs.amortizationYears, "monthly");
      const totalCmhcCost = Math.round(pmt * 12 * inputs.amortizationYears);
      ins.push({
        type: "caution", priority: 1,
        headline: `CMHC adds ${formatCurrency(outputs.cmhcPremium, 0)} to your mortgage — the true cost with interest is ${formatCurrency(totalCmhcCost, 0, true)}`,
        detail: `The ${formatCurrency(outputs.cmhcPremium, 0)} premium is rolled into your balance and you pay interest on it for the full ${inputs.amortizationYears}-year amortization. The premium itself is one number — the total cost you actually pay is ${formatCurrency(totalCmhcCost, 0, true)}.`,
      });
    }

    if (down >= 15 && down < 20 && price > 0) {
      const needed = Math.ceil(price * 0.20) - inputs.downPayment;
      const saving = outputs.periodicPayment - outputs.paymentWithoutCMHC;
      ins.push({
        type: "opportunity", priority: 1,
        headline: `${formatCurrency(needed, 0)} more reaches 20% down and eliminates CMHC entirely`,
        detail: `At 20% down you avoid the ${formatCurrency(outputs.cmhcPremium, 0)} CMHC premium. Your payment drops ${formatCurrency(saving, 2)}/period and you save the full interest cost over ${inputs.amortizationYears} years.`,
        brokerCTA: "A broker can show you whether saving to 20% first makes sense for your timeline.",
      });
    }

    if (inputs.paymentFrequency === "monthly" && outputs.loanAmount > 0) {
      const bwPmt   = outputs.periodicPayment / 2;
      const mr      = Math.pow(1 + inputs.interestRate / 100 / 2, 2 / 12) - 1;
      const n       = mr > 0 ? Math.log(bwPmt / (bwPmt - outputs.loanAmount * mr / 2)) / Math.log(1 + mr / 2) : 0;
      const bwYears = n > 0 ? n / 26 : 0;
      const yrsSaved = inputs.amortizationYears - bwYears;
      if (yrsSaved > 0.5) {
        const saved = Math.max(0, Math.round(
          outputs.periodicPayment * 12 * inputs.amortizationYears - bwPmt * 26 * bwYears
        ));
        ins.push({
          type: "opportunity", priority: 2,
          headline: `Switching to accelerated bi-weekly saves ${formatCurrency(saved, 0, true)} in interest at no extra cost`,
          detail: `You pay half your monthly amount every two weeks. Because there are 26 bi-weekly periods in a year (not 24), you make one extra full payment per year. That alone saves ${formatCurrency(saved, 0, true)} in interest and pays off your mortgage ${yrsSaved.toFixed(1)} years early.`,
        });
      }
    }

    if (price > 0 && inputs.interestRate > 0) {
      const stressRate    = outputs.stressTestRate;
      const qualifyingPmt = calculateMortgagePayment(outputs.loanAmount, stressRate, inputs.amortizationYears, "monthly");
      const actualPmt     = calculateMortgagePayment(outputs.loanAmount, inputs.interestRate, inputs.amortizationYears, "monthly");
      const gap = Math.round(qualifyingPmt - actualPmt);
      if (gap > 50) {
        ins.push({
          type: "caution", priority: 2,
          headline: `Your lender qualifies you at ${stressRate.toFixed(2)}%, not ${inputs.interestRate.toFixed(2)}%`,
          detail: `The stress test adds ${formatCurrency(gap, 0)}/month to your qualifying payment. It also caps your maximum purchase price — roughly ${Math.round((1 - inputs.interestRate / stressRate) * 100)}% lower than if you qualified at your contract rate.`,
        });
      }
    }

    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 && rem > 0 ? `${yrs}yr ${rem}mo` : yrs > 0 ? `${yrs} years` : `${rem} months`;
      ins.push({
        type: "win", priority: 2,
        headline: `Annual lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${t} off your amortization`,
        detail: `Lump sums reduce the principal all future interest is calculated on. Most mortgages allow 10 to 20% of the original balance per year without penalty.`,
      });
    }

    if (inputs.extraPayment > 0) {
      const baseLen   = inputs.amortizationYears * 12;
      const actualLen = outputs.amortizationSchedule.length;
      const moSaved   = Math.max(0, baseLen - actualLen);
      if (moSaved > 0) {
        const yrS = Math.floor(moSaved / 12), moS = moSaved % 12;
        const t   = [yrS > 0 ? `${yrS} yr` : "", moS > 0 ? `${moS} mo` : ""].filter(Boolean).join(" ");
        ins.push({
          type: "win", priority: 3,
          headline: `Extra ${formatCurrency(inputs.extraPayment, 0)}/payment cuts ${t} off your amortization`,
          detail: `Extra payments reduce your principal directly. Every dollar extra in year one saves more than a dollar in year ${inputs.amortizationYears} because it compounds over the remaining term.`,
        });
      }
    }

    if (down >= 20) {
      ins.push({
        type: "win", priority: 3,
        headline: "20% or more down — no CMHC required",
        detail: `Your full down payment builds equity from day one with no insurance premium. At ${down.toFixed(0)}% down, your LTV is ${(100 - down).toFixed(0)}%, well inside the uninsured threshold.`,
      });
    }

    if (inputs.isFirstTimeBuyer && outputs.ltt.firstTimeBuyerRebate > 0) {
      ins.push({
        type: "win", priority: 3,
        headline: `First-time buyer LTT rebate saves ${formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)} at closing`,
        detail: `Applied automatically at closing in most provinces. Make sure your lawyer knows you are a first-time buyer so it is captured correctly.`,
      });
    }

    if (price > 0 && outputs.totalInterest > 0) {
      const pct = ((outputs.totalInterest / price) * 100).toFixed(0);
      ins.push({
        type: "info", priority: 4,
        headline: `You will pay ${pct}% of the home's purchase price in interest charges`,
        detail: `Over ${inputs.amortizationYears} years at ${inputs.interestRate}%, total interest is ${formatCurrency(outputs.totalInterest, 0, true)}. Accelerated payments or lump sums reduce this directly.`,
      });
    }

    if (down >= 20 && price <= 1_500_000 && inputs.amortizationYears <= 25) {
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage qualifies as insurable — ask your broker about insurable pricing",
        detail: `With ${down.toFixed(0)}% down, under $1.5M, and a 25-year amortization, lenders can pool-insure this mortgage even without a CMHC premium. You may get rates close to insured buyers.`,
        brokerCTA: "Ask specifically for insurable pricing — not all brokers offer it proactively.",
      });
    }

    if (price > 1_500_000 || inputs.amortizationYears > 25) {
      const reason = price > 1_500_000 ? "purchases over $1.5M" : "a 30-year amortization";
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage is uninsurable — broker shopping matters more at this tier",
        detail: `Mortgages on ${reason} cannot be insured. Conventional pricing is typically 0.10 to 0.25% higher, and the spread between lenders is wider.`,
        brokerCTA: "Working with a broker who accesses multiple lenders has a bigger impact here than on a standard insured purchase.",
      });
    }

    if (inputs.isNewBuild && outputs.gstHst.net > 0) {
      ins.push({
        type: "info", priority: 4,
        headline: `New build: ${formatCurrency(outputs.gstHst.net, 0)} in GST/HST is due on closing day`,
        detail: `After the federal new housing rebate, the remaining GST/HST is payable at closing and cannot be financed into your mortgage.`,
      });
    }
  }

  if (mode === "renewal") {
    const hasCurrent = outputs.currentPayment > 0;
    const diff       = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
    const pct        = hasCurrent && outputs.currentPayment > 0 ? (diff / outputs.currentPayment) * 100 : 0;

    if (hasCurrent && diff > 300) {
      ins.push({
        type: "warning", priority: 1,
        headline: `Payment increases ${formatCurrency(diff, 0)}/period (+${pct.toFixed(0)}%) at renewal`,
        detail: `Plan for this now, not the week your term ends. A longer term locks in predictability. A broker can also show you whether a variable rate or blend-and-extend option softens the increase.`,
        brokerCTA: "Get a competing offer before you sign — your lender's first offer is rarely their best.",
      });
    }

    ins.push({
      type: "opportunity", priority: 1,
      headline: "You can switch lenders at renewal without re-qualifying — your lender's first offer is rarely their best",
      detail: "Since November 2024, switching lenders at renewal no longer requires passing the stress test. Your existing lender knows this, which is why they often send a low-effort renewal offer first.",
      brokerCTA: "Get at least one competing quote from a broker before you sign anything.",
    });

    if (hasCurrent && diff > 100 && diff <= 300) {
      ins.push({
        type: "caution", priority: 2,
        headline: `Payment increases ${formatCurrency(diff, 0)}/period at renewal (+${pct.toFixed(0)}%)`,
        detail: `Manageable, but worth stress-testing your budget at this new level before renewal day.`,
      });
    }

    if (hasCurrent && diff < -100) {
      ins.push({
        type: "win", priority: 2,
        headline: `Payment drops ${formatCurrency(Math.abs(diff), 0)}/period at renewal`,
        detail: `Rates have moved in your favour. The smartest move: keep your payment at the old level. That extra amount goes entirely to principal with no change to your monthly outflow.`,
      });
    }

    const remainingAmort = inputs.renewalAmortization || inputs.amortizationYears;
    if (remainingAmort > 20 && inputs.currentBalance > 0) {
      const shorterPmt     = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency);
      const extraPerPeriod = Math.round(shorterPmt - outputs.periodicPayment);
      if (extraPerPeriod > 0 && extraPerPeriod < 600) {
        const shortPmt20 = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, "monthly");
        const intShort   = Math.round(shortPmt20 * 12 * 20 - inputs.currentBalance);
        const intSaved   = Math.max(0, Math.round(outputs.totalInterest - intShort));
        if (intSaved > 5000) {
          ins.push({
            type: "opportunity", priority: 2,
            headline: `Shortening to 20 years costs ${formatCurrency(extraPerPeriod, 0)}/period more and saves ${formatCurrency(intSaved, 0, true)} in interest`,
            detail: `Renewal is the best moment to shorten your amortization — no existing contract to break. Paying ${formatCurrency(extraPerPeriod, 0)} more per period saves ${formatCurrency(intSaved, 0, true)} in total interest.`,
          });
        }
      }
    }

    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 ? `${yrs}yr${rem > 0 ? ` ${rem}mo` : ""}` : `${rem}mo`;
      ins.push({
        type: "win", priority: 2,
        headline: `Your lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${t} off your amortization`,
        detail: `Every dollar of lump sum at renewal works harder than mid-term, because it reduces the principal your new rate is charged on from day one.`,
      });
    }

    if (hasCurrent && Math.abs(diff) <= 100) {
      ins.push({
        type: "win", priority: 3,
        headline: "Payment barely changes at renewal — stable ground",
        detail: (() => {
          const extra = inputs.currentBalance > 0 && inputs.interestRate > 0
            ? Math.round(100 * 12 * (inputs.renewalAmortization || inputs.amortizationYears) * 0.35)
            : 2000;
          return `Your new rate is close to your expiring rate. Consider bumping your payment by $100/period — that saves approximately ${formatCurrency(extra, 0, true)} in interest over the remaining amortization.`;
        })(),
      });
    }

    const hasLumpSums = Object.values(inputs.lumpSumsByYear).some(v => v > 0);
    if (inputs.currentBalance > 0 && !hasLumpSums && outputs.interestSavedByLumpSums === 0) {
      const example = Math.round(inputs.currentBalance * 0.10 / 1000) * 1000;
      const saving  = Math.round(example * (inputs.interestRate / 100) * (remainingAmort) * 0.4);
      ins.push({
        type: "opportunity", priority: 3,
        headline: "Your renewal date is the best moment to make a lump sum payment",
        detail: `A ${formatCurrency(example, 0)} lump sum (10% of your balance) right before renewal could save approximately ${formatCurrency(saving, 0, true)} in interest charges — because it reduces the principal your new rate is applied to from day one.`,
      });
    }

    if (!hasCurrent) {
      ins.push({
        type: "info", priority: 4,
        headline: "Enter your current rate to see your payment change at renewal",
        detail: "Add your expiring contracted rate above and we will show you exactly how much your payment goes up or down.",
      });
    }
  }

  if (mode === "refinance") {
    const equity    = Math.max(0, inputs.homeValue - inputs.currentBalance);
    const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
    const ltv       = inputs.homeValue > 0 ? inputs.currentBalance / inputs.homeValue : 0;

    if (ltv > 0.80) {
      ins.push({
        type: "warning", priority: 1,
        headline: `LTV of ${(ltv * 100).toFixed(1)}% exceeds the 80% refinance cap`,
        detail: `Canadian refinances are capped at 80% loan-to-value. You would need to reduce the loan amount, wait for your home value to rise, or pay down more principal before refinancing is available.`,
      });
    }

    if (inputs.currentBalance > 0 && inputs.currentRate > 0) {
      const threeMonthInt = Math.round(inputs.currentBalance * (inputs.currentRate / 100) / 12 * 3);
      ins.push({
        type: "caution", priority: 1,
        headline: "Factor in your break penalty before deciding — it can exceed the interest savings",
        detail: `Breaking a fixed mortgage costs the greater of 3-months interest (approx. ${formatCurrency(threeMonthInt, 0)}) or the IRD. The IRD can be much larger if your contracted rate is significantly above current rates.`,
        link: { href: "/mortgage-break-penalty", label: "Calculate your break penalty" },
      });
    }

    if (ltv > 0.75 && ltv <= 0.80) {
      ins.push({
        type: "caution", priority: 2,
        headline: `LTV at ${(ltv * 100).toFixed(1)}% — close to the 80% refinance cap`,
        detail: `Adding significant cash-out could push you over the 80% limit. Consider whether a HELOC (up to 65% LTV) gives you flexibility without a full refinance.`,
      });
    }

    if (inputs.amortizationYears > 20 && inputs.currentBalance > 0) {
      const shortPmt = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency);
      const saving   = Math.round(outputs.periodicPayment - shortPmt);
      if (saving < -50) {
        const extraInterest = Math.abs(saving) * 12 * (inputs.amortizationYears - 20);
        ins.push({
          type: "caution", priority: 2,
          headline: `Extending to ${inputs.amortizationYears} years saves ${formatCurrency(Math.abs(saving), 0)}/period but adds ${formatCurrency(extraInterest, 0, true)} in interest`,
          detail: `Keep the amortization as short as your cash flow allows — you can always adjust at your next renewal.`,
        });
      }
    }

    if (equityPct >= 35) {
      ins.push({
        type: "win", priority: 2,
        headline: `Strong equity at ${equityPct.toFixed(0)}% — you have real negotiating power`,
        detail: `With ${formatCurrency(equity, 0, true)} in equity, you are a low-risk borrower and lenders compete for your business.`,
        brokerCTA: "Get at least two or three quotes — a broker can often get meaningfully better terms than going direct.",
      });
    }

    if (inputs.cashOutAmount > 0) {
      const cashCostPerYear = Math.round(inputs.cashOutAmount * (inputs.interestRate / 100));
      ins.push({
        type: "info", priority: 3,
        headline: `Your ${formatCurrency(inputs.cashOutAmount, 0)} cash-out costs ${formatCurrency(cashCostPerYear, 0)}/year in interest`,
        detail: `Mortgage rates are among the cheapest borrowing available. The key question is whether the use of funds justifies the ongoing interest. If consolidating debt, the math only works if the behaviour changes too.`,
      });
    }

    if (ltv <= 0.80 && inputs.homeValue > 0) {
      ins.push({
        type: "win", priority: 4,
        headline: "No CMHC required on this refinance",
        detail: `Refinancing at 80% LTV or below is uninsured — no CMHC premium added to your balance.`,
      });
    }
  }

  const w: Record<InsightType, number> = { warning: 0, caution: 1, opportunity: 2, win: 3, info: 4 };
  ins.sort((a, b) => a.priority !== b.priority
    ? a.priority - b.priority
    : w[a.type] - w[b.type]
  );

  return ins;
}

// ── Rate gap CTA component ────────────────────────────────────────────────────

function RateGateCTA({ inputs, outputs }: { inputs: MortgageInputs; outputs: MortgageOutputs }) {
  const [step, setStep]   = useState<"teaser" | "form" | "done">("teaser");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const gapData = computeRateGapSavings(inputs, outputs);
  if (!gapData) return null;

  const { mortgageType, bestRate, savings } = gapData;
  const typeLabel = mortgageType === "insured" ? "insured" : mortgageType === "insurable" ? "insurable" : "conventional";

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      // Store lead — in production hook up to CRM/email service
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email,
          mortgageType, savings, bestRate,
          userRate: inputs.interestRate,
          homePrice: inputs.homePrice,
          balance: inputs.currentBalance,
          mode: inputs.mortgageMode,
          province: inputs.province,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {}); // fail silently if no API yet
    } finally {
      setLoading(false);
      setStep("done");
    }
  };

  if (step === "done") {
    return (
      <div className="px-5 py-4 flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)", borderBottom: "1px solid #e5e7eb" }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--green)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7l3 3 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">We will be in touch shortly</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
            A CrystalKey partner broker will reach out with a personalized rate analysis for your {typeLabel} mortgage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid #e5e7eb", background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)" }}>
      {step === "teaser" && (
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center gap-1 shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
              style={{ background: "#f0fdfa", borderColor: "#99f6e4", color: "#0f766e", minWidth: "84px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="#0f766e" strokeWidth="2"/>
                <path d="M12 8v4M12 15v.5" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Rate gap
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                At the best available {typeLabel} rate ({bestRate.toFixed(2)}%), you could save{" "}
                <span style={{ color: "var(--brand-teal)" }}>{formatCurrency(savings, 0, true)}</span> in interest
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                Your entered rate is {inputs.interestRate.toFixed(2)}%. The best available {typeLabel} rate right now
                is {bestRate.toFixed(2)}% — a {(inputs.interestRate - bestRate).toFixed(2)}% gap worth{" "}
                {formatCurrency(savings, 0, true)} over your amortization.
              </p>
              <button
                onClick={() => setStep("form")}
                className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "var(--brand-teal)", color: "#fff" }}>
                Get a free personalized rate analysis
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <p className="text-xs mt-1.5" style={{ color: "var(--ink-faint)" }}>No obligation. A broker will contact you with an actual rate.</p>
            </div>
          </div>
        </div>
      )}

      {step === "form" && (
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-neutral-900 mb-1">Get your personalized rate analysis</p>
          <p className="text-xs mb-3" style={{ color: "var(--ink-muted)" }}>
            A CrystalKey partner broker will compare {typeLabel} rates from 30+ lenders against your profile and contact you within one business day.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!email.includes("@") || loading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "var(--brand-teal)", color: "#fff" }}>
              {loading ? "Sending..." : "Get my rate analysis"}
            </button>
            <button
              onClick={() => setStep("teaser")}
              className="px-3 py-2 rounded-lg text-xs font-medium"
              style={{ color: "var(--ink-muted)", background: "#f5f5f5" }}>
              Cancel
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
            No spam. No obligation. Your data is only shared with the assigned broker.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Type styling — left border accent only, no coloured badges ───────────────
const TYPE_STYLE: Record<InsightType, {
  border: string;   // left border colour
  icon:   React.ReactNode;
}> = {
  warning: {
    border: "#ef4444",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.3 3.6L2 20h20L13.7 3.6a2 2 0 00-3.4 0z"
          stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 10v4M12 17v.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  caution: {
    border: "#f59e0b",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#f59e0b" strokeWidth="2"/>
        <path d="M12 8v4M12 15v.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  opportunity: {
    border: "var(--green)",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z"
          stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  win: {
    border: "var(--green)",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6H4l2 8h12l2-8z" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14v4M8 18h8" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    border: "#d1d5db",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="2"/>
        <path d="M12 11v6M12 8v.5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

const SHOW_BY_DEFAULT = 3;

// ── Component ──────────────────────────────────────────────────────────────────
export default function InsightsPanel({ inputs, outputs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const all = getInsights(inputs, outputs);
  if (all.length === 0) return null;

  const gapData = computeRateGapSavings(inputs, outputs);
  const visible = expanded ? all : all.slice(0, SHOW_BY_DEFAULT);
  const hidden  = all.length - SHOW_BY_DEFAULT;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z"
            stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>
          Insights
        </p>
      </div>

      {/* Rate gap CTA — first position when applicable */}
      <RateGateCTA inputs={inputs} outputs={outputs} />

      {/* Insight rows — left border accent, no coloured badges */}
      <div className="divide-y divide-neutral-50">
        {visible.map((ins, i) => {
          const s = TYPE_STYLE[ins.type];
          return (
            <div key={i} className="py-4 pr-5 flex items-start gap-0"
              style={{ paddingLeft: "1.25rem" }}>
              {/* Left border accent */}
              <div className="shrink-0 w-0.5 self-stretch rounded-full mr-4 mt-0.5"
                style={{ background: s.border, minHeight: "1rem" }} />
              {/* Icon */}
              <span className="shrink-0 mt-0.5 mr-3">{s.icon}</span>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug text-neutral-900">
                  {ins.headline}
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {ins.detail}
                </p>
                {ins.brokerCTA && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--green)" }}>
                    {ins.brokerCTA}
                  </p>
                )}
                {ins.link && (
                  <Link href={ins.link.href}
                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium"
                    style={{ color: "var(--green)" }}>
                    {ins.link.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / less */}
      {all.length > SHOW_BY_DEFAULT && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium border-t border-neutral-100 transition-colors hover:bg-neutral-50"
          style={{ color: "var(--green)" }}>
          {expanded ? (
            <>Show less
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                style={{ transform: "rotate(180deg)" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          ) : (
            <>
              {gapData
                ? `${hidden} more insight${hidden !== 1 ? "s" : ""} — including your personalized rate savings`
                : `${hidden} more insight${hidden !== 1 ? "s" : ""}`}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
