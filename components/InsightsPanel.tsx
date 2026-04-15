"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

type InsightType = "win" | "opportunity" | "warning" | "caution" | "info";

interface Insight {
  type:     InsightType;
  priority: number;   // 1=must see · 2=high value · 3=good to know · 4=context
  headline: string;
  detail:   string;
  link?:    { href: string; label: string };
}

// ── Priority framework ────────────────────────────────────────────────────────
// P1 — changes the decision or could cost money if missed
// P2 — high-value and actionable, worth acting on
// P3 — confirms good position or moderate opportunity
// P4 — informational context, no immediate action needed

function getInsights(inputs: MortgageInputs, outputs: MortgageOutputs): Insight[] {
  const ins: Insight[] = [];
  const mode = inputs.mortgageMode;

  // ── PURCHASE ──────────────────────────────────────────────────────────────
  if (mode === "purchase") {
    const down  = inputs.downPaymentPercent;
    const price = inputs.homePrice;
    if (!price) return [];

    // P1 — High leverage warning (under 10%)
    if (down < 10 && price > 0) {
      ins.push({
        type: "warning", priority: 1,
        headline: `Under 10% down — a 5% price drop would put you underwater`,
        detail: `With ${down.toFixed(1)}% down, a 5% decline in home value wipes out your entire equity position. You would owe more than the home is worth. This is not a reason not to buy, but it matters if your circumstances change and you need to sell within the first few years.`,
      });
    }

    // P1 — CMHC real cost (interest on premium, not just the premium)
    if (down < 20 && outputs.cmhcPremium > 0) {
      const pmt          = calculateMortgagePayment(outputs.cmhcPremium, inputs.interestRate, inputs.amortizationYears, "monthly");
      const totalCmhcCost = Math.round(pmt * 12 * inputs.amortizationYears);
      ins.push({
        type: "caution", priority: 1,
        headline: `CMHC adds ${formatCurrency(outputs.cmhcPremium, 0)} to your mortgage — the true cost with interest is ${formatCurrency(totalCmhcCost, 0, true)}`,
        detail: `The ${formatCurrency(outputs.cmhcPremium, 0)} premium is rolled into your mortgage balance, so you pay interest on it for the full ${inputs.amortizationYears}-year amortization. The premium itself is one number — the total cost you actually pay is ${formatCurrency(totalCmhcCost, 0, true)}.`,
      });
    }

    // P1 — Close to 20%, specific dollar to eliminate CMHC
    if (down >= 15 && down < 20 && price > 0) {
      const needed = Math.ceil(price * 0.20) - inputs.downPayment;
      const saving = outputs.periodicPayment - outputs.paymentWithoutCMHC;
      ins.push({
        type: "opportunity", priority: 1,
        headline: `${formatCurrency(needed, 0)} more reaches 20% down and eliminates CMHC entirely`,
        detail: `At 20% down you avoid the ${formatCurrency(outputs.cmhcPremium, 0)} CMHC premium completely. Your payment drops ${formatCurrency(saving, 2)}/period and you save the full interest cost of carrying that insurance over ${inputs.amortizationYears} years. Worth considering before you finalize the purchase.`,
      });
    }

    // P2 — Accelerated bi-weekly (only if monthly selected — free savings)
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
          headline: `Switching to accelerated bi-weekly saves ${formatCurrency(saved, 0, true)} in interest — at no extra cost`,
          detail: `You pay half your monthly amount every two weeks instead of once a month. Because there are 26 bi-weekly periods in a year (not 24), you make one extra full payment per year. That alone saves ${formatCurrency(saved, 0, true)} in interest charges and pays off your mortgage ${yrsSaved.toFixed(1)} years early.`,
        });
      }
    }

    // P2 — Stress test gap
    if (price > 0 && inputs.interestRate > 0) {
      const stressRate    = outputs.stressTestRate;
      const qualifyingPmt = calculateMortgagePayment(outputs.loanAmount, stressRate, inputs.amortizationYears, "monthly");
      const actualPmt     = calculateMortgagePayment(outputs.loanAmount, inputs.interestRate, inputs.amortizationYears, "monthly");
      const gap = Math.round(qualifyingPmt - actualPmt);
      if (gap > 50) {
        ins.push({
          type: "info", priority: 2,
          headline: `Your lender qualifies you at ${stressRate.toFixed(2)}%, not ${inputs.interestRate.toFixed(2)}%`,
          detail: `The mortgage stress test adds ${formatCurrency(gap, 0)}/month to your qualifying payment. Lenders use this to confirm you can handle rate increases at renewal. It also caps your maximum purchase price — roughly ${Math.round((1 - inputs.interestRate / stressRate) * 100)}% lower than if you qualified at your contract rate.`,
        });
      }
    }

    // P2 — Lump sum wins (if entered)
    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 && rem > 0 ? `${yrs}yr ${rem}mo` : yrs > 0 ? `${yrs} years` : `${rem} months`;
      ins.push({
        type: "win", priority: 2,
        headline: `Annual lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${t} off your amortization`,
        detail: `Lump sums applied on your anniversary date reduce the principal that all future interest is calculated on. Most mortgages allow 10 to 20% of the original balance per year without any prepayment penalty.`,
      });
    }

    // P3 — Extra payment win (if entered)
    if (inputs.extraPayment > 0 && outputs.paymentsSavedByLumpSums === 0) {
      const baseLen   = inputs.amortizationYears * 12;
      const actualLen = outputs.amortizationSchedule.length;
      const moSaved   = Math.max(0, baseLen - actualLen);
      if (moSaved > 0) {
        const yrS = Math.floor(moSaved / 12), moS = moSaved % 12;
        const t   = [yrS > 0 ? `${yrS} yr` : "", moS > 0 ? `${moS} mo` : ""].filter(Boolean).join(" ");
        ins.push({
          type: "win", priority: 3,
          headline: `Extra ${formatCurrency(inputs.extraPayment, 0)}/payment cuts ${t} off your amortization`,
          detail: `Extra payments reduce your principal directly, eliminating future interest on that amount. Every dollar of extra principal in year one saves more than a dollar in year ${inputs.amortizationYears} because it compounds over the remaining term.`,
        });
      }
    }

    // P3 — No CMHC win
    if (down >= 20) {
      ins.push({
        type: "win", priority: 3,
        headline: "20% or more down — no CMHC required",
        detail: `Your full down payment builds equity from day one with no insurance premium. You'll also have access to a wider range of lenders and potentially better rates. At ${down.toFixed(0)}% down, your LTV is ${(100 - down).toFixed(0)}%, well inside the uninsured threshold.`,
      });
    }

    // P3 — First-time buyer LTT rebate
    if (inputs.isFirstTimeBuyer && outputs.ltt.firstTimeBuyerRebate > 0) {
      ins.push({
        type: "win", priority: 3,
        headline: `First-time buyer LTT rebate saves ${formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)} at closing`,
        detail: `Applied automatically at closing in most provinces — no separate application required. Make sure your lawyer knows you're a first-time buyer so it's captured correctly on your statement of adjustments.`,
      });
    }

    // P4 — Total interest as % of price
    if (price > 0 && outputs.totalInterest > 0) {
      const pct = ((outputs.totalInterest / price) * 100).toFixed(0);
      ins.push({
        type: "info", priority: 4,
        headline: `You'll pay ${pct}% of the home's purchase price in interest charges`,
        detail: `Over ${inputs.amortizationYears} years at ${inputs.interestRate}%, total interest is ${formatCurrency(outputs.totalInterest, 0, true)}. The earlier you make extra payments or switch to accelerated bi-weekly, the more you reduce this number.`,
      });
    }

    // P4 — Insurable
    if (down >= 20 && price <= 1_500_000 && inputs.amortizationYears <= 25) {
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage qualifies as insurable — ask your broker about insurable pricing",
        detail: `With ${down.toFixed(0)}% down, a purchase price under $1.5M, and a 25-year amortization, lenders can pool-insure this mortgage even without a CMHC premium. You may get rates close to what insured buyers see, despite paying no insurance premium.`,
      });
    }

    // P4 — Uninsurable
    if (price > 1_500_000 || inputs.amortizationYears > 25) {
      const reason = price > 1_500_000 ? "purchases over $1.5M" : "a 30-year amortization";
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage is uninsurable — broker shopping matters more at this tier",
        detail: `Mortgages on ${reason} cannot be insured. Conventional pricing is typically 0.10 to 0.25% higher than insurable mortgages, and the spread between lenders is wider. Working with a broker who accesses multiple lenders will have a bigger impact here than on a standard insured purchase.`,
      });
    }

    // P4 — New build GST
    if (inputs.isNewBuild && outputs.gstHst.net > 0) {
      ins.push({
        type: "info", priority: 4,
        headline: `New build: ${formatCurrency(outputs.gstHst.net, 0)} in GST/HST is due on closing day`,
        detail: `After the federal new housing rebate (for homes under $450K), the remaining GST/HST is payable at closing — it cannot be financed into your mortgage. Make sure your lawyer has accounted for this in your closing costs.`,
      });
    }
  }

  // ── RENEWAL ───────────────────────────────────────────────────────────────
  if (mode === "renewal") {
    const hasCurrent = outputs.currentPayment > 0;
    const diff       = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
    const pct        = hasCurrent && outputs.currentPayment > 0 ? (diff / outputs.currentPayment) * 100 : 0;

    // P1 — Payment shock (large increase)
    if (hasCurrent && diff > 300) {
      ins.push({
        type: "warning", priority: 1,
        headline: `Payment increases ${formatCurrency(diff, 0)}/period (+${pct.toFixed(0)}%) at renewal`,
        detail: `Plan for this now, not the week your term ends. If this strains your budget, a longer term locks in predictability. A broker can also show you whether a variable rate or a blend-and-extend option softens the increase.`,
      });
    }

    // P1 — Switch lender without re-qualifying (always relevant)
    ins.push({
      type: "opportunity", priority: 1,
      headline: "You can switch lenders at renewal without re-qualifying — your lender's first offer is rarely their best",
      detail: "Since November 2024, switching lenders at renewal no longer requires passing the stress test. Your existing lender knows this, which is why they often send a low-effort renewal offer first. Get at least one competing quote from a broker before you sign anything.",
    });

    // P2 — Moderate payment increase
    if (hasCurrent && diff > 100 && diff <= 300) {
      ins.push({
        type: "caution", priority: 2,
        headline: `Payment increases ${formatCurrency(diff, 0)}/period at renewal (+${pct.toFixed(0)}%)`,
        detail: `Manageable, but worth stress-testing your budget at this new level before renewal day. Also worth asking whether keeping extra cash flow in an FHSA, RRSP, or TFSA outperforms making lump sum prepayments at your new rate.`,
      });
    }

    // P2 — Rate dropped at renewal
    if (hasCurrent && diff < -100) {
      ins.push({
        type: "win", priority: 2,
        headline: `Payment drops ${formatCurrency(Math.abs(diff), 0)}/period at renewal`,
        detail: `Rates have moved in your favour. The smartest move: keep your payment at the old level. That extra amount goes entirely to principal with no change to your monthly outflow, cutting years off your amortization.`,
      });
    }

    // P2 — Amortization shortening opportunity
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
            detail: `Renewal is the best moment to shorten your amortization — you are not breaking any existing contract. Paying ${formatCurrency(extraPerPeriod, 0)} more per period saves ${formatCurrency(intSaved, 0, true)} in total interest charges over the remaining amortization.`,
          });
        }
      }
    }

    // P2 — Lump sum win (if entered)
    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 ? `${yrs}yr${rem > 0 ? ` ${rem}mo` : ""}` : `${rem}mo`;
      ins.push({
        type: "win", priority: 2,
        headline: `Your lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${t} off your amortization`,
        detail: `Every dollar of lump sum applied at renewal works harder than a dollar mid-term, because it reduces the principal your new rate is charged on from day one of the new contract.`,
      });
    }

    // P3 — Stable payment
    if (hasCurrent && Math.abs(diff) <= 100) {
      ins.push({
        type: "win", priority: 3,
        headline: "Payment barely changes at renewal — stable ground",
        detail: (() => {
          const extra = inputs.currentBalance > 0 && inputs.interestRate > 0
            ? Math.round(100 * 12 * (inputs.renewalAmortization || inputs.amortizationYears) * 0.35)
            : 2000;
          return `Your new rate is close to your expiring rate. Consider bumping your payment by $100/period — that saves approximately ${formatCurrency(extra, 0, true)} in interest charges over the remaining amortization.`;
        })(),
      });
    }

    // P3 — Lump sum timing tip (only if none entered yet)
    const hasLumpSums = Object.values(inputs.lumpSumsByYear).some(v => v > 0);
    if (inputs.currentBalance > 0 && !hasLumpSums && outputs.interestSavedByLumpSums === 0) {
      const example = Math.round(inputs.currentBalance * 0.10 / 1000) * 1000;
      const saving  = Math.round(example * (inputs.interestRate / 100) * (remainingAmort) * 0.4);
      ins.push({
        type: "opportunity", priority: 3,
        headline: "Your renewal date is the best moment to make a lump sum payment",
        detail: `A ${formatCurrency(example, 0)} lump sum (10% of your balance) right before renewal could save approximately ${formatCurrency(saving, 0, true)} in interest charges — because it reduces the principal your entire new rate is applied to from day one.`,
      });
    }

    // P4 — No current rate entered
    if (!hasCurrent) {
      ins.push({
        type: "info", priority: 4,
        headline: "Enter your current rate to see your payment change at renewal",
        detail: "Add your expiring contracted rate above and we will show you exactly how much your payment goes up or down, so you can plan before renewal day.",
      });
    }
  }

  // ── REFINANCE ─────────────────────────────────────────────────────────────
  if (mode === "refinance") {
    const equity    = Math.max(0, inputs.homeValue - inputs.currentBalance);
    const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
    const ltv       = inputs.homeValue > 0 ? inputs.currentBalance / inputs.homeValue : 0;

    // P1 — LTV hard stop
    if (ltv > 0.80) {
      ins.push({
        type: "warning", priority: 1,
        headline: `LTV of ${(ltv * 100).toFixed(1)}% exceeds the 80% refinance cap`,
        detail: `Canadian refinances are capped at 80% loan-to-value. You would need to reduce the loan amount, wait for your home value to rise, or pay down more principal before refinancing is available to you.`,
      });
    }

    // P1 — Break penalty (always show if rates are entered)
    if (inputs.currentBalance > 0 && inputs.currentRate > 0) {
      const threeMonthInt = Math.round(inputs.currentBalance * (inputs.currentRate / 100) / 12 * 3);
      ins.push({
        type: "caution", priority: 1,
        headline: "Factor in your break penalty before deciding — it can exceed the interest savings",
        detail: `Breaking a fixed mortgage costs the greater of 3-months interest (approx. ${formatCurrency(threeMonthInt, 0)}) or the IRD. The IRD can be much larger if your contracted rate is significantly above current rates. Get a precise number before committing.`,
        link: { href: "/mortgage-break-penalty", label: "Calculate your break penalty" },
      });
    }

    // P2 — LTV caution (near cap)
    if (ltv > 0.75 && ltv <= 0.80) {
      ins.push({
        type: "caution", priority: 2,
        headline: `LTV at ${(ltv * 100).toFixed(1)}% — close to the 80% refinance cap`,
        detail: `Adding significant cash-out could push you over the 80% limit. Model your cash-out amount carefully, or consider whether a HELOC (up to 65% LTV) gives you flexibility without a full refinance.`,
      });
    }

    // P2 — Amortization extension cost
    if (inputs.amortizationYears > 20 && inputs.currentBalance > 0) {
      const shortPmt = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency);
      const saving   = Math.round(outputs.periodicPayment - shortPmt);
      if (saving < -50) {
        const extraInterest = Math.abs(saving) * 12 * (inputs.amortizationYears - 20);
        ins.push({
          type: "caution", priority: 2,
          headline: `Extending to ${inputs.amortizationYears} years saves ${formatCurrency(Math.abs(saving), 0)}/period but adds ${formatCurrency(extraInterest, 0, true)} in interest`,
          detail: `Resetting to a longer amortization reduces your monthly cash pressure, but every extra year adds significant interest charges. Keep the amortization as short as your cash flow allows — you can always adjust at your next renewal.`,
        });
      }
    }

    // P2 — Strong equity
    if (equityPct >= 35) {
      ins.push({
        type: "win", priority: 2,
        headline: `Strong equity position at ${equityPct.toFixed(0)}% — you have real negotiating power`,
        detail: `With ${formatCurrency(equity, 0, true)} in equity, you are a low-risk borrower and lenders compete for your business. Get at least two or three quotes before settling on terms — a broker can often get you meaningfully better rate or conditions than going direct to your current lender.`,
      });
    }

    // P3 — Cash-out cost
    if (inputs.cashOutAmount > 0) {
      const cashCostPerYear = Math.round(inputs.cashOutAmount * (inputs.interestRate / 100));
      ins.push({
        type: "info", priority: 3,
        headline: `Your ${formatCurrency(inputs.cashOutAmount, 0)} cash-out costs ${formatCurrency(cashCostPerYear, 0)}/year in interest charges`,
        detail: `Mortgage rates are among the cheapest borrowing available — typically well below credit cards or personal loans. The key question is whether the use of funds (renovation ROI, investment return, debt payoff) justifies the ongoing interest. If consolidating debt, the math only works if the behaviour changes too.`,
      });
    }

    // P4 — No CMHC
    if (ltv <= 0.80 && inputs.homeValue > 0) {
      ins.push({
        type: "win", priority: 4,
        headline: "No CMHC required on this refinance",
        detail: `Refinancing at 80% LTV or below is uninsured — no insurance premium added to your balance.`,
      });
    }
  }

  // Sort: P1 first, within same priority by type weight
  const w: Record<InsightType, number> = { warning: 0, caution: 1, opportunity: 2, win: 3, info: 4 };
  ins.sort((a, b) => a.priority !== b.priority
    ? a.priority - b.priority
    : w[a.type] - w[b.type]
  );

  return ins;
}

// ── Badge config ───────────────────────────────────────────────────────────────
const BADGES: Record<InsightType, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  win: {
    bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", label: "Win",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 21h8M12 17v4M5 3h14l-2 7H7L5 3z" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  opportunity: {
    bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", label: "Opportunity",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  warning: {
    bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", label: "Watch out",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.3 3.6L2 20h20L13.7 3.6a2 2 0 00-3.4 0z" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 10v4M12 17v.5" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  caution: {
    bg: "#fffbeb", border: "#fde68a", text: "#92400e", label: "Heads up",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#92400e" strokeWidth="2"/>
        <path d="M12 8v4M12 15v.5" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    bg: "#fafafa", border: "#e5e5e5", text: "#555555", label: "Note",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="2"/>
        <path d="M12 11v6M12 8v.5" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
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

      {/* Insight rows */}
      <div className="divide-y divide-neutral-50">
        {visible.map((ins, i) => {
          const b = BADGES[ins.type];
          return (
            <div key={i} className="px-5 py-4 flex items-start gap-3">
              <span className="inline-flex items-center justify-center gap-1 shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
                style={{ background: b.bg, borderColor: b.border, color: b.text, minWidth: "84px" }}>
                {b.icon}
                {b.label}
              </span>
              <div>
                <p className="text-sm font-semibold leading-snug text-neutral-900">{ins.headline}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-muted)" }}>{ins.detail}</p>
                {ins.link && (
                  <Link href={ins.link.href}
                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium"
                    style={{ color: "var(--green)" }}>
                    {ins.link.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          ) : (
            <>{hidden} more insight{hidden !== 1 ? "s" : ""}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
