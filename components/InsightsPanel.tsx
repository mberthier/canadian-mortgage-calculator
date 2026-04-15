"use client";

import React from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

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
}

// ── Broker-grade insight logic ────────────────────────────────────────────────

function getInsights(inputs: MortgageInputs, outputs: MortgageOutputs): Insight[] {
  const ins: Insight[] = [];
  const mode = inputs.mortgageMode;

  // ── PURCHASE ─────────────────────────────────────────────────────────────
  if (mode === "purchase") {
    const down  = inputs.downPaymentPercent;
    const price = inputs.homePrice;
    if (!price) return [];

    // 1. CMHC, the real cost is interest on the premium, not just the premium
    if (down < 20 && outputs.cmhcPremium > 0) {
      const r   = inputs.interestRate / 100;
      // rough total cost of carrying the CMHC premium over full amortization
      const pmt = calculateMortgagePayment(outputs.cmhcPremium, inputs.interestRate, inputs.amortizationYears, "monthly");
      const totalCmhcCost = Math.round(pmt * 12 * inputs.amortizationYears);
      ins.push({
        type: "caution", priority: 1,
        headline: `CMHC will cost you ${formatCurrency(totalCmhcCost, 0, true)} over ${inputs.amortizationYears} years`,
        detail: `The ${formatCurrency(outputs.cmhcPremium, 0)} premium gets added to your mortgage and you pay interest on it for the full amortization. The premium itself is ${formatCurrency(outputs.cmhcPremium, 0)}, but with interest, the real cost is closer to ${formatCurrency(totalCmhcCost, 0, true)}.`,
      });
    }

    // 2. Very close to 20%, specific, actionable
    if (down >= 15 && down < 20 && price > 0) {
      const needed = Math.ceil(price * 0.20) - inputs.downPayment;
      const saving = outputs.periodicPayment - outputs.paymentWithoutCMHC;
      ins.push({
        type: "opportunity", priority: 1,
        headline: `${formatCurrency(needed, 0)} more gets you to 20%, eliminates CMHC entirely`,
        detail: `At 20% down, you avoid the ${formatCurrency(outputs.cmhcPremium, 0)} CMHC premium entirely. Your payment drops ${formatCurrency(saving, 2)}/period and you save the full cost of carrying that insurance. Worth considering before you finalize the purchase.`,
      });
    }

    // 3. Stress test purchasing power gap
    if (price > 0 && inputs.interestRate > 0) {
      const stressRate   = outputs.stressTestRate;
      const qualifyingPmt = calculateMortgagePayment(outputs.loanAmount, stressRate, inputs.amortizationYears, "monthly");
      const actualPmt     = calculateMortgagePayment(outputs.loanAmount, inputs.interestRate, inputs.amortizationYears, "monthly");
      const gap = Math.round(qualifyingPmt - actualPmt);
      if (gap > 50) {
        ins.push({
          type: "info", priority: 2,
          headline: `Your lender qualifies you at ${stressRate.toFixed(2)}%, not ${inputs.interestRate.toFixed(2)}%`,
          detail: `The mortgage stress test adds ${formatCurrency(gap, 0)}/month to your qualifying payment. Lenders use this rate to make sure you can handle rate increases at renewal. It also sets your maximum purchase price, roughly ${Math.round((inputs.interestRate / stressRate) * 100 - 100)}% less than if you qualified at your contract rate.`,
        });
      }
    }

    // 4. Amortization length, total interest cost framed clearly
    if (price > 0 && outputs.totalInterest > 0) {
      const interestPct = ((outputs.totalInterest / price) * 100).toFixed(0);
      ins.push({
        type: "info", priority: 4,
        headline: `You'll pay ${interestPct}% of the home's value in interest`,
        detail: `Over ${inputs.amortizationYears} years at ${inputs.interestRate}%, total interest is ${formatCurrency(outputs.totalInterest, 0, true)}. Accelerated payments or a shorter amortization makes the biggest dent early, every dollar of extra principal in year one is worth roughly ${(inputs.amortizationYears / 2).toFixed(0)}× what it's worth in year ${inputs.amortizationYears}.`,
      });
    }

    // 5. High leverage warning
    if (down < 10 && price > 0) {
      ins.push({
        type: "warning", priority: 1,
        headline: `Under 10% down, a small price drop puts you underwater`,
        detail: `With ${down.toFixed(1)}% down, a 5% decline in home value exceeds your equity entirely. You'd owe more than the home is worth. This isn't a reason not to buy, but it matters if your circumstances change and you need to sell within the first few years.`,
      });
    }

    // 6. No CMHC win
    if (down >= 20) {
      ins.push({
        type: "win", priority: 3,
        headline: "20%+ down, no CMHC required",
        detail: `Your full down payment builds equity from day one with no insurance premium. You'll also have access to a wider range of lenders and potentially better rates. At ${down.toFixed(0)}% down, your LTV is ${(100 - down).toFixed(0)}%, well inside the uninsured threshold.`,
      });
    }

    // 6b. Insurable insight
    if (down >= 20 && price <= 1_500_000 && inputs.amortizationYears <= 25) {
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage qualifies as insurable",
        detail: `With ${down.toFixed(0)}% down, a purchase price under $1.5M, and a 25-year amortization, lenders can still pool-insure this mortgage even without a CMHC premium. Ask your broker specifically for insurable pricing. You may get rates close to what insured buyers see, despite paying no insurance premium.`,
      });
    }

    // 6c. Uninsurable insight
    if (price > 1_500_000 || inputs.amortizationYears > 25) {
      const reason = price > 1_500_000
        ? "purchases over $1.5M"
        : "a 30-year amortization";
      ins.push({
        type: "info", priority: 4,
        headline: "Your mortgage is uninsurable. Shopping around matters more here.",
        detail: `Mortgages on ${reason} cannot be insured. This is conventional pricing, typically 0.10 to 0.25% higher than insurable mortgages. At this tier, the spread between lenders is wider. Working with a broker who can access multiple lenders will save you more than on a standard insured purchase.`,
      });
    }

    // 7. First-time buyer rebate
    if (inputs.isFirstTimeBuyer && outputs.ltt.firstTimeBuyerRebate > 0) {
      ins.push({
        type: "win", priority: 3,
        headline: `First-time buyer LTT rebate saves ${formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)} at closing`,
        detail: "Applied automatically at closing, no separate application required in most provinces. Make sure your lawyer knows you're a first-time buyer so it's captured correctly.",
      });
    }

    // 8. Accelerated payments opportunity (only if monthly)
    if (inputs.paymentFrequency === "monthly" && outputs.loanAmount > 0) {
      const bwPmt    = outputs.periodicPayment / 2;
      const mr       = Math.pow(1 + inputs.interestRate / 100 / 2, 2 / 12) - 1;
      const n        = mr > 0 ? Math.log(bwPmt / (bwPmt - outputs.loanAmount * mr / 2)) / Math.log(1 + mr / 2) : 0;
      const bwYears  = n > 0 ? n / 26 : 0;
      const yrsSaved = inputs.amortizationYears - bwYears;
      if (yrsSaved > 0.5) {
        const saved = Math.max(0, Math.round(
          outputs.periodicPayment * 12 * inputs.amortizationYears - bwPmt * 26 * bwYears
        ));
        ins.push({
          type: "opportunity", priority: 3,
          headline: `Accelerated bi-weekly saves ${formatCurrency(saved, 0, true)}, for free`,
          detail: `Switching from monthly to accelerated bi-weekly costs nothing extra per payment, you pay half your monthly amount every two weeks. But because there are 26 bi-weekly periods in a year (not 24), you make one extra monthly payment per year. That alone saves ${formatCurrency(saved, 0, true)} in interest and pays off the mortgage ${yrsSaved.toFixed(1)} years early.`,
        });
      }
    }

    // 9. Extra payment win
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
          detail: "Extra payments reduce your principal directly, which eliminates future interest on that amount. The earlier in your amortization you make them, the more interest they eliminate because every dollar of principal you remove today carries interest for the entire remaining term.",
        });
      }
    }

    // 10. Lump sums win
    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 && rem > 0 ? `${yrs}yr ${rem}mo` : yrs > 0 ? `${yrs} years` : `${rem} months`;
      ins.push({
        type: "win", priority: 2,
        headline: `Annual lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${t} off your amortization`,
        detail: "Lump sums applied on your anniversary date reduce the principal that all future interest is calculated on, the leverage is significant. Most mortgages allow 10–20% of the original balance per year without any prepayment penalty.",
      });
    }

    // 11. New build GST
    if (inputs.isNewBuild && outputs.gstHst.net > 0) {
      ins.push({
        type: "info", priority: 4,
        headline: `New build: budget ${formatCurrency(outputs.gstHst.net, 0)} for GST/HST at closing`,
        detail: "After the federal new housing rebate (available for homes under $450K), the remaining GST/HST is due on closing day, not financed into your mortgage. Make sure your lawyer has accounted for this in your closing costs.",
      });
    }
  }

  // ── RENEWAL ──────────────────────────────────────────────────────────────
  if (mode === "renewal") {
    const hasCurrent = outputs.currentPayment > 0;
    const diff       = hasCurrent ? outputs.periodicPayment - outputs.currentPayment : 0;
    const pct        = hasCurrent && outputs.currentPayment > 0
      ? ((diff / outputs.currentPayment) * 100) : 0;

    // 1. Switch lender insight, always the most important renewal insight
    ins.push({
      type: "opportunity", priority: 1,
      headline: "You don't have to stay with your lender, and now you can switch without re-qualifying",
      detail: "Since November 2024, you can switch lenders at renewal without passing the mortgage stress test again. Your existing lender knows this, which is why their first offer is rarely their best. Get at least one competing quote from a broker before you sign anything.",
    });

    // 2. Payment change (only when current rate entered)
    if (hasCurrent) {
      if (diff > 300) {
        ins.push({
          type: "warning", priority: 1,
          headline: `Your payment increases ${formatCurrency(diff, 0)}/period (+${pct.toFixed(0)}%) at renewal`,
          detail: `This is a meaningful payment shock, plan for it now, not the week your term ends. If the increase strains your budget, a longer term locks in predictability. A broker can also show you whether a variable rate or a blend-and-extend option softens the landing.`,
        });
      } else if (diff > 100) {
        ins.push({
          type: "caution", priority: 2,
          headline: `Payment increases ${formatCurrency(diff, 0)}/period at renewal (+${pct.toFixed(0)}%)`,
          detail: "Manageable, but worth stress-testing your budget at this new level before renewal day. Consider whether keeping any extra cash flow in a FHSA, RRSP, or TFSA outperforms making lump sum prepayments at your new rate.",
        });
      } else if (diff < -100) {
        ins.push({
          type: "win", priority: 1,
          headline: `Payment drops ${formatCurrency(Math.abs(diff), 0)}/period at renewal`,
          detail: `Rates have moved in your favour. One of the smartest things you can do: keep your payment the same as before. That extra amount goes entirely to principal, you'll pay off your mortgage years faster and save thousands in interest with zero change to your monthly outflow.`,
        });
      } else {
        ins.push({
          type: "win", priority: 2,
          headline: "Payment barely changes at renewal, stable ground",
          detail: (() => {
          const extra100 = inputs.currentBalance > 0 && inputs.interestRate > 0
            ? Math.round(100 * 12 * (inputs.renewalAmortization || inputs.amortizationYears) * 0.35)
            : 2000;
          return `Your new rate is close to your expiring rate. This is a good moment to increase your payment slightly to accelerate paydown. Adding just $100/period saves approximately ${formatCurrency(extra100, 0, true)} in interest over the remaining amortization.`;
        })(),
        });
      }
    } else {
      ins.push({
        type: "info", priority: 2,
        headline: "Enter your current rate to see your payment change",
        detail: "Add your expiring contracted rate above, we'll show you exactly how much your payment goes up or down at renewal and what that means for your budget.",
      });
    }

    // 3. Amortization shortening opportunity
    const remainingAmort = inputs.renewalAmortization || inputs.amortizationYears;
    if (remainingAmort > 20 && inputs.currentBalance > 0) {
      const shorterPmt = calculateMortgagePayment(
        inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency
      );
      const extraPerPeriod = Math.round(shorterPmt - outputs.periodicPayment);
      if (extraPerPeriod > 0 && extraPerPeriod < 500) {
        // Calculate interest saved
        const longSched  = outputs.totalInterest;
        const shortPmt20 = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, "monthly");
        // rough total interest at 20yr
        const mr = Math.pow(1 + inputs.interestRate / 100 / 2, 2 / 12) - 1;
        const n20 = 20 * 12;
        const totalShort = shortPmt20 * n20;
        const totalLoan  = inputs.currentBalance;
        const intShort   = Math.round(totalShort - totalLoan);
        const intSaved   = Math.max(0, Math.round(longSched - intShort));
        if (intSaved > 5000) {
          ins.push({
            type: "opportunity", priority: 2,
            headline: `Shortening to 20 years costs only ${formatCurrency(extraPerPeriod, 0)}/period more`,
            detail: `Renewal is the ideal moment to shorten your amortization, you avoid breaking any existing contract. Paying ${formatCurrency(extraPerPeriod, 0)} more per period saves approximately ${formatCurrency(intSaved, 0, true)} in total interest charges. You're essentially buying years of financial freedom.`,
          });
        }
      }
    }

    // 4. Lump sum at renewal, best timing
    if (inputs.currentBalance > 0) {
      ins.push({
        type: "opportunity", priority: 3,
        headline: "Right before renewal is the best time for a lump sum payment",
        detail: "Most mortgages allow a 10–20% lump sum on each anniversary. Your renewal date is your final opportunity to apply a prepayment under the old term, it reduces the balance your entire new rate gets applied to. Even $5,000–$10,000 can meaningfully reduce the interest you pay over the new term.",
      });
    }

    // 5. Extra/lump sum wins if already entered
    if (outputs.interestSavedByLumpSums > 0) {
      const mo  = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const t   = yrs > 0 ? `${yrs}yr${rem > 0 ? ` ${rem}mo` : ""}` : `${rem}mo`;
      ins.push({
        type: "win", priority: 2,
        headline: `Your lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)}, ${t} off your amortization`,
        detail: "Every dollar of lump sum applied at renewal works harder than a dollar applied mid-term, because it reduces the principal that your new rate is charged on from day one of the new contract.",
      });
    }
  }

  // ── REFINANCE ────────────────────────────────────────────────────────────
  if (mode === "refinance") {
    const equity    = Math.max(0, inputs.homeValue - inputs.currentBalance);
    const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
    const ltv       = inputs.homeValue > 0 ? inputs.currentBalance / inputs.homeValue : 0;

    // 1. Break penalty, must compute before deciding if refinance makes sense
    if (inputs.currentBalance > 0 && inputs.currentRate > 0) {
      const remainingMo = Math.round(inputs.termYears * 12 * 0.6); // rough estimate
      const threeMonthInt = Math.round(inputs.currentBalance * (inputs.currentRate / 100) / 12 * 3);
      ins.push({
        type: "caution", priority: 1,
        headline: `Factor in your break penalty before deciding`,
        detail: `Breaking a fixed mortgage typically costs the greater of 3-months' interest (≈${formatCurrency(threeMonthInt, 0)}) or the IRD, which can be much larger if your rate is significantly above current rates. Use our break penalty calculator to get a precise number before committing to a refinance.`,
      });
    }

    // 2. LTV warnings
    if (ltv > 0.80) {
      ins.push({
        type: "warning", priority: 1,
        headline: `LTV of ${(ltv * 100).toFixed(1)}% is above the 80% refinance cap`,
        detail: "Canadian refinances are capped at 80% loan-to-value. You'd need to reduce the loan amount, wait for your home value to rise, or pay down more principal before refinancing is available to you.",
      });
    } else if (ltv > 0.75) {
      ins.push({
        type: "caution", priority: 2,
        headline: `LTV at ${(ltv * 100).toFixed(1)}%, close to the 80% cap`,
        detail: "You're near the refinance ceiling. Adding significant cash-out could push you over the limit. Model your cash-out amount carefully, or consider whether a HELOC (up to 65% LTV) gives you the flexibility you need without a full refinance.",
      });
    }

    // 3. Amortization extension cost, critical for informed decision
    if (inputs.amortizationYears > 20 && inputs.currentBalance > 0) {
      const shortPmt = calculateMortgagePayment(inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency);
      const saving   = Math.round(outputs.periodicPayment - shortPmt); // negative = longer is cheaper
      if (saving < -50) {
        // user chose longer amortization
        const extraInterest = Math.abs(saving) * 12 * (inputs.amortizationYears - 20);
        ins.push({
          type: "caution", priority: 2,
          headline: `Extending to ${inputs.amortizationYears} years saves ${formatCurrency(Math.abs(saving), 0)}/period but costs ~${formatCurrency(extraInterest, 0, true)} more in interest`,
          detail: `Resetting to a longer amortization reduces your immediate cash pressure, but every extra year adds significant total interest cost. It's often worth keeping the amortization as short as your cash flow allows. You can always adjust it again at renewal.`,
        });
      }
    }

    // 4. Strong equity position
    if (equityPct >= 35) {
      ins.push({
        type: "win", priority: 2,
        headline: `Strong equity at ${equityPct.toFixed(0)}%, you have negotiating power`,
        detail: `With ${formatCurrency(equity, 0, true)} in equity, you're a low-risk borrower. Lenders compete for this profile. Get at least 2-3 quotes before settling on terms, a broker can often get you meaningfully better rate or terms than going direct to your current lender.`,
      });
    }

    // 5. Cash-out framing
    if (inputs.cashOutAmount > 0) {
      const cashCostPerYear = Math.round(inputs.cashOutAmount * (inputs.interestRate / 100));
      ins.push({
        type: "info", priority: 3,
        headline: `Your ${formatCurrency(inputs.cashOutAmount, 0)} cash-out costs ~${formatCurrency(cashCostPerYear, 0)}/year in interest`,
        detail: `Cash-out at mortgage rates is among the cheapest money available, typically 3–5%, vs credit cards at 20%+. The key question is whether the use of the funds (renovation ROI, investment return, debt elimination) justifies the ongoing interest cost. If consolidating debt, the math works only if the behaviour changes too.`,
      });
    }

    // 6. No CMHC win
    if (ltv <= 0.80 && inputs.homeValue > 0) {
      ins.push({
        type: "win", priority: 4,
        headline: "No CMHC required on this refinance",
        detail: "Refinancing at 80% LTV or below is uninsured, no CMHC premium added to your balance.",
      });
    }
  }

  // Sort: priority ascending, then type weight within same priority
  const w: Record<InsightType, number> = { warning: 0, caution: 1, opportunity: 2, win: 3, info: 4 };
  ins.sort((a, b) => a.priority !== b.priority
    ? a.priority - b.priority
    : w[a.type] - w[b.type]
  );

  return ins;
}

// ── Badge config ──────────────────────────────────────────────────────────────
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


// ── Component ─────────────────────────────────────────────────────────────────
export default function InsightsPanel({ inputs, outputs }: Props) {
  const all = getInsights(inputs, outputs);
  if (all.length === 0) return null;

  const primary      = all[0];
  const secondaries  = all.slice(1);
  const primaryBadge = BADGES[primary.type];

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

      {/* Primary insight */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-1 shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
            style={{ background: primaryBadge.bg, borderColor: primaryBadge.border, color: primaryBadge.text }}>
            {primaryBadge.icon}
            {primaryBadge.label}
          </span>
          <div>
            <p className="text-sm font-semibold leading-snug text-neutral-900">{primary.headline}</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--ink-muted)" }}>{primary.detail}</p>
            {primary.link && (
              <Link href={primary.link.href}
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium"
                style={{ color: "var(--green)" }}>
                {primary.link.label}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Secondary insights — all shown */}
      {secondaries.length > 0 && (
        <>
          <div className="border-t border-neutral-50 mx-5" />
          <div className="px-5 py-3">
            <p className="text-xs font-medium mb-2.5" style={{ color: "var(--ink-faint)" }}>
              Also worth knowing
            </p>
            <div className="space-y-3">
              {secondaries.map((ins, i) => {
                const b = BADGES[ins.type];
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="inline-flex items-center gap-1 shrink-0 mt-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold border"
                      style={{ background: b.bg, borderColor: b.border, color: b.text, fontSize: "10px" }}>
                      {b.icon}
                      {b.label}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 leading-snug">{ins.headline}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--ink-muted)" }}>{ins.detail}</p>
                      {ins.link && (
                        <Link href={ins.link.href}
                          className="inline-flex items-center gap-1 mt-1 text-xs font-medium"
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
          </div>
        </>
      )}
    </div>
  );
}
