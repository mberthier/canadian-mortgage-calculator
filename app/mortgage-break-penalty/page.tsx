import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";
import BreakPenaltyCalculatorClient from "./BreakPenaltyCalculatorClient";

export const metadata: Metadata = {
  title: "Mortgage Break Penalty Calculator Canada 2026",
  description: "Calculate your Canadian mortgage break penalty. 3-month interest vs IRD. Find out exactly what it costs to exit your mortgage early before you refinance or sell.",
  alternates: { canonical: "https://crystalkey.ca/mortgage-break-penalty" },
  openGraph: {
    title: "Mortgage Break Penalty Calculator Canada 2026 | CrystalKey",
    description: "Calculate 3-month interest vs IRD penalty for breaking your Canadian mortgage early.",
    url: "https://crystalkey.ca/mortgage-break-penalty",
  },
};

const FAQ = [
  {
    question: "What is a mortgage break penalty in Canada?",
    answer: "A mortgage break penalty is a fee your lender charges when you pay off or break your mortgage before the term ends. For fixed-rate mortgages, you pay the greater of three months' interest or the Interest Rate Differential (IRD). For variable-rate mortgages, the penalty is always three months' interest only.",
  },
  {
    question: "What is the Interest Rate Differential (IRD)?",
    answer: "The IRD is the difference between your contracted mortgage rate and the lender's current rate for the remaining term, multiplied by your outstanding balance and the time remaining. When rates have fallen significantly since you locked in, the IRD can be very large, sometimes $15,000–$30,000 or more on big bank mortgages.",
  },
  {
    question: "When would you break a mortgage?",
    answer: "Common reasons include: selling your home before the term ends, refinancing to access equity or get a lower rate, paying off the mortgage in full (inheritance, insurance payout), or switching lenders mid-term to get better terms. Breaking to refinance only makes sense if the interest savings over the remaining term exceed the penalty.",
  },
  {
    question: "Are mortgage break penalties the same at all lenders?",
    answer: "No, this is one of the most important differences between lenders. Major Canadian banks calculate IRD using posted rates (not discounted rates), which significantly inflates the penalty. Monoline lenders typically use contract rates for IRD, resulting in much lower penalties. This is a key reason to consider monoline lenders when getting a mortgage.",
  },
  {
    question: "Can I avoid a mortgage break penalty?",
    answer: "You can minimize your exposure by: choosing an open mortgage (higher rate but no penalty), choosing a shorter term, using a monoline lender with fair IRD calculations, or porting your mortgage when moving. You can also use your annual prepayment privileges to reduce the balance before breaking.",
  },
  {
    question: "How do I calculate break-even on refinancing?",
    answer: "Divide the total break penalty by your monthly interest savings after refinancing. If the penalty is $5,000 and refinancing saves $250/month in interest, your break-even is 20 months. If you plan to stay in the home beyond that point, refinancing makes financial sense.",
  },
];

export default function BreakPenaltyPage() {
  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <PageHeader
          crumbs={[{ label: "CrystalKey", href: "/" }, { label: "Mortgage Break Penalty" }]}
          title="Mortgage Break Penalty Calculator"
          subtitle="Breaking your mortgage before the term ends costs money. Find out exactly how much, before you commit to anything."
          needs={[
            { label: "Current mortgage balance" },
            { label: "Original and current interest rates" },
            { label: "Months remaining in your term" },
            { label: "Mortgage type (fixed or variable)" },
          ]}
          gets={[
            { label: "3-months interest penalty (variable / short fixed)" },
            { label: "IRD penalty estimate (long fixed)" },
            { label: "Which method your lender will likely apply" },
            { label: "Whether breaking early makes financial sense" },
          ]}
        />

        <BreakPenaltyCalculatorClient />

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              How mortgage break penalties work in Canada
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                When you sign a closed mortgage, you're committing to the full term. Breaking that contract, whether to refinance, sell, or pay off early, triggers a prepayment penalty. Canadian law requires lenders to disclose how they calculate this penalty, but the methods vary significantly.
              </p>
              <p>
                For <strong className="text-neutral-800">variable-rate mortgages</strong>, the penalty is always three months' interest on your outstanding balance. Straightforward, predictable, and usually not that large.
              </p>
              <p>
                For <strong className="text-neutral-800">fixed-rate mortgages</strong>, you pay the greater of three months' interest or the Interest Rate Differential (IRD). The IRD is where things get complicated, and expensive.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Why big bank IRD penalties are so much larger
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
              <p>
                Major Canadian banks calculate IRD using their <strong className="text-neutral-800">posted rates</strong>, the advertised rates nobody actually pays, rather than the discounted rate you actually received. This artificially deflates the "current rate" used in the IRD calculation, making the rate differential (and therefore the penalty) much larger than it should be.
              </p>
              <p>
                Monoline lenders (non-bank lenders like First National, MCAP, and others) typically calculate IRD using your actual contracted rate, resulting in penalties that are far more reasonable. This difference can mean paying $2,000 vs $20,000 for the same remaining term and balance.
              </p>
              <div className="rounded-xl p-4 border" style={{ background: "var(--green-light)", borderColor: "var(--green-border)" }}>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--green)" }}>The lesson</p>
                <p style={{ color: "var(--green-mid)" }}>
                  If there's any chance you'll sell or refinance before your term ends, a shorter term or a monoline lender dramatically reduces your penalty exposure. This is worth discussing with a mortgage broker before you sign.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              The break penalty table
            </h2>
            <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--green)", color: "#fff" }}>
                    <th className="px-5 py-3.5 text-left font-semibold">Mortgage type</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Penalty method</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Typical amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {[
                    ["Variable rate", "3 months' interest", "Moderate"],
                    ["Fixed (monoline)", "Greater of 3mo interest or IRD (contract rate)", "Low–moderate"],
                    ["Fixed (big bank)", "Greater of 3mo interest or IRD (posted rate)", "Can be very large"],
                    ["Open mortgage", "No penalty", "None"],
                  ].map(([type, method, amount]) => (
                    <tr key={type} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-800">{type}</td>
                      <td className="px-5 py-3 text-right text-neutral-600">{method}</td>
                      <td className="px-5 py-3 text-right font-medium"
                        style={{ color: amount === "None" ? "var(--green-mid)" : amount.includes("very") ? "#ef4444" : "var(--ink)" }}>
                        {amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: "var(--ink)" }}>
              Frequently asked questions
            </h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/mortgage-break-penalty" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">
            Thinking about refinancing?
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Run your full mortgage calculation to see if the savings outweigh the penalty.
          </p>
          <Link href="/?mode=refinance"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "#fff", color: "var(--green)" }}>
            Open Refinance Calculator →
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
