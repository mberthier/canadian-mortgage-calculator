import type { Metadata } from "next";
import IllustrationAffordability from "@/components/illustrations/IllustrationAffordability";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import AffordabilityClient from "./AffordabilityClient";

export const metadata: Metadata = {
  title: "Mortgage Affordability & Stress Test Calculator Canada 2026",
  description: "Find out how much mortgage you can afford in Canada and whether you pass the stress test. GDS/TDS ratios, qualifying rate, and max purchase price, updated for 2026.",
  alternates: { canonical: "https://crystalkey.ca/affordability" },
  openGraph: {
    title: "Mortgage Affordability & Stress Test Calculator Canada 2026 | CrystalKey",
    description: "How much mortgage can you afford? Will you pass the stress test? GDS/TDS calculator for Canada.",
    url: "https://crystalkey.ca/affordability",
  },
};

const FAQ = [
  { question: "How much mortgage can I afford in Canada?", answer: "Canadian lenders use two ratios: GDS must be 39% or less, and TDS must be 44% or less, both calculated at the stress test rate (your rate + 2%, minimum 5.25%). A rough rule: you can typically afford a home worth 4–5× your gross household income, depending on debts and down payment." },
  { question: "What is the GDS ratio in Canada?", answer: "GDS (Gross Debt Service) measures your housing costs as a percentage of gross income, mortgage P&I, property taxes, monthly heating costs, and 50% of condo fees. CMHC raised the maximum GDS from 32% to 39% in December 2024." },
  { question: "What is the TDS ratio?", answer: "TDS (Total Debt Service) adds all other debt obligations to your GDS, car loans, student loans, credit card minimums, lines of credit. Maximum is 44%. Reducing non-mortgage debt is one of the most effective ways to improve your qualifying position." },
  { question: "What is the mortgage stress test?", answer: "The stress test requires lenders to verify you can afford payments at the greater of your contract rate + 2% or 5.25%. At today's best rate of ~3.89%, the stress test rate is 5.89%. This protects borrowers from payment shock if rates rise at renewal." },
  { question: "Does the stress test apply at renewal?", answer: "If you renew with your existing lender, the stress test does not apply. Since November 2024, straight switches to a new lender at renewal also no longer require re-qualification. If you increase the mortgage amount, the stress test applies to the new amount." },
  { question: "What income do I need for a $700,000 mortgage?", answer: "At a stress test rate of ~5.89% with 25-year amortization, a $700,000 mortgage requires approximately $175,000 in gross household income to pass GDS limits, assuming $4,800/year property tax, $150/mo heating, and no other debts." },
  { question: "Did affordability rules change in 2024?", answer: "Yes, significantly. Effective December 15, 2024: the CMHC insured limit was raised from $1M to $1.5M; GDS limit raised from 32% to 39%; and minimum down payment thresholds updated. These changes meaningfully increased what many Canadians can qualify for." },
];

export default function AffordabilityPage() {
  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <PageHeader
          crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Affordability & Stress Test" }]}
          title="Mortgage Affordability & Stress Test"
          subtitle="Your lender runs these exact numbers before saying yes. Find out where you stand, and what rate they will actually test you at."
                    illustration={<IllustrationAffordability />}
          needs={[
            { label: "Gross annual household income" },
            { label: "Monthly debt payments (car, student loans, etc.)" },
            { label: "Target home price and down payment" },
            { label: "Estimated property tax and heating costs" },
          ]}
          gets={[
            { label: "Your GDS and TDS ratios vs lender limits" },
            { label: "Whether you pass the stress test" },
            { label: "Maximum home price you qualify for" },
            { label: "Exactly what rate you will be tested at" },
          ]}
        />

        <AffordabilityClient />

        <div className="mt-14 space-y-10">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              How affordability is calculated in Canada
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Canadian lenders use two standardized debt ratios — GDS and TDS — both calculated at the <strong className="text-neutral-800">stress test rate</strong> rather than your actual rate. The stress test rate is the greater of your contract rate + 2% or 5.25%. This ensures you can handle higher payments if rates rise at renewal.
              </p>
              <p>
                <strong className="text-neutral-800">GDS (Gross Debt Service)</strong> covers housing costs only: principal and interest, property taxes, heating, and 50% of condo fees if applicable. The maximum is 39% of gross income.
              </p>
              <p>
                <strong className="text-neutral-800">TDS (Total Debt Service)</strong> adds all other debt obligations — car loans, student loans, credit card minimums, lines of credit — to your GDS. The maximum is 44% of gross income.
              </p>
              <p>
                Your maximum purchase price is wherever one of those constraints binds first. Usually TDS is the binding constraint for buyers with significant debt. For buyers with minimal non-mortgage debt, GDS binds. Reducing your debts before applying is often more effective than saving more for a down payment.
              </p>
            </div>
          </section>

          {/* Section 2 — 2024 rule changes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              What changed in December 2024
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Effective December 15, 2024, the federal government made the most significant affordability changes in a decade. Three things changed simultaneously:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
                {[
                  { label: "Insured limit", before: "$1,000,000", after: "$1,500,000", note: "Buyers up to $1.5M can now use less than 20% down" },
                  { label: "GDS limit", before: "32%", after: "39%", note: "Housing cost ratio increased — more qualifying power" },
                  { label: "30-year amortization", before: "Not available insured", after: "Available for first-time buyers", note: "Lower monthly payments, more qualifying room" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--green)" }}>{item.label}</p>
                    <p className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>Was: <span className="line-through">{item.before}</span></p>
                    <p className="text-sm font-bold mb-1" style={{ color: "var(--ink)" }}>Now: {item.after}</p>
                    <p className="text-xs" style={{ color: "var(--green-mid)" }}>{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 — Rate table */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              GDS and TDS limits at a glance
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--green)", color: "#fff" }}>
                    <th className="px-5 py-3.5 text-left font-semibold">Ratio</th>
                    <th className="px-5 py-3.5 text-left font-semibold">What it includes</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Maximum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 bg-white">
                  {[
                    ["GDS", "Mortgage P&I + property tax + heating + 50% condo fees", "39%"],
                    ["TDS", "GDS + all other debt payments (car, student, credit)", "44%"],
                  ].map(([ratio, includes, max]) => (
                    <tr key={ratio} className="hover:bg-neutral-50">
                      <td className="px-5 py-3.5 font-bold" style={{ color: "var(--ink)" }}>{ratio}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{includes}</td>
                      <td className="px-5 py-3.5 text-right font-semibold" style={{ color: "var(--green)" }}>{max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2 px-1" style={{ color: "var(--ink-faint)" }}>
              Both ratios are calculated at the stress test rate (contract rate + 2%, minimum 5.25%), not your actual rate.
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Frequently asked questions
            </h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/affordability" />
          </section>
        </div>

        <div className="mt-14 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
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
