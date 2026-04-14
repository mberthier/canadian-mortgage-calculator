"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { calculateCMHCPremium, calculateLandTransferTax } from "@/lib/mortgageMath";
import { PROVINCES } from "@/lib/constants";

interface Props {
  homePrice:       number;
  downPayment:     number;
  downPercent:     number;
  interestRate:    number;
  province:        string;
  cmhcPremium:     number;
  stressTestRate:  number;
  isFirstTimeBuyer: boolean;
  onToggle:        () => void;
}

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: "var(--green)" }}>
        {number}
      </div>
      <div className="flex-1 pb-5 border-b border-neutral-100 last:border-0 last:pb-0">
        <p className="text-sm font-semibold text-neutral-800 mb-1.5">{title}</p>
        {children}
      </div>
    </div>
  );
}

const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario", BC: "British Columbia", AB: "Alberta", QC: "Québec",
  MB: "Manitoba", SK: "Saskatchewan", NS: "Nova Scotia", NB: "New Brunswick",
  NL: "Newfoundland & Labrador", PE: "Prince Edward Island",
  NT: "Northwest Territories", NU: "Nunavut", YT: "Yukon",
};

export default function FirstTimeBuyerGuide({
  homePrice, downPayment, downPercent, interestRate,
  province, cmhcPremium, stressTestRate, isFirstTimeBuyer, onToggle,
}: Props) {
  const [open, setOpen] = useState(false);

  const ltt = calculateLandTransferTax(homePrice, province, "", true);
  const lttNoRebate = calculateLandTransferTax(homePrice, province, "", false);
  const hasRebate = ltt.firstTimeBuyerRebate > 0;
  const hasCMHC = cmhcPremium > 0;
  const cmhcPct = homePrice > 0 && downPayment > 0
    ? ((downPayment / homePrice) * 100).toFixed(1) : "0";

  // Minimum down payment thresholds
  const minDown5 = homePrice <= 500_000
    ? homePrice * 0.05
    : 500_000 * 0.05 + Math.min(homePrice - 500_000, 1_000_000) * 0.1;

  return (
    <div className="border-t border-neutral-100 pt-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span>First-Time Buyer Guide</span>
          {isFirstTimeBuyer && (
            <span className="normal-case font-medium rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--green-light)", color: "var(--green)" }}>
              Active
            </span>
          )}
        </div>
        <span className="text-base">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            Buying your first home in Canada? Here's exactly what you need to know — explained with your actual numbers.
          </p>

          {/* First-time buyer toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border"
            style={{ background: "#f8f8f8", borderColor: isFirstTimeBuyer ? "var(--green-border)" : "#e7e5e4" }}>
            <div
              onClick={onToggle}
              role="switch"
              aria-checked={isFirstTimeBuyer}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onToggle()}
              className="relative w-10 h-5 rounded-full transition-colors shrink-0"
              style={{ background: isFirstTimeBuyer ? "var(--green)" : "#d6d3d1" }}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFirstTimeBuyer ? "translate-x-5" : ""}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">I'm a first-time home buyer</p>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                Enables LTT rebates and relevant tips below
              </p>
            </div>
          </label>

          {/* Steps */}
          <div className="space-y-0">
            {/* Step 1 — Down payment */}
            <Step number={1} title="How much do you need for a down payment?">
              <div className="space-y-2 text-xs" style={{ color: "var(--ink-mid)" }}>
                <p>In Canada, the minimum down payment depends on the purchase price:</p>
                <div className="rounded-lg overflow-hidden border border-neutral-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "#f8f8f8" }}>
                        <th className="px-3 py-2 text-left font-semibold text-neutral-600">Purchase Price</th>
                        <th className="px-3 py-2 text-right font-semibold text-neutral-600">Min. Down</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={homePrice <= 500_000 ? "bg-blue-50" : ""}>
                        <td className="px-3 py-2 text-neutral-600">Under $500,000</td>
                        <td className="px-3 py-2 text-right font-medium text-neutral-800">5%</td>
                      </tr>
                      <tr className={homePrice > 500_000 && homePrice <= 1_500_000 ? "bg-blue-50" : ""}>
                        <td className="px-3 py-2 text-neutral-600">$500K – $1.5M</td>
                        <td className="px-3 py-2 text-right font-medium text-neutral-800">5% + 10% over $500K</td>
                      </tr>
                      <tr className={homePrice > 1_500_000 ? "bg-blue-50" : ""}>
                        <td className="px-3 py-2 text-neutral-600">Over $1.5M</td>
                        <td className="px-3 py-2 text-right font-medium text-neutral-800">20%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {homePrice > 0 && (
                  <p className="font-medium" style={{ color: "var(--green)" }}>
                    For your {formatCurrency(homePrice)} home, the minimum down payment is {formatCurrency(minDown5, 0)}.
                  </p>
                )}
              </div>
            </Step>

            {/* Step 2 — CMHC */}
            <Step number={2} title="What is CMHC insurance and do you need it?">
              <div className="space-y-2 text-xs" style={{ color: "var(--ink-mid)" }}>
                <p>
                  If your down payment is <strong className="text-neutral-700">less than 20%</strong>, the federal government requires you to buy mortgage default insurance through CMHC. The premium is added to your mortgage — you don't pay it upfront.
                </p>
                <div className="rounded-lg overflow-hidden border border-neutral-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "#f8f8f8" }}>
                        <th className="px-3 py-2 text-left font-semibold text-neutral-600">Down Payment</th>
                        <th className="px-3 py-2 text-right font-semibold text-neutral-600">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { range: "5% – 9.99%", rate: "4.00%", active: downPercent < 10 },
                        { range: "10% – 14.99%", rate: "3.10%", active: downPercent >= 10 && downPercent < 15 },
                        { range: "15% – 19.99%", rate: "2.80%", active: downPercent >= 15 && downPercent < 20 },
                        { range: "20%+", rate: "No insurance", active: downPercent >= 20 },
                      ].map(({ range, rate, active }) => (
                        <tr key={range} style={active ? { background: "var(--green-light)" } : {}}>
                          <td className="px-3 py-2 text-neutral-600">{range}</td>
                          <td className="px-3 py-2 text-right font-medium text-neutral-800">{rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hasCMHC ? (
                  <div className="rounded-lg px-3 py-2 border"
                    style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
                    Your {cmhcPct}% down payment triggers CMHC insurance of{" "}
                    <strong>{formatCurrency(cmhcPremium, 0)}</strong> added to your mortgage.
                  </div>
                ) : (
                  <div className="rounded-lg px-3 py-2 border"
                    style={{ background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }}>
                    Your {downPercent.toFixed(1)}% down payment is 20%+ — no CMHC required. ✓
                  </div>
                )}
              </div>
            </Step>

            {/* Step 3 — Stress Test */}
            <Step number={3} title="What is the mortgage stress test?">
              <div className="space-y-2 text-xs" style={{ color: "var(--ink-mid)" }}>
                <p>
                  Before approving your mortgage, your lender must verify you can afford payments at a higher rate — either your contract rate <strong className="text-neutral-700">+ 2%</strong> or <strong className="text-neutral-700">5.25%</strong>, whichever is higher.
                </p>
                <p>This protects you from defaulting if rates rise at renewal.</p>
                {interestRate > 0 && (
                  <div className="rounded-lg px-3 py-2 border border-neutral-100"
                    style={{ background: "#f8f8f8" }}>
                    At your rate of <strong className="text-neutral-700">{interestRate}%</strong>, you'll be stress-tested at{" "}
                    <strong style={{ color: "var(--green)" }}>{stressTestRate.toFixed(2)}%</strong>.
                    {" "}Your lender will calculate your GDS/TDS ratios using this higher rate.
                  </div>
                )}
              </div>
            </Step>

            {/* Step 4 — LTT */}
            <Step number={4} title="Land transfer tax — and your rebate">
              <div className="space-y-2 text-xs" style={{ color: "var(--ink-mid)" }}>
                <p>
                  When you buy a home, you pay a <strong className="text-neutral-700">land transfer tax</strong> to your province (and Toronto charges an additional municipal LTT).
                </p>
                {homePrice > 0 && (
                  <div className="rounded-lg overflow-hidden border border-neutral-100">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-neutral-600">LTT in {PROVINCE_NAMES[province] ?? province}</td>
                          <td className="px-3 py-2 text-right font-medium text-neutral-800">
                            {formatCurrency(lttNoRebate.total, 0)}
                          </td>
                        </tr>
                        {hasRebate && (
                          <>
                            <tr style={{ color: "var(--green-mid)" }}>
                              <td className="px-3 py-2">First-time buyer rebate</td>
                              <td className="px-3 py-2 text-right font-medium">
                                − {formatCurrency(ltt.firstTimeBuyerRebate, 0)}
                              </td>
                            </tr>
                            <tr style={{ background: "var(--green-light)" }}>
                              <td className="px-3 py-2 font-semibold text-neutral-700">Your net LTT</td>
                              <td className="px-3 py-2 text-right font-semibold" style={{ color: "var(--green)" }}>
                                {formatCurrency(ltt.net, 0)}
                              </td>
                            </tr>
                          </>
                        )}
                        {!hasRebate && (
                          <tr>
                            <td className="px-3 py-2 text-neutral-400" colSpan={2}>
                              No first-time buyer LTT rebate in {PROVINCE_NAMES[province] ?? province}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {hasRebate && (
                  <p style={{ color: "var(--green)" }} className="font-medium">
                    As a first-time buyer you save {formatCurrency(ltt.firstTimeBuyerRebate, 0)} in land transfer tax. Make sure to apply for this rebate on closing.
                  </p>
                )}
              </div>
            </Step>

            {/* Step 5 — RRSP */}
            <Step number={5} title="The Home Buyers' Plan — use your RRSP">
              <div className="text-xs space-y-2" style={{ color: "var(--ink-mid)" }}>
                <p>
                  First-time buyers can withdraw up to <strong className="text-neutral-700">$60,000 per person</strong> from their RRSP tax-free to use toward a down payment (increased from $35K in 2024).
                </p>
                <p>
                  Couples can withdraw up to <strong className="text-neutral-700">$120,000 combined</strong>. You have 15 years to repay the withdrawn amount back into your RRSP.
                </p>
                <div className="rounded-lg px-3 py-2 border"
                  style={{ background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }}>
                  If both you and a partner qualify, this could significantly boost your down payment — potentially enough to reach 20% and avoid CMHC entirely.
                </div>
              </div>
            </Step>
          </div>
        </div>
      )}
    </div>
  );
}
