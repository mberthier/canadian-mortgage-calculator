import type { Metadata } from "next";
import IllustrationRates from "@/components/illustrations/IllustrationRates";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import RateHistoryPageClient from "./RateHistoryPageClient";

export const metadata: Metadata = {
  title: "Canadian Mortgage Rate History. Bank of Canada Rate Chart 2023–2026",
  description: "Interactive chart of Bank of Canada overnight rate and 5-year fixed mortgage rate history. Track 9 rate cuts from the 5% peak in 2023 to 2.25% today.",
  alternates: { canonical: "https://crystalkey.ca/mortgage-rates" },
  openGraph: {
    title: "Canadian Mortgage Rate History 2023–2026 | CrystalKey",
    description: "Bank of Canada overnight rate and 5-year fixed mortgage rate chart 2023–2026.",
    url: "https://crystalkey.ca/mortgage-rates",
  },
};

const FAQ = [
  { question: "What is the Bank of Canada overnight rate in 2026?", answer: "As of April 2026, the Bank of Canada overnight rate is 2.25%. After nine consecutive cuts from the 5.0% peak in July 2023, the BoC has held at 2.25% since September 2025, pausing as it monitors inflation and global economic uncertainty." },
  { question: "What is the prime rate in Canada in 2026?", answer: "The prime rate is 4.45% as of April 2026. 2.20% above the BoC overnight rate. Variable mortgage rates are priced relative to prime (e.g., prime − 1.10% = 3.35%)." },
  { question: "What are the best mortgage rates in Canada right now?", answer: "As of April 9, 2026: best 5-year fixed is approximately 3.89%, best 3-year fixed is around 3.90%, and best 5-year variable is approximately 3.35% (prime − 1.10%). These are broker rates, bank rates are typically higher." },
  { question: "Will Canadian mortgage rates go down further in 2026?", answer: "The BoC signalled in early 2026 that it is pausing its rate cut cycle. Further cuts appear unlikely near-term. Fixed rates, driven by bond yields, have actually risen slightly in early 2026 despite the overnight rate holding steady." },
  { question: "Should I choose fixed or variable in 2026?", answer: "With variable rates at 3.35% and 5-year fixed at 3.89%, the spread is 0.54%. Variable rates offer lower starting payments but risk rising if the BoC reverses course. Fixed gives certainty. Given current uncertainty, the fixed premium is small and many Canadians are choosing fixed." },
];

export default function MortgageRatesPage() {
  return (
    <SiteLayout >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Mortgage Rates" }]} />
        <div className="mt-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>Canadian Mortgage Rate History</h1>
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>The Bank of Canada raised rates to 5% in 2023, then cut nine times. Here's what that actually looked like, and where things stand now.</p>
            </div>
            <div className="shrink-0 w-32 hidden sm:block"><IllustrationRates /></div>
          </div>
        </div>

        <RateHistoryPageClient />

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3 tracking-tight" style={{ color: "var(--ink)" }}>The rate cycle in context</h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>Canadian mortgage rates went on an unprecedented journey between 2022 and 2026. The Bank of Canada raised its overnight rate from 0.25% to 5.0% in 18 months, the fastest tightening cycle in Canadian history, to combat inflation that peaked above 8%.</p>
              <p>Starting in June 2024, the BoC cut rates nine consecutive times, bringing the overnight rate from 5.0% to 2.25% by October 2025. Fixed mortgage rates followed bond yields lower, dropping from nearly 6% to around 3.89% today.</p>
              <p>Since September 2025, the BoC has held at 2.25%, pausing as it monitors global trade tensions and whether inflation remains near its 2% target. Fixed rates have ticked upward slightly in early 2026 as bond yields rise on global uncertainty.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/mortgage-rates" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Calculate your mortgage at today's rates</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Best available rates pre-loaded in the calculator.
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
