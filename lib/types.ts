export type PaymentFrequency =
  | "monthly"
  | "semi-monthly"
  | "biweekly"
  | "accelerated-biweekly"
  | "weekly"
  | "accelerated-weekly";

export type MortgageMode = "purchase" | "renewal" | "refinance";

export interface MortgageInputs {
  // Mode
  mortgageMode:       MortgageMode;

  // Purchase fields
  homePrice:          number;
  downPayment:        number;
  downPaymentPercent: number;

  // Renewal / refinance fields
  currentBalance:         number;
  currentRate:            number;   // renewal/refinance: existing contracted rate
  currentMonthlyPayment:  number;   // renewal/refinance: actual payment from mortgage statement
  renewalAmortization: number;   // renewal: new amortization (may differ from remaining)
  homeValue:           number;   // refinance: needed for LTV check
  cashOutAmount:       number;   // refinance: equity withdrawn
  monthsRemainingInTerm: number; // refinance: months left in current term
  lenderType:          "bank" | "broker"; // refinance: affects IRD calculation
  knownPenalty:        number;   // refinance: user-supplied break penalty (overrides estimate)

  // Common
  interestRate:       number;
  amortizationYears:  number;
  termYears:          number;
  paymentFrequency:   PaymentFrequency;

  // Monthly costs
  propertyTax:        number;
  condoFees:          number;
  heatingCost:        number;
  homeInsurance:      number;

  // Prepayments
  extraPayment:       number;
  lumpSumsByYear:     Record<number, number>;

  // Switches
  includeCMHC:        boolean;
  closingCosts:       number;

  // Location
  province:           string;
  city:               string;
  isFirstTimeBuyer:   boolean;
  isNewBuild:         boolean;
}

export interface RatePreset {
  label: string;
  rate:  number;
  term:  number;
  type:  "fixed" | "variable";
}

export interface LandTransferTaxResult {
  provincial:            number;
  municipal:             number;
  total:                 number;
  firstTimeBuyerRebate:  number;
  net:                   number;
}

export interface GSTHSTResult {
  gross:          number;
  federalRebate:  number;
  net:            number;
  rate:           number;
  applies:        boolean;
}

export interface AmortizationEntry {
  paymentNumber:        number;
  payment:              number;
  principal:            number;
  interest:             number;
  balance:              number;
  cumulativeInterest:   number;
  cumulativePrincipal:  number;
  lumpSum?:             number;
}

export interface MortgageOutputs {
  periodicPayment:              number;
  monthlyPayment:               number;
  totalMonthlyOwnership:        number;
  totalInterest:                number;
  totalCost:                    number;
  cmhcPremium:                  number;
  cmhcProvincialTax:            number;   // PST/RST/QST on CMHC premium — paid at closing
  insuredMortgage:              number;
  upfrontCash:                  number;
  loanAmount:                   number;
  paymentsPerYear:              number;
  totalPayments:                number;
  mortgageBalance:              number;
  minimumDownPayment:           number;
  isValidDownPayment:           boolean;
  ltv:                          number;   // loan-to-value ratio
  amortizationSchedule:         AmortizationEntry[];
  termEndBalance:               number;
  termInterestPaid:             number;
  termPrincipalPaid:            number;
  stressTestRate:               number;
  stressTestPayment:            number;
  effectiveAmortizationYears:   number;
  interestSavedByLumpSums:      number;
  paymentsSavedByLumpSums:      number;
  ltt:                          LandTransferTaxResult;
  gstHst:                       GSTHSTResult;
  totalUpfrontCash:             number;
  // CMHC comparison (purchase mode, when CMHC applies)
  paymentWithoutCMHC:           number;
  loanWithoutCMHC:              number;
  // Renewal comparison
  currentPayment:               number;   // payment at currentRate (renewal mode)
}

export interface ValidationErrors {
  homePrice?:        string;
  downPayment?:      string;
  interestRate?:     string;
  amortizationYears?: string;
  currentBalance?:   string;
  ltv?:              string;
}
