"use client";

import React, { useState } from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { RATE_PRESETS } from "@/lib/constants";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

function getMortgageType(inputs: MortgageInputs): "insured" | "insurable" | "uninsurable" {
  if (inputs.homePrice > 1_500_000 || inputs.amortizationYears > 25) return "uninsurable";
  if (inputs.downPaymentPercent < 20) return "insured";
  return "insurable";
}

function getBestRate(): number {
  return Math.min(...RATE_PRESETS.filter(r => r.term === 5).map(r => r.rate));
}

function getContent(inputs: MortgageInputs, outputs: MortgageOutputs): {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
} {
  const mode = inputs.mortgageMode;
  const bestRate = getBestRate();

  if (mode === "renewal") {
    const diff = outputs.periodicPayment - outputs.currentPayment;
    const hasDiff = outputs.currentPayment > 0 && Math.abs(diff) > 1;
    return {
      eyebrow: "Renewal opportunity",
      headline: "Your lender's first offer is rarely their best",
      body: hasDiff && diff > 0
        ? `Your payment is going up ${formatCurrency(diff, 0)}/period at renewal. Since November 2024 you can switch lenders without re-qualifying — use that leverage to get a competing offer before you sign anything.`
        : `Since November 2024 you can switch lenders at renewal without re-qualifying. Your existing lender knows this. Get at least one competing quote from a broker before you sign.`,
      cta: "Get a competing renewal quote",
    };
  }

  if (mode === "refinance") {
    const equityPct = inputs.homeValue > 0
      ? ((inputs.homeValue - outputs.loanAmount) / inputs.homeValue * 100).toFixed(0)
      : null;
    return {
      eyebrow: "Refinance strategy",
      headline: equityPct && Number(equityPct) >= 35
        ? `${equityPct}% equity gives you real negotiating power`
        : "Get competing offers before you commit to breaking your mortgage",
      body: `Breaking a mortgage early has a cost. A broker can calculate your exact penalty, compare it against your interest savings, and shop 30+ lenders to make sure the numbers actually work in your favour.`,
      cta: "Talk to a broker about your refinance",
    };
  }

  // Purchase — varies by mortgage type
  const mortgageType = getMortgageType(inputs);

  if (mortgageType === "insured") {
    const needed = inputs.homePrice > 0
      ? Math.ceil(inputs.homePrice * 0.20) - inputs.downPayment
      : null;
    const isClose = needed !== null && needed < 30_000;
    return {
      eyebrow: "Purchase insight",
      headline: isClose
        ? `${formatCurrency(needed!, 0)} more eliminates CMHC — a broker can show you if it's worth it`
        : "A broker can find the best insured rate for your profile",
      body: isClose
        ? `You're ${formatCurrency(needed!, 0)} away from 20% down. Whether it's worth saving more before buying depends on your timeline, carrying costs, and market conditions. A broker can model both scenarios with real numbers.`
        : `Insured mortgages at under 20% down have the lowest rates available — lenders compete for them. A broker shopping across 30+ lenders will find you a better rate than going to your bank directly.`,
      cta: "Get matched with a broker",
    };
  }

  if (mortgageType === "insurable") {
    return {
      eyebrow: "Rate opportunity",
      headline: "Your mortgage qualifies for insurable pricing — most buyers never ask for it",
      body: `With 20%+ down, under $1.5M, and a 25-year amortization, lenders can pool-insure your mortgage even without a CMHC premium. This unlocks rates close to what insured buyers get. Most bank advisors won't mention it. A broker will.`,
      cta: "Ask a broker about insurable pricing",
    };
  }

  // Uninsurable
  const reason = inputs.homePrice > 1_500_000 ? "over $1.5M" : "30-year amortization";
  return {
    eyebrow: "Conventional mortgage",
    headline: "At this tier, broker shopping has more impact than on a standard purchase",
    body: `${reason === "over $1.5M" ? "Purchases over $1.5M" : "A 30-year amortization"} means conventional pricing — typically 0.10 to 0.25% higher than insured rates, and the spread between lenders is wider. A broker with access to multiple lenders makes a meaningful difference here.`,
    cta: "Find the best conventional rate",
  };
}

export default function BrokerMatchCard({ inputs, outputs }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen]   = useState(false);
  const [loading, setLoading] = useState(false);

  const { eyebrow, headline, body, cta } = getContent(inputs, outputs);

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email,
          mode: inputs.mortgageMode,
          province: inputs.province,
          homePrice: inputs.homePrice,
          balance: inputs.currentBalance,
          userRate: inputs.interestRate,
          source: "broker-match-card",
        }),
      }).catch(() => {});
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--green-border)", background: "var(--green-light)" }}>

      {/* Card body */}
      <div className="px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--green)" }}>
          {eyebrow}
        </p>
        <p className="text-base font-bold leading-snug mb-2"
          style={{ color: "var(--ink)" }}>
          {headline}
        </p>
        <p className="text-sm leading-relaxed"
          style={{ color: "var(--ink-muted)" }}>
          {body}
        </p>

        {/* CTA */}
        {!open && !submitted && (
          <button
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--green)", color: "#fff" }}>
            {cta}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Inline form */}
        {open && !submitted && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text" placeholder="Full name" value={name}
                onChange={e => setName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-colors"/>
              <input
                type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-colors"/>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!email.includes("@") || loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "var(--green)", color: "#fff" }}>
                {loading ? "Sending..." : "Connect me with a broker"}
              </button>
              <button onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "rgba(0,0,0,0.06)", color: "var(--ink-muted)" }}>
                Cancel
              </button>
            </div>
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              No obligation. A CrystalKey partner broker will reach out within one business day.
            </p>
          </div>
        )}

        {/* Confirmation */}
        {submitted && (
          <div className="mt-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--green)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l2.5 2.5 5.5-5" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              A partner broker will be in touch shortly.
            </p>
          </div>
        )}
      </div>

      {/* Footer trust line */}
      {!submitted && (
        <div className="px-5 py-2.5 border-t"
          style={{ borderColor: "var(--green-border)", background: "rgba(255,255,255,0.5)" }}>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            CrystalKey partner brokers are licensed and independent. No obligation, no sales pressure.
          </p>
        </div>
      )}
    </div>
  );
}
