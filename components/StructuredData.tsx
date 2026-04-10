// JSON-LD structured data for Google rich results
// Tells Google this is a financial calculator tool
export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://crystalkey.ca/#website",
        "url": "https://crystalkey.ca",
        "name": "CrystalKey",
        "description": "Canada's most complete mortgage calculator",
        "inLanguage": "en-CA",
        "publisher": {
          "@id": "https://crystalkey.ca/#organization",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://crystalkey.ca/#organization",
        "name": "CrystalKey",
        "url": "https://crystalkey.ca",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crystalkey.ca/icon-512.png",
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://crystalkey.ca/#app",
        "name": "Canadian Mortgage Calculator",
        "url": "https://crystalkey.ca",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "inLanguage": "en-CA",
        "isAccessibleForFree": true,
        "description":
          "Calculate Canadian mortgage payments including CMHC insurance, land transfer tax, amortization schedule, GDS/TDS qualification, and renewal stress test.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "CAD",
        },
        "publisher": {
          "@id": "https://crystalkey.ca/#organization",
        },
        "featureList": [
          "CMHC mortgage insurance calculation",
          "Land transfer tax by province",
          "Full amortization schedule with CSV export",
          "GDS and TDS qualification ratios",
          "Mortgage renewal stress test",
          "Per-year lump sum prepayments",
          "Mortgage break penalty calculator",
          "Purchase, renewal, and refinance modes",
          "All Canadian payment frequencies",
          "GST/HST on new builds",
        ],
        "areaServed": {
          "@type": "Country",
          "name": "Canada",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How is a Canadian mortgage calculated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Canadian mortgages use semi-annual compounding per the Interest Act. The nominal rate is converted to an effective annual rate, then to a periodic rate matching your payment frequency. Your payment covers both principal and interest, with more going to interest early in the amortization.",
            },
          },
          {
            "@type": "Question",
            "name": "What is CMHC insurance and when do I need it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CMHC mortgage default insurance is required when your down payment is less than 20% on homes up to $1.5 million. The premium ranges from 2.8% to 4.0% of the mortgage amount and is added to your mortgage balance.",
            },
          },
          {
            "@type": "Question",
            "name": "What is the mortgage stress test in Canada?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Canadian mortgage stress test requires you to qualify at the higher of your contract rate plus 2%, or 5.25%. This ensures you can still afford payments if rates rise.",
            },
          },
          {
            "@type": "Question",
            "name": "What is the minimum down payment in Canada?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The minimum down payment in Canada is 5% on homes up to $500,000, 5% on the first $500,000 plus 10% on the remainder for homes between $500,000 and $1,500,000, and 20% on homes over $1,500,000.",
            },
          },
          {
            "@type": "Question",
            "name": "What are GDS and TDS ratios?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "GDS (Gross Debt Service) and TDS (Total Debt Service) are ratios lenders use to determine how much mortgage you qualify for. As of December 2024, the limits are GDS ≤ 39% and TDS ≤ 44% of your gross income, applied at the stress test rate.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
