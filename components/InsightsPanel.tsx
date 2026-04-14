"use client";

import React from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { calculateMortgagePayment } from "@/lib/mortgageMath";

interface Props {
  inputs: MortgageInputs;
  outputs: MortgageOutputs;
}

interface Insight {
  type: "positive" | "warning" | "info";
  text: string;
}

function getInsights(inputs: MortgageInputs, outputs: MortgageOutputs): Insight[] {
  const insights: Insight[] = [];
  const mode = inputs.mortgageMode;

  // ── Purchase insights ──────────────────────────────────────────────────────
  if (mode === "purchase") {
    const down = inputs.downPaymentPercent;
    const price = inputs.homePrice;

    // CMHC — approaching 20%
    if (down >= 15 && down < 20 && price > 0) {
      const needed = Math.ceil(price * 0.20) - inputs.downPayment;
      const saving = outputs.periodicPayment - outputs.paymentWithoutCMHC;
      insights.push({
        type: "info",
        text: `Adding ${formatCurrency(needed, 0)} more reaches 20% down — removes CMHC and saves ${formatCurrency(saving, 2)}/payment.`,
      });
    }

    // No CMHC
    if (down >= 20) {
      insights.push({ type: "positive", text: "No CMHC insurance required. Your full down payment goes toward equity." });
    }

    // CMHC applies
    if (down < 20 && outputs.cmhcPremium > 0) {
      const yrs = inputs.amortizationYears;
      const totalCmhcInterest = outputs.cmhcPremium * (inputs.interestRate / 100 / 2);
      insights.push({
        type: "warning",
        text: `CMHC adds ${formatCurrency(outputs.cmhcPremium, 0)} to your mortgage. You'll pay interest on that amount for the full ${yrs}-year amortization.`,
      });
    }

    // First-time buyer LTT rebate
    if (inputs.isFirstTimeBuyer && outputs.ltt.firstTimeBuyerRebate > 0) {
      insights.push({
        type: "positive",
        text: `First-time buyer LTT rebate saves you ${formatCurrency(outputs.ltt.firstTimeBuyerRebate, 0)} at closing.`,
      });
    }

    // Accelerated payments
    if (inputs.paymentFrequency === "monthly" && outputs.amortizationSchedule.length > 0) {
      const biweeklyPayment = outputs.periodicPayment / 2;
      const monthlyRate = Math.pow(1 + inputs.interestRate / 100 / 2, 2 / 12) - 1;
      const n = Math.log(biweeklyPayment / (biweeklyPayment - outputs.loanAmount * monthlyRate / 2)) / Math.log(1 + monthlyRate / 2);
      const biweeklyYears = Math.max(0, n / 26);
      const yearsSaved = inputs.amortizationYears - biweeklyYears;
      if (yearsSaved > 1) {
        const totalBiweekly = biweeklyPayment * 26 * biweeklyYears;
        const totalMonthly = outputs.periodicPayment * 12 * inputs.amortizationYears;
        const saved = Math.max(0, totalMonthly - totalBiweekly);
        insights.push({
          type: "info",
          text: `Switching to accelerated bi-weekly payments saves roughly ${formatCurrency(saved, 0, true)} in interest over the amortization.`,
        });
      }
    }

    // Extra payment savings
    if (inputs.extraPayment > 0 && outputs.amortizationSchedule.length > 0) {
      const baseScheduleLength = inputs.amortizationYears * 12;
      const actualLength = outputs.amortizationSchedule.length;
      const monthsSavedExtra = Math.max(0, baseScheduleLength - actualLength);
      const yrsSaved = Math.floor(monthsSavedExtra / 12);
      const msSaved = monthsSavedExtra % 12;
      const timeStr = [yrsSaved > 0 ? `${yrsSaved} yr` : "", msSaved > 0 ? `${msSaved} mo` : ""].filter(Boolean).join(" ");
      if (monthsSavedExtra > 0) {
        insights.push({
          type: "positive",
          text: `Your extra ${formatCurrency(inputs.extraPayment, 0)}/payment cuts ${timeStr} off your amortization.`,
        });
      }
    }

    // Lump sum savings
    const totalLumps = Object.values(inputs.lumpSumsByYear).reduce((s, v) => s + (v || 0), 0);
    if (totalLumps > 0 && outputs.interestSavedByLumpSums > 0) {
      const months = outputs.paymentsSavedByLumpSums;
      const years  = Math.floor(months / 12);
      const rem    = months % 12;
      const timeStr = years > 0 && rem > 0 ? `${years}yr ${rem}mo` : years > 0 ? `${years} years` : `${rem} months`;
      insights.push({
        type: "positive",
        text: `Your lump sum payments save ${formatCurrency(outputs.interestSavedByLumpSums, 0)} in interest and cut ${timeStr} off your amortization.`,
      });
    }

    // New build GST
    if (inputs.isNewBuild && outputs.gstHst.net > 0) {
      insights.push({
        type: "info",
        text: `New build GST/HST adds ${formatCurrency(outputs.gstHst.net, 0)} to your upfront costs after the federal rebate.`,
      });
    }

    // High LTV warning
    if (down < 10 && price > 0) {
      insights.push({
        type: "warning",
        text: "With under 10% down, a 5% drop in home value would put you underwater on your mortgage. Consider whether the timing is right.",
      });
    }
  }

  // ── Renewal insights ───────────────────────────────────────────────────────
  if (mode === "renewal") {
    const oldPayment = outputs.paymentWithoutCMHC; // reuse as proxy for "current"
    const newPayment = outputs.periodicPayment;
    const diff = newPayment - oldPayment;
    const pctChange = oldPayment > 0 ? (diff / oldPayment) * 100 : 0;

    if (diff > 200) {
      insights.push({
        type: "warning",
        text: `Your payment increases by ${formatCurrency(diff, 0)}/month (+${pctChange.toFixed(0)}%) at renewal. Budget for this before your term ends.`,
      });
    }

    if (diff > 0 && diff <= 200) {
      insights.push({
        type: "info",
        text: `Payment increases ${formatCurrency(diff, 0)}/month at renewal — manageable but worth planning for.`,
      });
    }

    if (diff < 0) {
      insights.push({
        type: "positive",
        text: `Your new rate is lower — payment drops ${formatCurrency(Math.abs(diff), 0)}/month. Good time to increase payments and pay down principal faster.`,
      });
    }

    // Extending amortization
    if (inputs.amortizationYears > 20) {
      const shorterPayment = calculateMortgagePayment(
        inputs.currentBalance, inputs.interestRate, 20, inputs.paymentFrequency
      );
      insights.push({
        type: "info",
        text: `Keeping a 20-year amortization would be ${formatCurrency(shorterPayment - newPayment, 0)}/payment more — but saves significantly on total interest.`,
      });
    }
  }

  // ── Refinance insights ─────────────────────────────────────────────────────
  if (mode === "refinance") {
    const equity = Math.max(0, inputs.homeValue - inputs.currentBalance);
    const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
    const ltv = inputs.homeValue > 0 ? inputs.currentBalance / inputs.homeValue : 0;

    if (ltv > 0.75 && ltv <= 0.80) {
      insights.push({
        type: "warning",
        text: `Your LTV is ${(ltv * 100).toFixed(1)}% — close to the 80% refinance cap. Adding cash-out may not be possible.`,
      });
    }

    if (ltv > 0.80) {
      insights.push({
        type: "warning",
        text: `LTV of ${(ltv * 100).toFixed(1)}% exceeds the 80% refinance cap. You'd need to reduce the loan amount or wait for values to rise.`,
      });
    }

    if (equityPct >= 35) {
      insights.push({
        type: "positive",
        text: `Strong equity position at ${equityPct.toFixed(0)}%. You have good options — lower rate, cash-out, or debt consolidation are all viable.`,
      });
    }

    if (outputs.cmhcPremium === 0 && ltv <= 0.80) {
      insights.push({
        type: "positive",
        text: "Refinancing at this LTV doesn't require CMHC insurance.",
      });
    }
  }

  return insights.slice(0, 4); // max 4 insights at once
}

const ICONS = {
  positive: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="var(--green)"/>
      <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1L13 12H1L7 1Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2"/>
      <path d="M7 5v3M7 9.5v.5" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="#e6f1fb" stroke="var(--green)" strokeWidth="1.2"/>
      <path d="M7 6v4M7 4.5v.5" stroke="var(--green)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

export default function InsightsPanel({ inputs, outputs }: Props) {
  const insights = getInsights(inputs, outputs);
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 rounded-t-2xl"
        style={{ background: "var(--cream)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1l1.5 3h3l-2.5 2 1 3L7 7.5 4 9l1-3L2.5 4h3L7 1z"
            fill="var(--green)" stroke="var(--green)" strokeWidth="0.5" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--green)" }}>
          Insights
        </p>
      </div>
      <div className="divide-y divide-slate-50">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <span className="shrink-0 mt-0.5">{ICONS[insight.type]}</span>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
