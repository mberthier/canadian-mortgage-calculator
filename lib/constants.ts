import { PaymentFrequency, RatePreset } from "./types";

export const CMHC_INSURED_LIMIT = 1_500_000;

export const CMHC_TIERS = [
  { maxLtvPercent: 95, minDownPercent: 5,  premium: 0.04  },
  { maxLtvPercent: 90, minDownPercent: 10, premium: 0.031 },
  { maxLtvPercent: 85, minDownPercent: 15, premium: 0.028 },
  { maxLtvPercent: 80, minDownPercent: 20, premium: 0     },
] as const;

// Provincial/territorial sales tax on CMHC insurance premiums (paid at closing, not added to mortgage)
// ON: 8% RST, QC: 9% QST, SK: 6% PST — all others: 0%
export const CMHC_PROVINCIAL_TAX_RATES: Record<string, number> = {
  ON: 0.08,
  QC: 0.09,
  SK: 0.06,
};

export const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  monthly:                12,
  "semi-monthly":         24,
  biweekly:               26,
  "accelerated-biweekly": 26,
  weekly:                 52,
  "accelerated-weekly":   52,
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly:                "Monthly",
  "semi-monthly":         "Semi-Monthly",
  biweekly:               "Bi-Weekly",
  "accelerated-biweekly": "Accelerated Bi-Weekly",
  weekly:                 "Weekly",
  "accelerated-weekly":   "Accelerated Weekly",
};

export const AMORTIZATION_OPTIONS = [5, 10, 15, 20, 25, 30];
export const TERM_OPTIONS         = [1, 2, 3, 4, 5, 7, 10];

// Live rates as of April 9, 2026
export const RATE_PRESETS: RatePreset[] = [
  { label: "Variable 5yr", rate: 3.35, term: 5,  type: "variable" },
  { label: "Fixed 3yr",    rate: 3.9,  term: 3,  type: "fixed"    },
  { label: "Fixed 5yr",    rate: 3.89, term: 5,  type: "fixed"    },
  { label: "Fixed 1yr",    rate: 4.59, term: 1,  type: "fixed"    },
  { label: "Fixed 10yr",   rate: 4.79, term: 10, type: "fixed"    },
];

export const PROVINCES = [
  { code: "AB", name: "Alberta"                  },
  { code: "BC", name: "British Columbia"         },
  { code: "MB", name: "Manitoba"                 },
  { code: "NB", name: "New Brunswick"            },
  { code: "NL", name: "Newfoundland & Labrador"  },
  { code: "NS", name: "Nova Scotia"              },
  { code: "NT", name: "Northwest Territories"    },
  { code: "NU", name: "Nunavut"                  },
  { code: "ON", name: "Ontario"                  },
  { code: "PE", name: "Prince Edward Island"     },
  { code: "QC", name: "Québec"                   },
  { code: "SK", name: "Saskatchewan"             },
  { code: "YT", name: "Yukon"                    },
];

export const DEFAULTS = {
  mortgageMode:        "purchase" as const,
  homePrice:           750_000,
  downPaymentPercent:  20,
  currentBalance:      400_000,
  homeValue:           600_000,
  cashOutAmount:       0,
  interestRate:        3.89,
  amortizationYears:   25,
  termYears:           5,
  paymentFrequency:    "monthly" as PaymentFrequency,
  propertyTax:         0,
  condoFees:           0,
  heatingCost:         0,
  homeInsurance:       0,
  extraPayment:        0,
  currentRate:         3.5,
  renewalAmortization: 25,
  lumpSumsByYear:      {} as Record<number, number>,
  includeCMHC:         false,
  mortgageType:        "insured" as const,
  closingCosts:        0,
  province:            "ON",
  city:                "",
  isFirstTimeBuyer:    false,
  isNewBuild:          false,
};
