import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="rounded-2xl bg-white border border-stone-100 p-8 mt-6">
      <h2 className="font-display text-2xl mb-6" style={{ color: "var(--ink)" }}>
        Why CrystalKey is different
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Correct Canadian math",
            body: "Canadian mortgages compound semi-annually by law — not monthly like in the US. Most calculators get this wrong. Ours correctly converts quoted rates to effective periodic rates using the Interest Act formula.",
          },
          {
            title: "Every upfront cost included",
            body: "Down payment is just the start. We calculate CMHC insurance, provincial land transfer tax (all 13 provinces and territories), Toronto's municipal LTT, GST/HST on new builds, and closing costs — all in one place.",
          },
          {
            title: "Rules updated for 2026",
            body: "The December 2024 rule changes matter: CMHC insured limit raised to $1.5M, GDS limit raised to 39%, minimum down payment thresholds updated. We track every change so you don't have to.",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
              style={{ background: "var(--green-light)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
            </div>
            <h3 className="text-sm font-semibold text-stone-800 mb-2">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>{body}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4 items-center justify-between">
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
