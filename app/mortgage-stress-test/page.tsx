import type { Metadata } from "next";
import IllustrationStressTest from "@/components/illustrations/IllustrationStressTest";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import FAQAccordion from "@/components/FAQAccordion";
import StressTestClient from "./StressTestClient";

export const metadata: Metadata = {
  title: "Mortgage Stress Test Calculator Canada 2026",
  description: "Calculate your Canadian mortgage stress test rate and qualifying payment. See if you pass the stress test, find your maximum purchase price, and understand the 2024 rule changes. Updated for 2026.",
  alternates: { canonical: "https://crystalkey.ca/mortgage-stress-test" },
  openGraph: {
    title: "Mortgage Stress Test Calculator Canada 2026 | CrystalKey",
    description: "Calculate your stress test qualifying rate and see if you pass. Updated for 2026 rules.",
    url: "https://crystalkey.ca/mortgage-stress-test",
  },
};

const FAQ = [
  {
    question: "What is the Canadian mortgage stress test?",
    answer: "The stress test requires lenders to verify you can afford your mortgage at the greater of your contract rate + 2% or 5.25%. It applies to all mortgages from federally regulated lenders — both insured and uninsured — and was designed to protect Canadians from payment shock if rates rise at renewal.",
  },
  {
    question: "What is the stress test rate in 2026?",
    answer: "The floor rate is 5.25%. At today's best 5-year fixed rate of approximately 3.89%, your stress test rate is 5.89% (contract rate + 2%). If your contract rate is low enough that adding 2% still falls below 5.25%, the floor applies instead.",
  },
  {
    question: "Does the stress test apply at renewal?",
    answer: "If you renew with your existing lender, the stress test does not apply. Since November 2024, straight switches to a new lender at renewal also no longer require re-qualification — a significant policy change that gives Canadian borrowers real leverage at renewal time.",
  },
  {
    question: "How much does the stress test reduce my qualifying power?",
    answer: "Roughly 15–20% compared to qualifying at your actual rate. If you could qualify for a $600,000 mortgage at your contract rate, the stress test typically reduces that to around $500,000–$510,000. The exact impact depends on your income, debts, and the size of the gap between your rate and the stress test rate.",
  },
  {
    question: "Can I avoid the mortgage stress test?",
    answer: "The stress test applies to all federally regulated lenders, which includes the major banks. Some provincial credit unions do not apply it. Private lenders are exempt but charge materially higher rates. For most Canadians buying with a conventional mortgage, the stress test applies.",
  },
  {
    question: "What changed with the stress test in 2024?",
    answer: "The most important change was to renewal: as of November 2024, Canadians can switch lenders at renewal without re-qualifying under the stress test. Previously, switching lenders triggered full re-qualification. This change gave borrowers real bargaining power at renewal for the first time.",
  },
  {
    question: "Does the stress test apply to renewals if I want to increase my mortgage?",
    answer: "Yes. If you are renewing and want to increase your mortgage amount — to access equity, for example — the stress test applies to the increased portion. A straight renewal of the existing balance, or a switch to a new lender at the same balance, does not trigger re-qualification.",
  },
];

export default function StressTestPage() {
  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <PageHeader
          crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Mortgage Stress Test" }]}
          title="Mortgage Stress Test Calculator"
          subtitle="Lenders won't approve you at your actual rate. They will test you at a higher one. Here is exactly how that changes your numbers."
          illustration={<IllustrationStressTest />}
          needs={[
            { label: "Your mortgage amount or home price" },
            { label: "Your interest rate" },
            { label: "Amortization period" },
          ]}
          gets={[
            { label: "Your exact stress test qualifying rate" },
            { label: "Payment at the stress test rate" },
            { label: "Whether you pass GDS and TDS limits" },
            { label: "How much the stress test reduces your max purchase price" },
          ]}
        />

        <StressTestClient />

        <div className="mt-14 space-y-10">

          {/* Section 1 — How it works */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              How the Canadian mortgage stress test works
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Introduced in 2016 and tightened in 2018, the stress test exists for one reason: to make sure Canadians can still afford their mortgage when their term ends and they renew at whatever rate is current. Your five-year fixed rate locks in for the term, but after that you are exposed to market rates. The stress test simulates that exposure upfront.
              </p>
              <p>
                Every federally regulated lender in Canada is required to qualify you at <strong className="text-neutral-800">the greater of your contract rate + 2%, or 5.25%</strong>. They calculate your GDS and TDS ratios at that higher rate — not your actual rate — before approving the mortgage. If your income supports the payment at the stress test rate, you qualify.
              </p>
              <p>
                The stress test was designed precisely for what happened in 2022–2023. Borrowers who had been stress-tested could handle the higher payments when rates spiked. Borrowers who had not been tested could not. That is the point of the policy.
              </p>
            </div>
          </section>

          {/* Section 2 — Rate table */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Stress test rate by contract rate
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--green)", color: "#fff" }}>
                    <th className="px-5 py-3.5 text-left font-semibold">Your contract rate</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Stress test rate</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Rule applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 bg-white">
                  {[
                    ["4.50%", "6.50%", "Contract + 2%"],
                    ["3.89%", "5.89%", "Contract + 2%"],
                    ["3.50%", "5.50%", "Contract + 2%"],
                    ["3.25%", "5.25%", "5.25% floor applies"],
                    ["3.00%", "5.25%", "5.25% floor applies"],
                    ["2.50%", "5.25%", "5.25% floor applies"],
                  ].map(([rate, stress, rule]) => (
                    <tr key={rate} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-800">{rate}</td>
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--green)" }}>{stress}</td>
                      <td className="px-5 py-3 text-right text-xs text-neutral-500">{rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 — November 2024 renewal change */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              The November 2024 renewal rule change
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Before November 2024, switching to a new lender at renewal meant re-qualifying under the full stress test. For borrowers whose financial situation had changed — income drop, higher debts, self-employment income — this effectively trapped them with their existing lender. Their lender knew it, and renewal offers reflected that lack of competition.
              </p>
              <p>
                Since November 21, 2024, straight switches at renewal — same balance, new lender — no longer require stress test re-qualification. This is the most significant change to the Canadian mortgage market in years. It means your existing lender's renewal offer is now genuinely competitive, because you can take your mortgage elsewhere without penalty, without re-qualifying, and without the stress test.
              </p>
              <div className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--green)" }}>What this means at renewal</p>
                <p className="text-sm" style={{ color: "var(--green-mid)" }}>
                  If your lender's renewal offer is above the best available rate, you can now switch lenders without re-qualifying. Get at least one competing quote before signing anything.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Frequently asked questions
            </h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/mortgage-stress-test" />
          </section>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">
            Run your complete mortgage calculation
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            See your full payment, CMHC, land transfer tax, stress test scenarios, and amortization schedule.
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
