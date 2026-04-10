import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import CMHCCalculatorClient from "./CMHCCalculatorClient";

export const metadata: Metadata = {
  title: "CMHC Mortgage Insurance Calculator Canada 2026",
  description: "Calculate your CMHC mortgage insurance premium instantly. See exactly how much CMHC adds to your mortgage at 5%, 10%, and 15% down payment. Updated for 2026 rules.",
  alternates: { canonical: "https://crystalkey.ca/cmhc-calculator" },
  openGraph: {
    title: "CMHC Mortgage Insurance Calculator Canada 2026 | CrystalKey",
    description: "Calculate your CMHC mortgage insurance premium. Updated for December 2024 rules — $1.5M insured limit.",
    url: "https://crystalkey.ca/cmhc-calculator",
  },
};

const FAQ = [
  { question: "What is CMHC insurance and who needs it?", answer: "CMHC mortgage default insurance is required for any home purchase in Canada where the down payment is less than 20% and the price is $1.5 million or under. It protects the lender, not you, in case you default — but you pay the premium." },
  { question: "How much does CMHC insurance cost?", answer: "The CMHC premium is 4.00% for 5%–9.99% down, 3.10% for 10%–14.99% down, and 2.80% for 15%–19.99% down. The premium is added to your mortgage balance — not paid at closing." },
  { question: "Is CMHC insurance paid upfront?", answer: "The premium is added to your mortgage balance. However, Ontario charges 8% RST, Quebec 9% QST, and Saskatchewan 6% PST on the premium — these provincial taxes are due at closing as a cash payment." },
  { question: "Can I avoid CMHC insurance?", answer: "Yes — by making a down payment of 20% or more. The RRSP Home Buyers Plan allows first-time buyers to withdraw up to $60,000 per person tax-free, which can help reach the 20% threshold." },
  { question: "What changed in December 2024?", answer: "The federal government raised the insured mortgage limit from $1 million to $1.5 million. Buyers purchasing homes between $1M and $1.5M can now access CMHC insurance with less than 20% down — previously impossible." },
];

export default function CMHCPage() {
  return (
    <SiteLayout >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "CMHC Calculator" }]} />
        <div className="mt-8 mb-10">
          <h1 className="font-display text-4xl leading-tight mb-3" style={{ color: "var(--ink)" }}>CMHC Mortgage Insurance Calculator</h1>
          <p className="text-lg" style={{ color: "var(--ink-muted)" }}>See exactly how much CMHC insurance adds to your mortgage and your monthly payment.</p>
        </div>
        <CMHCCalculatorClient />
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-4" style={{ color: "var(--ink)" }}>CMHC premium rates for 2026</h2>
            <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr style={{ background: "var(--green)", color: "#fff" }}>
                  <th className="px-5 py-3.5 text-left font-semibold">Down Payment</th>
                  <th className="px-5 py-3.5 text-right font-semibold">LTV Ratio</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Premium Rate</th>
                </tr></thead>
                <tbody className="divide-y divide-stone-50">
                  {[["5% – 9.99%","90.01% – 95%","4.00%"],["10% – 14.99%","85.01% – 90%","3.10%"],["15% – 19.99%","80.01% – 85%","2.80%"],["20%+","80% or less","No insurance required"]].map(([down,ltv,rate]) => (
                    <tr key={down} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5 font-medium text-stone-800">{down}</td>
                      <td className="px-5 py-3.5 text-right text-stone-600">{ltv}</td>
                      <td className="px-5 py-3.5 text-right font-semibold" style={{ color: rate.includes("No") ? "var(--green-mid)" : "var(--ink)" }}>{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-4" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/cmhc-calculator" />
          </section>
        </div>
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="font-display text-2xl text-white mb-2">Calculate your full mortgage payment</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Including CMHC, amortization schedule, land transfer tax, and total upfront costs.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "#fff", color: "var(--green)" }}>Open Full Mortgage Calculator →</Link>
        </div>
      </div>
    </SiteLayout>
  );
}
