import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import StressTestClient from "./StressTestClient";

export const metadata: Metadata = {
  title: "Mortgage Stress Test Calculator Canada 2026",
  description: "Calculate your Canadian mortgage stress test rate and qualifying payment. See if you pass the stress test and find your maximum purchase price. Updated 2026.",
  alternates: { canonical: "https://crystalkey.ca/mortgage-stress-test" },
  openGraph: {
    title: "Mortgage Stress Test Calculator Canada 2026 | CrystalKey",
    description: "Calculate your stress test qualifying rate and see if you pass.",
    url: "https://crystalkey.ca/mortgage-stress-test",
  },
};

const FAQ = [
  { question: "What is the Canadian mortgage stress test?", answer: "The stress test requires lenders to verify you can afford your mortgage at the greater of your contract rate + 2% or 5.25%. It applies to all mortgages from federally regulated lenders, both insured and uninsured, and was introduced to protect Canadians from rising rates at renewal." },
  { question: "What is the stress test rate in 2026?", answer: "The floor is 5.25%. At today's best 5-year fixed rate of 3.89%, your stress test rate is 5.89% (3.89% + 2%). At a variable rate of 3.35%, the stress test rate is also 5.35% (3.35% + 2%)." },
  { question: "Does the stress test apply at renewal?", answer: "If you renew with your existing lender, the stress test does not apply. Since November 2024, straight switches to a new lender at renewal also no longer require re-qualification under the stress test — a significant policy change." },
  { question: "How much does the stress test reduce my maximum mortgage?", answer: "The stress test reduces qualifying power by roughly 15-20% compared to qualifying at your actual rate. If you qualify for $600,000 at your contract rate, you might only qualify for $500,000-$510,000 after the stress test." },
  { question: "Can I avoid the mortgage stress test?", answer: "The stress test applies to federally regulated lenders (banks). Some provincial credit unions don't apply it. Private lenders are exempt but charge higher rates. In practice, most Canadians are subject to the stress test." },
];

export default function StressTestPage() {
  return (
    <SiteLayout >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Mortgage Stress Test" }]} />
        <div className="mt-8 mb-10">
          <h1 className="font-display text-4xl leading-tight mb-3" style={{ color: "var(--ink)" }}>
            Mortgage Stress Test Calculator
          </h1>
          <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
            Find your qualifying rate, see if you pass, and calculate your maximum mortgage under Canada's stress test rules.
          </p>
        </div>

        <StressTestClient />

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>How the Canadian mortgage stress test works</h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>Introduced in 2016 and expanded in 2018, the stress test ensures Canadians can handle higher rates at renewal. Lenders calculate your GDS and TDS ratios at the stress test rate — not your actual rate — before approving your mortgage.</p>
              <p>The stress test rate is the greater of your contract rate + 2% or 5.25%. With today's rates around 3.89% fixed, most borrowers face a stress test rate of 5.89%.</p>
              <p>The stress test was designed exactly for what happened in 2022–2023 when rates spiked: borrowers who passed the stress test could handle the higher payments; those who hadn't been stress tested couldn't.</p>
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-4" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/mortgage-stress-test" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="font-display text-2xl text-white mb-2">Run your complete mortgage calculation</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Full amortization, CMHC, LTT, and renewal stress test scenarios in one place.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#fff", color: "var(--green)" }}>
            Open Full Mortgage Calculator →
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
