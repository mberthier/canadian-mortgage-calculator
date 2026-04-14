import type { Metadata } from "next";
import IllustrationAffordability from "@/components/illustrations/IllustrationAffordability";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import AffordabilityClient from "./AffordabilityClient";

export const metadata: Metadata = {
  title: "Mortgage Affordability & Stress Test Calculator Canada 2026",
  description: "Find out how much mortgage you can afford in Canada and whether you pass the stress test. GDS/TDS ratios, qualifying rate, and max purchase price — updated for 2026.",
  alternates: { canonical: "https://crystalkey.ca/affordability" },
  openGraph: {
    title: "Mortgage Affordability & Stress Test Calculator Canada 2026 | CrystalKey",
    description: "How much mortgage can you afford? Will you pass the stress test? GDS/TDS calculator for Canada.",
    url: "https://crystalkey.ca/affordability",
  },
};

const FAQ = [
  { question: "How much mortgage can I afford in Canada?", answer: "Canadian lenders use two ratios: GDS must be 39% or less, and TDS must be 44% or less, both calculated at the stress test rate (your rate + 2%, minimum 5.25%). A rough rule: you can typically afford a home worth 4–5× your gross household income, depending on debts and down payment." },
  { question: "What is the GDS ratio in Canada?", answer: "GDS (Gross Debt Service) measures your housing costs as a percentage of gross income — mortgage P&I, property taxes, monthly heating costs, and 50% of condo fees. CMHC raised the maximum GDS from 32% to 39% in December 2024." },
  { question: "What is the TDS ratio?", answer: "TDS (Total Debt Service) adds all other debt obligations to your GDS — car loans, student loans, credit card minimums, lines of credit. Maximum is 44%. Reducing non-mortgage debt is one of the most effective ways to improve your qualifying position." },
  { question: "What is the mortgage stress test?", answer: "The stress test requires lenders to verify you can afford payments at the greater of your contract rate + 2% or 5.25%. At today's best rate of ~3.89%, the stress test rate is 5.89%. This protects borrowers from payment shock if rates rise at renewal." },
  { question: "Does the stress test apply at renewal?", answer: "If you renew with your existing lender, the stress test does not apply. Since November 2024, straight switches to a new lender at renewal also no longer require re-qualification. If you increase the mortgage amount, the stress test applies to the new amount." },
  { question: "What income do I need for a $700,000 mortgage?", answer: "At a stress test rate of ~5.89% with 25-year amortization, a $700,000 mortgage requires approximately $175,000 in gross household income to pass GDS limits, assuming $4,800/year property tax, $150/mo heating, and no other debts." },
  { question: "Did affordability rules change in 2024?", answer: "Yes — significantly. Effective December 15, 2024: the CMHC insured limit was raised from $1M to $1.5M; GDS limit raised from 32% to 39%; and minimum down payment thresholds updated. These changes meaningfully increased what many Canadians can qualify for." },
];

export default function AffordabilityPage() {
  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Affordability & Stress Test" }]} />
        <div className="mt-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>
                Mortgage Affordability & Stress Test
              </h1>
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
                Your lender runs these exact numbers before saying yes. Find out where you stand — and what rate they'll actually test you at.
              </p>
            </div>
            <div className="shrink-0 w-32 hidden sm:block"><IllustrationAffordability /></div>
          </div>
        </div>

        <AffordabilityClient />

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>How affordability works in Canada</h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>Canadian lenders apply two standardized tests — GDS and TDS — both calculated at the <strong className="text-neutral-700">stress test rate</strong> (the higher of your contract rate + 2% or 5.25%), not your actual rate. CMHC raised the GDS limit from 32% to 39% in December 2024, meaningfully increasing qualifying power.</p>
              <p>Your maximum purchase price is determined by whichever constraint binds first. Adding a co-applicant, reducing debts, or increasing your down payment all improve your position.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>Stress test rates by contract rate</h2>
            <div className="rounded-2xl overflow-hidden border border-neutral-100">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--green)", color: "#fff" }}>
                    <th className="px-5 py-3.5 text-left font-semibold">Contract rate</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Stress test rate</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Rule applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {[
                    ["3.89%", "5.89%", "Contract + 2%"],
                    ["3.50%", "5.50%", "Contract + 2%"],
                    ["3.00%", "5.25%", "5.25% floor"],
                    ["2.50%", "5.25%", "5.25% floor"],
                  ].map(([rate, stress, why]) => (
                    <tr key={rate} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-800">{rate}</td>
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--green)" }}>{stress}</td>
                      <td className="px-5 py-3 text-right text-neutral-500 text-xs">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/affordability" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Calculate your full mortgage</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            See your payment, CMHC, land transfer tax, and full amortization schedule.
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
