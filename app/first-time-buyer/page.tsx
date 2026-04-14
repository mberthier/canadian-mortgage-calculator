import type { Metadata } from "next";
import IllustrationFirstTimeBuyer from "@/components/illustrations/IllustrationFirstTimeBuyer";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "First-Time Home Buyer Guide Canada 2026 — Programs, CMHC & RRSP",
  description: "Complete guide for first-time home buyers in Canada. CMHC insurance, stress test, land transfer tax rebates, RRSP Home Buyers Plan, and FHSA explained clearly.",
  alternates: { canonical: "https://crystalkey.ca/first-time-buyer" },
  openGraph: {
    title: "First-Time Home Buyer Guide Canada 2026 | CrystalKey",
    description: "Everything first-time buyers need to know about buying a home in Canada.",
    url: "https://crystalkey.ca/first-time-buyer",
  },
};

const FAQ = [
  { question: "What programs are available for first-time buyers in Canada?", answer: "Key federal programs include: the Home Buyers Plan (withdraw up to $60,000/person from RRSP tax-free), the First Home Savings Account (FHSA — save up to $40,000 tax-free toward a first home), and the First-Time Home Buyers Tax Credit ($1,500 federal tax saving). Provinces also offer their own LTT rebates." },
  { question: "What is the First Home Savings Account (FHSA)?", answer: "The FHSA is a registered account allowing first-time buyers to contribute up to $8,000/year (lifetime limit $40,000) with tax-deductible contributions and tax-free withdrawals for a home purchase. Unused room carries forward one year. It combines RRSP and TFSA benefits." },
  { question: "How much do I need for a down payment as a first-time buyer?", answer: "Minimum is 5% for homes under $500,000; 5% on first $500K plus 10% on the $500K-$1.5M portion; and 20% above $1.5M. As a first-time buyer, RRSP withdrawals (up to $60K/person via HBP) and FHSA savings can help reach these thresholds." },
  { question: "Do first-time buyers get a land transfer tax rebate?", answer: "In several provinces, yes. Ontario rebates up to $4,000 (plus $4,475 in Toronto). BC offers full exemption under $500K and partial rebate up to $835K. Manitoba rebates up to $3,500. PEI rebates up to $2,000." },
  { question: "What is the First-Time Home Buyers Tax Credit?", answer: "A $10,000 non-refundable federal tax credit for qualifying first-time buyers. At a 15% tax rate, this reduces your federal taxes by $1,500. You claim it on your income tax return for the year you bought the home." },
];

const PROGRAMS = [
  { name: "Home Buyers Plan (HBP)", amount: "$60,000/person", type: "RRSP Withdrawal", detail: "Withdraw from your RRSP tax-free toward a down payment. Repay over 15 years. Updated from $35K in 2024." },
  { name: "First Home Savings Account (FHSA)", amount: "$40,000 lifetime", type: "Tax-Free Savings", detail: "Contribute up to $8,000/year. Tax-deductible contributions + tax-free withdrawals for a first home purchase." },
  { name: "First-Time Home Buyers Tax Credit", amount: "$1,500 tax saving", type: "Federal Tax Credit", detail: "$10,000 non-refundable credit claimed on your tax return the year of purchase." },
  { name: "Ontario LTT Rebate", amount: "Up to $4,000", type: "Provincial Rebate", detail: "Rebate on Ontario land transfer tax for first-time buyers, applied on closing day." },
  { name: "Toronto LTT Rebate", amount: "Up to $4,475", type: "Municipal Rebate", detail: "Additional Toronto rebate. Combined with Ontario = up to $8,475 total rebate in Toronto." },
  { name: "BC PTT Exemption", amount: "Full (under $500K)", type: "Provincial Exemption", detail: "Full property transfer tax exemption for qualifying homes under $500K. Partial rebate up to $835K." },
  { name: "Manitoba LTT Rebate", amount: "Up to $3,500", type: "Provincial Rebate", detail: "First-time buyer rebate on Manitoba land transfer tax." },
];

export default function FirstTimeBuyerPage() {
  return (
    <SiteLayout >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[{ label: "CrystalKey", href: "/" }, { label: "First-Time Buyer Guide" }]} />
        <div className="mt-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>First-Time Home Buyer Guide</h1>
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>Buying your first home is the most financially complex thing most people ever do. Here's the part nobody explains clearly.</p>
            </div>
            <div className="shrink-0 w-32 hidden sm:block"><IllustrationFirstTimeBuyer /></div>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-8 border" style={{ background: "var(--green-light)", borderColor: "var(--green-border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--green)" }}>Use the full calculator with first-time buyer mode</p>
          <p className="text-sm mb-3" style={{ color: "var(--green-mid)" }}>Our mortgage calculator shows your CMHC cost, LTT rebate, and stress test rate with your actual numbers.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--green)", color: "#fff" }}>
            Open Mortgage Calculator →
          </Link>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl mb-5" style={{ color: "var(--ink)" }}>Federal and provincial programs</h2>
            <div className="space-y-3">
              {PROGRAMS.map((p) => (
                <div key={p.name} className="rounded-xl bg-white border border-neutral-100 p-5 flex gap-4">
                  <div className="shrink-0 w-28 text-center">
                    <p className="text-base font-bold" style={{ color: "var(--green)" }}>{p.amount}</p>
                    <p className="text-xs mt-1 rounded-full px-2 py-0.5 inline-block"
                      style={{ background: "var(--green-light)", color: "var(--green)" }}>{p.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 mb-1">{p.name}</p>
                    <p className="text-sm" style={{ color: "var(--ink-mid)" }}>{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4" style={{ color: "var(--ink)" }}>Frequently asked questions</h2>
            <FAQAccordion items={FAQ} pageUrl="https://crystalkey.ca/first-time-buyer" />
          </section>
        </div>

        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="font-display text-2xl text-white mb-2">Calculate your first home purchase</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            See your CMHC cost, LTT rebate, total upfront cash, and full payment breakdown.
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
