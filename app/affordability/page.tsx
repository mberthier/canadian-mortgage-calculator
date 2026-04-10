import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import AffordabilityClient from "./AffordabilityClient";

export const metadata: Metadata = {
  title: "Mortgage Affordability Calculator Canada 2026 — How Much Can I Afford?",
  description: "Find out how much mortgage you can afford in Canada using GDS and TDS ratios. Updated for the December 2024 rule changes — GDS limit raised to 39%.",
  alternates: { canonical: "https://crystalkey.ca/affordability" },
  openGraph: { title: "Mortgage Affordability Calculator Canada 2026 | CrystalKey", description: "How much mortgage can you afford in Canada? GDS/TDS calculator with stress test.", url: "https://crystalkey.ca/affordability" },
};

const FAQ = [
  { question: "How much mortgage can I afford in Canada?", answer: "Canadian lenders use two ratios: GDS must be 39% or less, and TDS must be 44% or less, both calculated at the stress test rate. A rough rule: you can typically afford a home worth about 4-5x your gross household income." },
  { question: "What is the GDS ratio?", answer: "GDS (Gross Debt Service) measures your housing costs as a percentage of gross income — mortgage P&I, property taxes, heating, and 50% of condo fees. CMHC raised the maximum GDS from 32% to 39% in December 2024." },
  { question: "What is the TDS ratio?", answer: "TDS (Total Debt Service) adds all other debt payments to your GDS. Maximum is 44%. Car loans, student loans, and credit card minimums all count against your TDS." },
  { question: "What income do I need for a $600,000 mortgage?", answer: "At a stress test rate of 5.89% with a 25-year amortization, a $600,000 mortgage requires approximately $150,000 in gross household income to pass GDS limits, assuming typical property taxes and no other debts." },
  { question: "Did the GDS limit change in 2024?", answer: "Yes. Effective December 15, 2024, CMHC raised the GDS limit from 32% to 39% for insured mortgages — significantly increasing maximum purchase prices for many Canadians." },
];

export default function AffordabilityPage() {
  return (
    <SiteLayout >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Affordability Calculator" }]} />
        <div className="mt-6 mb-8">
          <h1 className="font-display text-4xl leading-tight mb-3" style={{ color: "var(--ink)" }}>Mortgage Affordability Calculator</h1>
          <p className="text-lg" style={{ color: "var(--ink-muted)" }}>Find out how much mortgage you can afford in Canada — using the same GDS and TDS ratios your lender will use.</p>
        </div>
        <AffordabilityClient />
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>How Canadian mortgage affordability works</h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>Canadian lenders apply two standardized tests: GDS and TDS, both calculated at the stress test rate (your contract rate + 2% or 5.25%, whichever is higher). CMHC raised the GDS limit from 32% to 39% in December 2024, meaningfully increasing what many Canadians can qualify for.</p>
              <p>Your maximum purchase price is determined by whichever constraint binds first — GDS or TDS. Adding a co-applicant, reducing debts, or increasing the down payment all improve your qualifying power.</p>
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-4" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/affordability" />
          </section>
        </div>
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="font-display text-2xl text-white mb-2">Calculate your full mortgage scenario</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Including payments, CMHC, land transfer tax, and full amortization schedule.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "#fff", color: "var(--green)" }}>Open Full Mortgage Calculator</Link>
        </div>
      </div>
    </SiteLayout>
  );
}
