import type { Metadata } from "next";
import IllustrationRates from "@/components/illustrations/IllustrationRates";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import FAQAccordion from "@/components/FAQAccordion";
import RateHistoryPageClient from "./RateHistoryPageClient";
import {
  RATE_PRESETS,
  RATES_UPDATED,
  RATES_BOC_OVERNIGHT,
  RATES_PRIME,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Canadian Mortgage Rates Today 2026 — Best Fixed & Variable Rates",
  description: "Today's best Canadian mortgage rates: 5-year fixed, 3-year fixed, variable, insured and uninsured. Updated April 2026. Plus Bank of Canada rate history chart.",
  alternates: { canonical: "https://crystalkey.ca/mortgage-rates" },
  openGraph: {
    title: "Canadian Mortgage Rates Today 2026 | CrystalKey",
    description: "Best 5-year fixed, variable, and alternative term mortgage rates in Canada. Updated April 2026.",
    url: "https://crystalkey.ca/mortgage-rates",
  },
};

const FAQ = [
  {
    question: "What is the Bank of Canada overnight rate in 2026?",
    answer: `As of ${RATES_UPDATED}, the Bank of Canada overnight rate is ${RATES_BOC_OVERNIGHT}%. After nine consecutive cuts from the 5.0% peak in July 2023, the BoC has held at ${RATES_BOC_OVERNIGHT}% since September 2025, pausing as it monitors inflation and global economic uncertainty.`,
  },
  {
    question: "What is the prime rate in Canada in 2026?",
    answer: `The prime rate is ${RATES_PRIME}% as of ${RATES_UPDATED} — ${(RATES_PRIME - RATES_BOC_OVERNIGHT).toFixed(2)}% above the BoC overnight rate. Variable mortgage rates are priced relative to prime (e.g., prime − 1.10% = ${(RATES_PRIME - 1.10).toFixed(2)}%).`,
  },
  {
    question: "What is the difference between insured and insurable mortgage rates?",
    answer: "Insured mortgages (under 20% down payment) get the lowest available rates because lenders have no default risk — CMHC covers it. Insurable mortgages (20%+ down, under $1.5M, 25yr amortization) can be pool-insured by lenders and typically get rates close to insured pricing. Conventional mortgages (over $1.5M or 30yr amortization) carry more lender risk and are priced 0.10–0.25% higher.",
  },
  {
    question: "Should I choose fixed or variable in 2026?",
    answer: `With variable rates at ${RATE_PRESETS.find(r => r.type === "variable")?.rate}% and 5-year fixed at ${RATE_PRESETS.find(r => r.term === 5 && r.type === "fixed")?.rate}%, the spread is ${((RATE_PRESETS.find(r => r.term === 5 && r.type === "fixed")?.rate ?? 0) - (RATE_PRESETS.find(r => r.type === "variable")?.rate ?? 0)).toFixed(2)}%. Variable offers lower starting payments but rate risk at renewal. Fixed provides certainty. Given the BoC is on hold and fixed-rate premium is small, many Canadians are choosing fixed.`,
  },
  {
    question: "Will Canadian mortgage rates go down further in 2026?",
    answer: "The BoC signalled in early 2026 that it is pausing its rate cut cycle. Further cuts appear unlikely near-term. Fixed rates, driven by bond yields, have actually ticked upward slightly in early 2026 despite the overnight rate holding steady.",
  },
  {
    question: "Are broker rates better than bank rates?",
    answer: "Almost always, yes. The rates shown on this page are broker rates — the best available from monoline lenders and credit unions working through mortgage brokers. Major bank rates are typically 0.20–0.50% higher for the same product. A broker also has access to products and lenders that a single bank branch cannot offer.",
  },
];

// Sort presets: variable first, then fixed by term ascending
const sortedRates = [...RATE_PRESETS].sort((a, b) => {
  if (a.type !== b.type) return a.type === "variable" ? -1 : 1;
  return a.term - b.term;
});

const UNINSURABLE_PREMIUM = 0.20;

export default function MortgageRatesPage() {
  const fixed5yr = RATE_PRESETS.find(r => r.term === 5 && r.type === "fixed");
  const variable = RATE_PRESETS.find(r => r.type === "variable");

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <PageHeader
          crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Mortgage Rates" }]}
          title="Canadian Mortgage Rates Today"
          subtitle="Best available broker rates for fixed and variable mortgages. Updated regularly — these are the rates that feed our rate gap analysis."
          illustration={<IllustrationRates />}
          gets={[
            { label: "Today's best fixed and variable rates" },
            { label: "Insured vs insurable vs conventional pricing" },
            { label: "Bank of Canada rate history 2020–2026" },
            { label: "Fixed vs variable decision framework" },
          ]}
        />

        {/* ── Live rate table ── */}
        <div className="rounded-2xl overflow-hidden mb-10" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>

          {/* Header bar */}
          <div className="px-5 py-3.5 flex items-center justify-between"
            style={{ background: "var(--green)" }}>
            <p className="text-sm font-semibold text-white">Best available rates — Canada</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"/>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                Updated {RATES_UPDATED}
              </p>
            </div>
          </div>

          {/* BoC + Prime summary strip */}
          <div className="grid grid-cols-2 divide-x bg-white"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {[
              { label: "BoC Overnight Rate", value: `${RATES_BOC_OVERNIGHT}%`, note: "Held since Sep 2025" },
              { label: "Prime Rate", value: `${RATES_PRIME}%`, note: `BoC + 2.20%` },
            ].map(({ label, value, note }) => (
              <div key={label} className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide mb-1"
                  style={{ color: "var(--ink-faint)" }}>{label}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{note}</p>
              </div>
            ))}
          </div>

          {/* Rate rows */}
          <table className="w-full text-sm bg-white">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--ink-faint)" }}>Term</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--ink-faint)" }}>Insured</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--ink-faint)" }}>Insurable</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--ink-faint)" }}>Conventional</th>
              </tr>
            </thead>
            <tbody>
              {sortedRates.map((preset, i) => {
                const isVariable = preset.type === "variable";
                const insured = preset.rate;
                const insurable = preset.rate;
                const conventional = +(preset.rate + UNINSURABLE_PREMIUM).toFixed(2);
                const isLast = i === sortedRates.length - 1;
                return (
                  <tr key={preset.label}
                    style={{ borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.04)" }}
                    className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {isVariable ? "Variable" : `${preset.term}-year fixed`}
                      </span>
                      {isVariable && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: "#f0fdf4", color: "var(--green-mid)", border: "1px solid #bbf7d0" }}>
                          prime − {(RATES_PRIME - preset.rate).toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold tabular-nums" style={{ color: "var(--green)" }}>
                        {insured.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-medium tabular-nums" style={{ color: "var(--ink)" }}>
                        {insurable.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="tabular-nums" style={{ color: "var(--ink-mid)" }}>
                        {conventional.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer note */}
          <div className="px-5 py-3 flex flex-wrap gap-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: "#fafaf8" }}>
            {[
              { label: "Insured", note: "Under 20% down, CMHC required, lowest rates" },
              { label: "Insurable", note: "20%+ down, under $1.5M, 25yr amortization" },
              { label: "Conventional", note: "Over $1.5M or 30yr amortization" },
            ].map(({ label, note }) => (
              <div key={label} className="flex items-start gap-1.5 text-xs"
                style={{ color: "var(--ink-faint)" }}>
                <span className="font-semibold" style={{ color: "var(--ink-mid)" }}>{label}:</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator CTA — inline */}
        <div className="rounded-2xl px-5 py-4 mb-12 flex items-center justify-between gap-4"
          style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
          <p className="text-sm" style={{ color: "var(--ink-mid)" }}>
            <span className="font-semibold" style={{ color: "var(--ink)" }}>See what these rates mean for your mortgage.</span>
            {" "}Calculate your exact payment, CMHC, and closing costs.
          </p>
          <Link href="/" className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{ background: "var(--green)", color: "#fff" }}>
            Open calculator →
          </Link>
        </div>

        {/* Rate history chart */}
        <RateHistoryPageClient />

        {/* Supporting content */}
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3 tracking-tight" style={{ color: "var(--ink)" }}>
              The rate cycle in context
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Canadian mortgage rates went on an unprecedented journey between 2022 and 2026. The Bank of Canada raised its overnight rate from 0.25% to 5.0% in 18 months — the fastest tightening cycle in Canadian history — to combat inflation that peaked above 8%.
              </p>
              <p>
                Starting in June 2024, the BoC cut rates nine consecutive times, bringing the overnight rate from 5.0% to {RATES_BOC_OVERNIGHT}% by October 2025. Fixed mortgage rates followed bond yields lower, dropping from nearly 6% to around {fixed5yr?.rate}% today.
              </p>
              <p>
                Since September 2025, the BoC has held at {RATES_BOC_OVERNIGHT}%, pausing as it monitors global trade tensions and whether inflation remains near its 2% target. Fixed rates have ticked upward slightly in early 2026 as bond yields rise on global uncertainty.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Frequently asked questions
            </h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/mortgage-rates" />
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">
            Calculate your mortgage at today's rates
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            These rates feed directly into our payment calculator and rate gap analysis.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#fff", color: "var(--green)" }}>
            Open Mortgage Calculator →
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
