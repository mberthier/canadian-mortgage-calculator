import type { Metadata } from "next";
import IllustrationLTT from "@/components/illustrations/IllustrationLTT";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import LTTCalculatorClient from "./LTTCalculatorClient";

export const metadata: Metadata = {
  title: "Land Transfer Tax Calculator Canada — All Provinces 2026",
  description: "Calculate land transfer tax for every Canadian province and territory. Includes Ontario, Toronto, BC, Quebec, Manitoba. First-time buyer rebates automatically applied.",
  alternates: { canonical: "https://crystalkey.ca/land-transfer-tax" },
  openGraph: {
    title: "Land Transfer Tax Calculator Canada — All Provinces 2026 | CrystalKey",
    description: "Calculate land transfer tax for all Canadian provinces. First-time buyer rebates included.",
    url: "https://crystalkey.ca/land-transfer-tax",
  },
};

const FAQ = [
  { question: "Which provinces charge land transfer tax in Canada?", answer: "Ontario, British Columbia, Quebec, Manitoba, Nova Scotia, New Brunswick, and Prince Edward Island all charge provincial land transfer tax. Toronto also charges a municipal LTT on top of Ontario's. Alberta, Saskatchewan, Newfoundland, and the three territories do not charge LTT, though Alberta has a small title transfer fee of roughly $600." },
  { question: "When is land transfer tax paid?", answer: "Land transfer tax is paid on closing day — the same day you take possession of the property. It's typically the largest single closing cost and must be paid in cash (it cannot be added to your mortgage)." },
  { question: "Do first-time buyers get a land transfer tax rebate?", answer: "Yes — in several provinces. Ontario rebates up to $4,000. Toronto rebates an additional $4,475. BC offers a full exemption for homes under $500,000 and a partial rebate up to $835,000. Manitoba rebates up to $3,500. PEI rebates up to $2,000." },
  { question: "How much is land transfer tax in Ontario?", answer: "Ontario's LTT uses marginal rates: 0.5% on the first $55,000; 1.0% on $55,000–$250,000; 1.5% on $250,000–$400,000; 2.0% on $400,000–$2,000,000; and 2.5% above $2,000,000. On a $750,000 home, Ontario LTT is $11,475. First-time buyers can get $4,000 rebated." },
  { question: "How much is land transfer tax in Toronto?", answer: "Toronto buyers pay both Ontario's provincial LTT and a Toronto municipal LTT at similar rates. On a $750,000 home, the total LTT in Toronto is approximately $22,950 ($11,475 provincial + $11,475 municipal). First-time buyers get up to $8,475 rebated ($4,000 provincial + $4,475 municipal)." },
  { question: "Does BC have land transfer tax?", answer: "Yes — British Columbia calls it the Property Transfer Tax (PTT). Rates are 1% on the first $200,000; 2% on $200,000–$2,000,000; 3% on $2,000,000–$3,000,000; and 5% above $3,000,000. First-time buyers purchasing homes under $500,000 are exempt, with a partial rebate up to $835,000." },
];

export default function LTTPage() {
  return (
    <SiteLayout >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Land Transfer Tax" }]} />
        <div className="mt-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>Land Transfer Tax Calculator</h1>
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>The biggest closing cost most people forget to plan for. Every province calculated, rebates included.</p>
            </div>
            <div className="shrink-0 w-32 hidden sm:block"><IllustrationLTT /></div>
          </div>
        </div>

        <LTTCalculatorClient />

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Land transfer tax by province
            </h2>
            <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--green)", color: "#fff" }}>
                    <th className="px-5 py-3.5 text-left font-semibold">Province</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Tax</th>
                    <th className="px-5 py-3.5 text-right font-semibold">First-Time Rebate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-sm">
                  {[
                    ["Ontario", "0.5% – 2.5%", "Up to $4,000"],
                    ["Toronto (municipal)", "0.5% – 2.5%", "Up to $4,475"],
                    ["British Columbia", "1% – 5%", "Full (under $500K)"],
                    ["Québec", "0.5% – 2.5%", "None"],
                    ["Manitoba", "0% – 2%", "Up to $3,500"],
                    ["Nova Scotia", "1.5% flat", "None"],
                    ["New Brunswick", "1.0% flat", "None"],
                    ["PEI", "1.0% (over $30K)", "Up to $2,000"],
                    ["Alberta", "~$600 flat fee", "N/A"],
                    ["Saskatchewan / Others", "None", "N/A"],
                  ].map(([prov, tax, rebate]) => (
                    <tr key={prov} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-800">{prov}</td>
                      <td className="px-5 py-3 text-right text-neutral-600">{tax}</td>
                      <td className="px-5 py-3 text-right" style={{ color: rebate === "None" || rebate === "N/A" ? "var(--ink-faint)" : "var(--green-mid)" }}>{rebate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/land-transfer-tax" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">See your complete upfront costs</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Our full calculator shows LTT, CMHC, closing costs, and GST/HST in one place.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#fff", color: "var(--green)" }}>
            Open Full Mortgage Calculator →
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
