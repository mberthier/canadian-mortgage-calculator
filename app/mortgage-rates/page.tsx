import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
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
                <PageHeader
          crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Rate History" }]}
          title="Canadian Mortgage Rate History"
          subtitle="The Bank of Canada raised rates to 5% in 2023, then cut nine times. Here is what that looked like, and where things stand now."
          needs={[
            { label: "Nothing — this is a reference page" },
          ]}
          gets={[
            { label: "BoC overnight rate from 2020 to today" },
            { label: "How fixed vs variable rates diverged" },
            { label: "Context for today's rate environment" },
            { label: "What history suggests about future direction" },
          ]}
        />

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
