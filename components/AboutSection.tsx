import Link from "next/link";
import { IllustrationFormula, IllustrationReceipt, IllustrationCalendar } from "./illustrations/IllustrationAbout";

export default function AboutSection() {
  return (
    <section className="rounded-2xl bg-white border border-neutral-100 p-8 mt-6">
      <h2 className="font-display text-2xl mb-2" style={{ color: "var(--ink)" }}>
        Why CrystalKey is different
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--ink-muted)" }}>
        Most mortgage calculators are close enough. We wanted exact.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        {[
          {
            Illustration: IllustrationFormula,
            title: "Most calculators use the wrong formula",
            body: "Canadian mortgages compound semi-annually by law — not monthly like in the US. That difference quietly inflates your estimated payment on most sites. Ours applies the correct Interest Act formula so the numbers you see are the numbers you'll actually pay.",
          },
          {
            Illustration: IllustrationReceipt,
            title: "The number that matters is bigger than your down payment",
            body: "By the time you close, you've paid your down payment, CMHC insurance (if applicable), land transfer tax for your province, GST on a new build, legal fees, and title insurance. We show all of it — not just the easy part.",
          },
          {
            Illustration: IllustrationCalendar,
            title: "The rules changed last year. We noticed.",
            body: "December 2024 brought the biggest mortgage rule update in years: the insured limit went from $1M to $1.5M, GDS limits were raised to 39%, and minimum down payment thresholds shifted. We track every change so you're always working with current rules.",
          },
        ].map(({ Illustration, title, body }) => (
          <div key={title}>
            <div className="mb-4">
              <Illustration />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-2">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>{body}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-neutral-100 flex flex-wrap gap-4 items-center justify-between">
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          Not sure where to start?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/first-time-buyer", label: "First-time buyer guide" },
            { href: "/cmhc-calculator", label: "CMHC calculator" },
            { href: "/glossary", label: "Mortgage glossary" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: "var(--green-light)", color: "var(--green)", border: "1px solid var(--green-border)" }}>
              {label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
