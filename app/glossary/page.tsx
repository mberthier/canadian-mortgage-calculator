import type { Metadata } from "next";
import IllustrationGlossary from "@/components/illustrations/IllustrationGlossary";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumb from "@/components/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canadian Mortgage Glossary — Terms Explained",
  description: "Plain-language definitions of every Canadian mortgage term. CMHC, amortization, GDS, TDS, stress test, LTV, and 40+ more terms explained clearly.",
  alternates: { canonical: "https://crystalkey.ca/glossary" },
  openGraph: {
    title: "Canadian Mortgage Glossary — Terms Explained | CrystalKey",
    description: "Plain-language definitions of every Canadian mortgage term. 40+ terms explained clearly.",
    url: "https://crystalkey.ca/glossary",
  },
};

interface Term {
  term: string;
  definition: string;
  related?: string[];
}

const TERMS: Term[] = [
  {
    term: "Amortization Period",
    definition: "The total length of time it takes to fully pay off your mortgage through regular payments. In Canada, the most common amortization period is 25 years, though 30-year amortizations are available for uninsured mortgages. A longer amortization means lower monthly payments but significantly more total interest paid over the life of the loan.",
    related: ["Mortgage Term", "Payment Frequency"],
  },
  {
    term: "Amortization Schedule",
    definition: "A complete table showing every mortgage payment over the life of the loan, broken down into principal and interest portions. In the early years, most of each payment goes toward interest. Over time, the principal portion grows. CrystalKey generates a full downloadable amortization schedule for any scenario.",
    related: ["Principal", "Interest", "Amortization Period"],
  },
  {
    term: "Bank of Canada (BoC) Rate",
    definition: "The Bank of Canada's overnight lending rate — the key interest rate that influences all borrowing costs in Canada. When the BoC raises or lowers this rate, variable mortgage rates and the prime rate move almost immediately. Fixed mortgage rates are influenced by bond yields, not directly by the overnight rate.",
    related: ["Prime Rate", "Variable Rate Mortgage", "Fixed Rate Mortgage"],
  },
  {
    term: "Closed Mortgage",
    definition: "A mortgage that restricts prepayment beyond a set annual limit (typically 10–20% of the original principal). Breaking a closed mortgage before the term ends results in a prepayment penalty — either 3 months' interest or the Interest Rate Differential (IRD), whichever is greater. Most Canadian mortgages are closed.",
    related: ["Open Mortgage", "Prepayment Penalty", "IRD"],
  },
  {
    term: "CMHC (Canada Mortgage and Housing Corporation)",
    definition: "The federal Crown corporation that provides mortgage default insurance for high-ratio mortgages (less than 20% down payment). CMHC insurance protects the lender — not the borrower — if you default on your mortgage. The premium (2.8%–4.0% of the insured mortgage amount) is added to your mortgage balance and paid over the amortization period.",
    related: ["High-Ratio Mortgage", "Mortgage Default Insurance", "Down Payment"],
  },
  {
    term: "CMHC Premium",
    definition: "The insurance premium charged on high-ratio mortgages. The rate depends on your loan-to-value ratio: 4.0% for 5–9.99% down, 3.10% for 10–14.99% down, and 2.80% for 15–19.99% down. The premium is added to your mortgage principal — you don't pay it at closing. However, Ontario, Quebec, and Saskatchewan charge a provincial tax on the premium that is due at closing.",
    related: ["CMHC", "High-Ratio Mortgage", "LTV"],
  },
  {
    term: "Collateral Charge Mortgage",
    definition: "A type of mortgage registration where the lender registers a charge against your property for more than the actual mortgage amount — often up to 125% of the home's value. This makes it easier to borrow more later without legal fees but harder to switch lenders at renewal without discharging and re-registering.",
    related: ["Standard Charge Mortgage", "HELOC"],
  },
  {
    term: "Conventional Mortgage",
    definition: "A mortgage where the down payment is 20% or more of the purchase price. Conventional mortgages do not require CMHC mortgage default insurance. They typically offer more flexibility in terms and prepayment options than insured mortgages.",
    related: ["High-Ratio Mortgage", "CMHC", "Down Payment"],
  },
  {
    term: "Down Payment",
    definition: "The upfront cash payment you make when purchasing a home. In Canada, the minimum down payment is 5% for homes under $500,000; 5% on the first $500,000 plus 10% on the portion between $500,000 and $1.5 million; and 20% for homes over $1.5 million. A down payment under 20% requires CMHC mortgage insurance.",
    related: ["CMHC", "High-Ratio Mortgage", "Minimum Down Payment"],
  },
  {
    term: "Effective Annual Rate (EAR)",
    definition: "The true annual interest rate accounting for compounding. In Canada, mortgage rates are compounded semi-annually by law. To find the effective rate, the formula is: EAR = (1 + nominal rate/2)² − 1. This means a quoted rate of 5.0% has an EAR of 5.0625% — slightly higher than a simple annual rate.",
    related: ["Semi-Annual Compounding", "Nominal Rate", "Interest Rate"],
  },
  {
    term: "Fixed Rate Mortgage",
    definition: "A mortgage where the interest rate is locked in for the entire term — your payments stay the same regardless of changes in market rates. Fixed rates are determined by bond yields, particularly the 5-year Government of Canada bond. Fixed mortgages offer payment certainty but often carry higher prepayment penalties than variable rate mortgages.",
    related: ["Variable Rate Mortgage", "Mortgage Term", "Bond Yield"],
  },
  {
    term: "GDS Ratio (Gross Debt Service)",
    definition: "A key affordability measure used by Canadian lenders. GDS is calculated as your annual housing costs (mortgage principal and interest, property taxes, heat, and 50% of condo fees) divided by your gross annual income. As of December 2024, CMHC allows a maximum GDS of 39% for insured mortgages. Most lenders use 32–39% depending on the mortgage type.",
    related: ["TDS Ratio", "Stress Test", "Affordability"],
  },
  {
    term: "HELOC (Home Equity Line of Credit)",
    definition: "A revolving line of credit secured against your home's equity. You can borrow up to 65% of your home's appraised value (combined with your mortgage, total borrowing cannot exceed 80% of home value). HELOCs have variable rates tied to prime, and you pay interest only on the amount you use.",
    related: ["Home Equity", "LTV", "Prime Rate"],
  },
  {
    term: "High-Ratio Mortgage",
    definition: "A mortgage where the down payment is less than 20% of the purchase price. High-ratio mortgages require CMHC (or Sagen/Canada Guaranty) mortgage default insurance. Only available for homes priced up to $1.5 million. Also called an insured mortgage.",
    related: ["CMHC", "Down Payment", "Conventional Mortgage"],
  },
  {
    term: "Home Buyers' Plan (HBP)",
    definition: "A federal program allowing first-time home buyers to withdraw up to $60,000 per person ($120,000 per couple) from their RRSP tax-free toward a home purchase. The withdrawal must be repaid to your RRSP over 15 years. The $60,000 limit was increased from $35,000 in the 2024 federal budget.",
    related: ["RRSP", "First-Time Home Buyer", "Down Payment"],
  },
  {
    term: "Interest Rate Differential (IRD)",
    definition: "A prepayment penalty charged by lenders when you break a fixed-rate mortgage before the term ends. The IRD is calculated as the difference between your contracted rate and the lender's current rate for the remaining term, multiplied by your outstanding balance and the time remaining. IRD penalties can be very large — often $15,000–$30,000 on big bank mortgages.",
    related: ["Prepayment Penalty", "Closed Mortgage", "Fixed Rate Mortgage"],
  },
  {
    term: "Land Transfer Tax (LTT)",
    definition: "A provincial tax paid when purchasing real estate. Most provinces charge LTT based on the purchase price using a marginal tax rate structure. Ontario and British Columbia offer rebates for first-time home buyers. Toronto charges an additional municipal LTT on top of Ontario's provincial tax. Alberta, Saskatchewan, and rural areas of some provinces have no LTT or a nominal title transfer fee only.",
    related: ["Closing Costs", "First-Time Home Buyer", "Property Transfer Tax"],
  },
  {
    term: "Lump Sum Prepayment",
    definition: "An optional extra payment made directly against your mortgage principal, separate from regular payments. Most closed mortgages allow lump sum prepayments of 10–20% of the original principal per year without penalty, typically on your mortgage anniversary date. Lump sum prepayments reduce your outstanding balance and can significantly shorten your amortization.",
    related: ["Prepayment Privilege", "Amortization Period", "Closed Mortgage"],
  },
  {
    term: "LTV (Loan-to-Value Ratio)",
    definition: "Your outstanding mortgage balance divided by your home's appraised value, expressed as a percentage. LTV determines your equity and affects what mortgage products you qualify for. LTV above 80% requires CMHC insurance. Refinances are capped at 80% LTV. HELOCs are available up to 65% LTV (combined with mortgage up to 80%).",
    related: ["CMHC", "Home Equity", "Refinance"],
  },
  {
    term: "Minimum Down Payment",
    definition: "The smallest down payment legally permitted in Canada. For homes under $500,000: 5%. For homes between $500,000 and $1,500,000: 5% on the first $500,000 plus 10% on the remainder. For homes over $1,500,000: 20%. The $1.5 million threshold was increased from $1 million in December 2024.",
    related: ["Down Payment", "CMHC", "High-Ratio Mortgage"],
  },
  {
    term: "Mortgage Broker",
    definition: "A licensed professional who shops your mortgage application to multiple lenders on your behalf, including banks, credit unions, and monoline lenders. Brokers are paid by the lender (not by you) and can often access rates and products not available directly to the public. In Canada, mortgage brokers must be licensed in each province where they operate.",
    related: ["Monoline Lender", "Mortgage Agent"],
  },
  {
    term: "Mortgage Default Insurance",
    definition: "Insurance required on high-ratio mortgages (under 20% down) that protects the lender if the borrower defaults. In Canada, three companies provide this insurance: CMHC (government-owned), Sagen (formerly Genworth), and Canada Guaranty. The premium is paid by the borrower and added to the mortgage balance.",
    related: ["CMHC", "High-Ratio Mortgage", "Sagen"],
  },
  {
    term: "Mortgage Term",
    definition: "The length of your current mortgage contract — typically 1 to 10 years in Canada. At the end of your term, you must renew, refinance, or pay off the remaining balance. The most popular choice in Canada is the 5-year fixed term. The term is different from the amortization period — most mortgages require several renewals before the mortgage is fully paid off.",
    related: ["Amortization Period", "Renewal", "Fixed Rate Mortgage"],
  },
  {
    term: "Open Mortgage",
    definition: "A mortgage that allows you to repay any amount at any time without penalty. Open mortgages offer maximum flexibility but typically carry higher interest rates than closed mortgages — often 1–2% above equivalent closed rates. Useful if you plan to sell or pay off the mortgage soon.",
    related: ["Closed Mortgage", "Prepayment Penalty"],
  },
  {
    term: "Payment Frequency",
    definition: "How often you make mortgage payments. Options in Canada include monthly (12/year), semi-monthly (24/year), biweekly (26/year), accelerated biweekly (26/year but higher amounts), weekly (52/year), and accelerated weekly (52/year but higher amounts). Accelerated payment frequencies effectively make one extra monthly payment per year, reducing amortization significantly.",
    related: ["Accelerated Payments", "Amortization Period"],
  },
  {
    term: "Portable Mortgage",
    definition: "A mortgage feature that allows you to transfer your existing mortgage — including the interest rate and remaining term — to a new property when you move. Portability avoids prepayment penalties when selling and buying simultaneously. Not all mortgages are portable, and lenders may require re-qualification on the new property.",
    related: ["Prepayment Penalty", "Closed Mortgage"],
  },
  {
    term: "Prepayment Penalty",
    definition: "A fee charged by your lender when you pay off your mortgage early or make payments exceeding your annual prepayment privilege. For fixed-rate mortgages, the penalty is the greater of 3 months' interest or the Interest Rate Differential (IRD). For variable-rate mortgages, the penalty is typically just 3 months' interest. Bank IRD penalties are often much larger than those of monoline lenders.",
    related: ["IRD", "Closed Mortgage", "Open Mortgage"],
  },
  {
    term: "Prepayment Privilege",
    definition: "The right to make additional payments toward your mortgage principal without penalty, up to a specified annual limit. Most closed mortgages in Canada allow prepayments of 10–20% of the original principal per year, either as lump sums on your anniversary date or as increased regular payments. These privileges can significantly reduce your total interest cost.",
    related: ["Lump Sum Prepayment", "Closed Mortgage"],
  },
  {
    term: "Prime Rate",
    definition: "The benchmark interest rate used by major Canadian banks to price variable rate mortgages and lines of credit. The prime rate is typically 2.20% above the Bank of Canada overnight rate. When the BoC changes its overnight rate, Canadian banks usually adjust the prime rate by the same amount within a day. As of April 2026, the prime rate is 4.45%.",
    related: ["Bank of Canada Rate", "Variable Rate Mortgage", "HELOC"],
  },
  {
    term: "Principal",
    definition: "The outstanding balance of your mortgage — the amount you actually owe, excluding interest. Each mortgage payment reduces your principal by a small amount (with more going to interest early in the amortization). Extra or accelerated payments reduce principal directly, saving significant interest over time.",
    related: ["Amortization Schedule", "Interest", "Lump Sum Prepayment"],
  },
  {
    term: "Property Tax",
    definition: "An annual tax charged by your municipality based on the assessed value of your property. Rates vary significantly across Canada — from under 0.5% in some BC municipalities to over 1.5% in parts of Ontario and Manitoba. Your lender may collect property tax monthly and remit it on your behalf (tax account). Property tax is included in GDS ratio calculations.",
    related: ["GDS Ratio", "Closing Costs"],
  },
  {
    term: "Refinance",
    definition: "Replacing your existing mortgage with a new one — typically to access home equity, get a lower rate, or change your mortgage terms. Refinancing is capped at 80% of your home's appraised value. It often involves prepayment penalties if done mid-term, plus legal and appraisal fees. Refinancing is distinct from renewal (which happens at the end of your term).",
    related: ["LTV", "Prepayment Penalty", "Home Equity"],
  },
  {
    term: "Renewal",
    definition: "The process of signing a new mortgage contract when your current term expires. At renewal, your lender offers new rates and terms. You can accept, negotiate, or switch to a new lender (called a transfer or switch). Switching lenders at renewal does not incur prepayment penalties. Most Canadians renew every 5 years.",
    related: ["Mortgage Term", "Refinance", "Stress Test"],
  },
  {
    term: "RRSP (Registered Retirement Savings Plan)",
    definition: "A tax-advantaged savings account that can be used toward a home purchase through the Home Buyers' Plan (HBP). First-time buyers can withdraw up to $60,000 per person from their RRSP tax-free for a down payment, with 15 years to repay the amount. RRSP contributions reduce your taxable income in the year of contribution.",
    related: ["Home Buyers' Plan", "First-Time Home Buyer"],
  },
  {
    term: "Semi-Annual Compounding",
    definition: "The compounding frequency required by Canadian law for mortgages (Interest Act). Interest compounds twice per year in Canada, unlike the US where monthly compounding is standard. This makes Canadian mortgage math slightly different — our calculators correctly apply semi-annual compounding when converting quoted rates to effective periodic rates.",
    related: ["Effective Annual Rate", "Interest Rate"],
  },
  {
    term: "Stress Test",
    definition: "A mandatory federal qualification test requiring lenders to verify you can afford mortgage payments at a higher interest rate — specifically the greater of your contract rate + 2% or 5.25%. The stress test applies to both insured and uninsured mortgages. It was introduced to ensure borrowers can handle rate increases at renewal. The stress test uses your GDS and TDS ratios calculated at the higher stress test rate.",
    related: ["GDS Ratio", "TDS Ratio", "Qualifying Rate"],
  },
  {
    term: "TDS Ratio (Total Debt Service)",
    definition: "A key affordability measure including all debt obligations. TDS is calculated as your total annual housing costs (GDS) plus all other monthly debt payments (car loans, student loans, credit card minimums, etc.) divided by gross annual income. The CMHC maximum TDS is 44%. Lenders will not approve a mortgage if your TDS exceeds this limit.",
    related: ["GDS Ratio", "Stress Test", "Affordability"],
  },
  {
    term: "Title Insurance",
    definition: "Insurance protecting against defects in the property title — such as errors in public records, unknown liens, forgery, or encroachments. A one-time premium, typically $200–$400 for residential properties. Required by most lenders. Covers both the lender (lender's policy) and optionally the homeowner (owner's policy).",
    related: ["Closing Costs", "Land Transfer Tax"],
  },
  {
    term: "Transfer/Switch",
    definition: "Moving your mortgage to a new lender at renewal without changing the mortgage amount or amortization. A straight transfer at renewal avoids prepayment penalties. The new lender pays legal and appraisal fees in most cases. You must re-qualify with the new lender, including passing the stress test.",
    related: ["Renewal", "Prepayment Penalty", "Stress Test"],
  },
  {
    term: "Variable Rate Mortgage",
    definition: "A mortgage where the interest rate fluctuates with the lender's prime rate, which tracks the Bank of Canada overnight rate. Variable rates are typically expressed as prime ± a discount (e.g., prime − 0.80%). When the BoC cuts rates, variable mortgage payments drop; when rates rise, payments increase. Prepayment penalties for variable mortgages are typically just 3 months' interest.",
    related: ["Fixed Rate Mortgage", "Prime Rate", "Bank of Canada Rate"],
  },
  {
    term: "Vendor Take-Back Mortgage (VTB)",
    definition: "A financing arrangement where the seller of a property acts as the lender, providing all or part of the mortgage to the buyer. VTBs are used when buyers can't secure full conventional financing or as a negotiating tool. Terms are negotiated between buyer and seller and registered against the property title.",
    related: ["Mortgage Broker", "Conventional Mortgage"],
  },
];

// Group by first letter
const grouped = TERMS.reduce<Record<string, Term[]>>((acc, term) => {
  const letter = term.term[0].toUpperCase();
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(term);
  return acc;
}, {});

const letters = Object.keys(grouped).sort();

export default function GlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Canadian Mortgage Glossary",
    "description": "Plain-language definitions of Canadian mortgage terms",
    "url": "https://crystalkey.ca/glossary",
    "hasDefinedTerm": TERMS.map((t) => ({
      "@type": "DefinedTerm",
      "name": t.term,
      "description": t.definition,
      "inDefinedTermSet": "https://crystalkey.ca/glossary",
    })),
  };

  return (
    <SiteLayout >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb crumbs={[
          { label: "CrystalKey", href: "/" },
          { label: "Glossary" },
        ]} />

        <div className="mt-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "var(--ink)" }}>Canadian Mortgage Glossary</h1>
              <p className="text-lg" style={{ color: "var(--ink-muted)" }}>Every term you'll encounter when getting a mortgage in Canada — explained like a knowledgeable friend, not a legal document.</p>
            </div>
            <div className="shrink-0 w-32 hidden sm:block"><IllustrationGlossary /></div>
          </div>
        </div>

        {/* Letter jump nav */}
        <div className="flex flex-wrap gap-1.5 mb-10 p-4 rounded-2xl border border-neutral-100 bg-white">
          {letters.map((letter) => (
            <a key={letter} href={`#${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors"
              style={{ color: "var(--green)", background: "var(--green-light)" }}
            >
              {letter}
            </a>
          ))}
          <span className="text-xs self-center ml-2" style={{ color: "var(--ink-faint)" }}>
            {TERMS.length} terms
          </span>
        </div>

        {/* Terms by letter */}
        <div className="space-y-12">
          {letters.map((letter) => (
            <section key={letter} id={letter}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--green)" }}>{letter}</h2>
                <div className="flex-1 h-px" style={{ background: "#e8e8e8" }} />
              </div>
              <div className="space-y-6">
                {grouped[letter].map((term) => (
                  <article key={term.term}
                    id={term.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    className="rounded-2xl bg-white border border-neutral-100 p-6">
                    <h3 className="text-base font-semibold text-neutral-900 mb-2">{term.term}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mid)" }}>
                      {term.definition}
                    </p>
                    {term.related && term.related.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-50">
                        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>Related:</span>
                        {term.related.map((r) => {
                          const slug = r.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                          return (
                            <a key={r} href={`#${slug}`}
                              className="text-xs px-2 py-0.5 rounded-full transition-colors"
                              style={{ background: "var(--green-light)", color: "var(--green)" }}>
                              {r}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "var(--green)" }}>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Ready to run the numbers?</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Now that you know the terms, put them to work.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: "#fff", color: "var(--green)" }}>
            Open the Mortgage Calculator →
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
