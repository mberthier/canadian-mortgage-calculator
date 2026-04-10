# Canadian Mortgage Calculator

A comprehensive, production-ready Canadian mortgage calculator built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Purchase / Renewal / Refinance** modes
- **Accurate Canadian math** — semi-annual compounding per the Interest Act
- **CMHC insurance** — updated Dec 2024 rules, $1.5M limit, correct premium tiers
- **Provincial PST/RST/QST** on CMHC premiums (ON, QC, SK)
- **Land Transfer Tax** — all provinces, Toronto municipal LTT, first-time buyer rebates
- **GST/HST on new builds** with federal new housing rebate
- **Full amortization schedule** — yearly and payment-by-payment views, CSV export
- **Per-year lump sum payments** — applied on anniversary date
- **GDS/TDS affordability calculator** — updated 39%/44% limits (Dec 2024)
- **Renewal stress test** — payment scenarios at +0.5%, +1%, +2%
- **Mortgage scenario comparison** — Scenario A vs B
- **Mortgage break penalty** — 3-month interest vs IRD
- **Live rate presets** — Variable, Fixed 1/3/5/10yr
- **All payment frequencies** — monthly, semi-monthly, bi-weekly, accelerated bi-weekly, weekly, accelerated weekly
- **Mobile-first** with sticky payment footer

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## License

MIT
