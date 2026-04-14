"use client";

import React from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

interface Props {
  inputs: MortgageInputs;
  outputs: MortgageOutputs;
}

// Priority: 1 = most important (shown first)
type InsightType = "win" | "opportunity" | "warning" | "caution" | "info";

interface Insight {
  type:     InsightType;
  priority: number;
  headline: string;
  detail:   string;
}

function getInsights(inputs: MortgageInputs, outputs: MortgageOutputs): Insight[] {
  const insights: Insight[] = [];
  const mode  = inputs.mortgageMode;

  // ── Purchase ──────────────────────────────────────────────────────────────
  if (mode === "purchase") {
    const down  = inputs.downPaymentPercent;
    const price = inputs.homePrice;

    // High-risk: very low down payment
    if (down < 10 && price > 0) {
      insights.push({
        type: "warning", priority: 1,
        headline: "High leverage — limited equity buffer",
        detail: `With ${down.toFixed(1)}% down, a 5% drop in home value would put you underwater. Consider whether the timing is right or if saving more first reduces your risk.`,
      });
    }

    // CMHC applies — big cost
    if (down < 20 && outputs.cmhcPremium > 0) {
      insights.push({
        type: "caution", priority: 2,
        headline: `CMHC adds ${formatCurrency(outputs.cmhcPremium, 0)} to your mortgage`,
        detail: `You'll pay interest on this amount for the full ${inputs.amortizationYears}-year amortization — not just the premium itself. You can avoid it entirely at 20% down.`,
      });
    }

    // Approaching 20% — actionable opportunity
    if (down >= 15 && down < 20 && price > 0) {
      const needed = Math.ceil(price * 0.20) - inputs.downPayment;
      const saving = outputs.periodicPayment - outputs.paymentWithoutCMHC;
      insights.push({
        type: "opportunity", priority: 2,
        headline: `${formatCurrency(needed, 0)} more eliminates CMHC entirely`,
        detail: `Reaching 20% down removes the ${formatCurrency(outputs.cmhcPremium, 0)} CMHC premium and saves ${formatCurrency(saving, 2)}/payment — every payment, for the full amortization.`,
      });
    }

    // No CMHC — win
    if (down >= 20) {
      insights.push({
        type: "win", priority: 3,
        headline: "No CMHC insurance required",
        detail: "Your 20%+ down payment means your full contribution goes to equity, not insurance. Lenders and insurers both give you better terms at this threshold.",
      });
    }

    // First-time buyer LTT rebate
    if (inputs.isFirstTimeBuyer && outputs.ltt.firstTimeBuyerRebate > 0) {
      insights.push({
        type: "win", priority: 3,
        headline: `First-time buyer saves ${formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)} on LTT`,
        detail: "The first-time buyer land transfer tax rebate is applied automatically at closing — no separate application needed in most provinces.",
      });
    }

    // Accelerated payments opportunity
    if (inputs.paymentFrequency === "monthly" && outputs.amortizationSchedule.length > 0) {
      const bwPayment = outputs.periodicPayment / 2;
      const mr = Math.pow(1 + inputs.interestRate / 100 / 2, 2 / 12) - 1;
      const n = Math.log(bwPayment / (bwPayment - outputs.loanAmount * mr / 2)) / Math.log(1 + mr / 2);
      const bwYears = Math.max(0, n / 26);
      const yrsSaved = inputs.amortizationYears - bwYears;
      if (yrsSaved > 1) {
        const saved = Math.max(0,
          outputs.periodicPayment * 12 * inputs.amortizationYears -
          bwPayment * 26 * bwYears
        );
        insights.push({
          type: "opportunity", priority: 4,
          headline: `Accelerated bi-weekly saves ${formatCurrency(saved, 0, true)} in interest`,
          detail: `Switching from monthly to accelerated bi-weekly adds one extra payment per year — same per-payment amount, but you'd pay off your mortgage ${yrsSaved.toFixed(1)} years early.`,
        });
      }
    }

    // Extra payment win
    if (inputs.extraPayment > 0 && outputs.amortizationSchedule.length > 0) {
      const baseLen  = inputs.amortizationYears * 12;
      const actualLen = outputs.amortizationSchedule.length;
      const moSaved  = Math.max(0, baseLen - actualLen);
      const yrS = Math.floor(moSaved / 12), moS = moSaved % 12;
      const timeStr = [yrS > 0 ? `${yrS}yr` : "", moS > 0 ? `${moS}mo` : ""].filter(Boolean).join(" ");
      if (moSaved > 0) {
        insights.push({
          type: "win", priority: 3,
          headline: `Extra payments cut ${timeStr} off your amortization`,
          detail: `Your ${formatCurrency(inputs.extraPayment, 0)}/payment top-up accelerates principal paydown significantly. The compounding effect grows the further into the amortization you go.`,
        });
      }
    }

    // Lump sum win
    const totalLumps = Object.values(inputs.lumpSumsByYear).reduce((s, v) => s + (v || 0), 0);
    if (totalLumps > 0 && outputs.interestSavedByLumpSums > 0) {
      const mo = outputs.paymentsSavedByLumpSums;
      const yrs = Math.floor(mo / 12), rem = mo % 12;
      const timeStr = yrs > 0 && rem > 0 ? `${yrs}yr ${rem}mo` : yrs > 0 ? `${yrs} years` : `${rem} months`;
      insights.push({
        type: "win", priority: 3,
        headline: `Lump sums save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest`,
        detail: `Your annual prepayments cut ${timeStr} off the amortization. Most mortgages allow 10–20% of the original principal per year without penalty.`,
      });
    }

    // New build GST
    if (inputs.isNewBuild && outputs.gstHst.net > 0) {
      insights.push({
        type: "info", priority: 5,
        headline: `New build: ${formatCurrency(outputs.gstHst.net, 0)} GST/HST due at closing`,
        detail: "After the federal new housing rebate (for homes under $450K), the remaining GST/HST is payable on closing day — budget for this in your upfront cash.",
      });
    }

    // High total interest relative to purchase price
    if (outputs.totalInterest > price * 0.5 && price > 0 && inputs.amortizationYears >= 25) {
      insights.push({
        type: "info", priority: 5,
        headline: "You'll pay more in interest than half the home's value",
        detail: `Over ${inputs.amortizationYears} years at ${inputs.interestRate}%, total interest is ${formatCurrency(outputs.totalInterest, 0, true)}. Increasing payments or choosing a shorter amortization can dramatically reduce this.`,
      });
    }
  }

  // ── Renewal ───────────────────────────────────────────────────────────────
  if (mode === "renewal") {
    const diff = outputs.periodicPayment - outputs.paymentWithoutCMHC;
    const pct  = outputs.paymentWithoutCMHC > 0 ? (diff / outputs.paymentWithoutCMHC) * 100 : 0;

    if (diff > 300) {
      insights.push({
        type: "warning", priority: 1,
        headline: `Payment jumps ${formatCurrency(diff, 0)}/month (+${pct.toFixed(0)}%)`,
        detail: "This is a significant payment shock. Build this into your budget now — consider locking in for a longer term if rates are expected to stay elevated.",
      });
    } else if (diff > 100) {
      insights.push({
        type: "caution", priority: 2,
        headline: `Payment increases ${formatCurrency(diff, 0)}/month at renewal`,
        detail: `A ${pct.toFixed(0)}% increase is manageable but worth planning for. Stress-test your budget at this new level before renewal day.`,
      });
    } else if (diff < -100) {
      insights.push({
        type: "win", priority: 1,
        headline: `Payment drops ${formatCurrency(Math.abs(diff), 0)}/month at renewal`,
        detail: "With a lower rate, consider keeping your payment the same as before — the extra amount goes straight to principal and saves significant interest.",
      });
    }

    if (inputs.amortizationYears > 20) {
      const shorterPmt = calculateMortgagePayment(
        inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency
      );
      insights.push({
        type: "opportunity", priority: 3,
        headline: `Shortening to 20yr amortization costs ${formatCurrency(shorterPmt - outputs.periodicPayment, 0)}/payment more`,
        detail: "But significantly reduces total interest paid. Renewal is the optimal moment to reset your amortization to a shorter timeline.",
      });
    }
  }

  // ── Refinance ─────────────────────────────────────────────────────────────
  if (mode === "refinance") {
    const equity    = Math.max(0, inputs.homeValue - inputs.currentBalance);
    const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
    const ltv       = inputs.homeValue > 0 ? inputs.currentBalance / inputs.homeValue : 0;

    if (ltv > 0.80) {
      insights.push({
        type: "warning", priority: 1,
        headline: `LTV of ${(ltv * 100).toFixed(1)}% exceeds the 80% refinance cap`,
        detail: "You'd need to reduce the loan amount, wait for home values to rise, or pay down more principal before refinancing is available.",
      });
    } else if (ltv > 0.75) {
      insights.push({
        type: "caution", priority: 2,
        headline: `LTV at ${(ltv * 100).toFixed(1)}% — close to the 80% cap`,
        detail: "Adding significant cash-out could push you over the limit. Model the cash-out amount carefully against the 80% ceiling.",
      });
    }

    if (equityPct >= 35) {
      insights.push({
        type: "win", priority: 2,
        headline: `Strong equity at ${equityPct.toFixed(0)}% — you have options`,
        detail: "With this equity position, refinancing, cash-out, and debt consolidation are all on the table. Shop multiple lenders — your LTV gives you negotiating power.",
      });
    }

    if (outputs.cmhcPremium === 0 && ltv <= 0.80) {
      insights.push({
        type: "win", priority: 3,
        headline: "No CMHC insurance required on this refinance",
        detail: "Refinancing at 80% LTV or below is uninsured — no premium added to your balance.",
      });
    }
  }

  // Sort by priority (1 = first), then by type weight within same priority
  const typeWeight: Record<InsightType, number> = { warning: 0, caution: 1, win: 2, opportunity: 3, info: 4 };
  insights.sort((a, b) => a.priority !== b.priority
    ? a.priority - b.priority
    : typeWeight[a.type] - typeWeight[b.type]
  );

  return insights.slice(0, 5);
}

// ── Badge designs for each type ──────────────────────────────────────────────
const BADGES: Record<InsightType, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  win: {
    bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d",
    label: "Win",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 21h8M12 17v4M5 3h14l-2 7H7L5 3z" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  opportunity: {
    bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8",
    label: "Opportunity",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  warning: {
    bg: "#fef2f2", border: "#fecaca", text: "#b91c1c",
    label: "Warning",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.3 3.6L2 20h20L13.7 3.6a2 2 0 00-3.4 0z" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 10v4M12 17v.5" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  caution: {
    bg: "#fffbeb", border: "#fde68a", text: "#92400e",
    label: "Caution",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#92400e" strokeWidth="2"/>
        <path d="M12 8v4M12 15v.5" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    bg: "#fafafa", border: "#e5e5e5", text: "#555555",
    label: "Note",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="2"/>
        <path d="M12 11v6M12 8v.5" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

export default function InsightsPanel({ inputs, outputs }: Props) {
  const insights = getInsights(inputs, outputs);
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17H8v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z"
              stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>
            Insights
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--green-light)", color: "var(--green)" }}>
          {insights.length}
        </span>
      </div>

      {/* Insight rows */}
      <div className="divide-y divide-neutral-50">
        {insights.map((insight, i) => {
          const badge = BADGES[insight.type];
          return (
            <div key={i} className="px-5 py-4 flex items-start gap-3">
              {/* Type badge */}
              <span className="inline-flex items-center gap-1 shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
                style={{ background: badge.bg, borderColor: badge.border, color: badge.text }}>
                {badge.icon}
                {badge.label}
              </span>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug text-neutral-800">
                  {insight.headline}
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {insight.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
