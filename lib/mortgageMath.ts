import {
  PaymentFrequency, AmortizationEntry, MortgageOutputs,
  LandTransferTaxResult, GSTHSTResult, MortgageMode,
} from "./types";
import { CMHC_TIERS, CMHC_INSURED_LIMIT, CMHC_PROVINCIAL_TAX_RATES, PAYMENTS_PER_YEAR } from "./constants";

// ─── Down payment ────────────────────────────────────────────────────────────

export function calculateMinimumDownPayment(homePrice: number): number {
  if (homePrice <= 0)              return 0;
  if (homePrice > 1_500_000)       return homePrice * 0.2;
  if (homePrice <= 500_000)        return homePrice * 0.05;
  return 500_000 * 0.05 + (homePrice - 500_000) * 0.1;
}

// ─── CMHC ────────────────────────────────────────────────────────────────────

export function calculateCMHCPremium(homePrice: number, downPayment: number): number {
  if (homePrice <= 0 || downPayment <= 0) return 0;
  const downPct = downPayment / homePrice;
  if (downPct >= 0.2)                    return 0;
  if (homePrice > CMHC_INSURED_LIMIT)    return 0;
  const tier = CMHC_TIERS.find((t) => downPct * 100 >= t.minDownPercent);
  if (!tier || tier.premium === 0)       return 0;
  return (homePrice - downPayment) * tier.premium;
}

export function calculateCMHCProvincialTax(cmhcPremium: number, province: string): number {
  const rate = CMHC_PROVINCIAL_TAX_RATES[province] ?? 0;
  return cmhcPremium * rate;
}

// ─── Rate helpers (Canadian semi-annual compounding per Interest Act) ─────────

export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  return PAYMENTS_PER_YEAR[frequency];
}

function getPeriodicRate(annualRate: number, paymentsPerYear: number): number {
  const semi = annualRate / 100 / 2;
  const eff  = Math.pow(1 + semi, 2) - 1;
  return Math.pow(1 + eff, 1 / paymentsPerYear) - 1;
}

// ─── Payment calculation ─────────────────────────────────────────────────────

export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  frequency: PaymentFrequency,
): number {
  if (principal <= 0 || annualRate <= 0 || amortizationYears <= 0) return 0;
  const ppy = getPaymentsPerYear(frequency);

  if (frequency === "accelerated-biweekly" || frequency === "accelerated-weekly") {
    const mr = getPeriodicRate(annualRate, 12);
    const n  = amortizationYears * 12;
    if (mr === 0) return principal / n;
    const mp = (principal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    return frequency === "accelerated-biweekly" ? mp / 2 : mp / 4;
  }

  const pr = getPeriodicRate(annualRate, ppy);
  const n  = amortizationYears * ppy;
  if (pr === 0) return principal / n;
  return (principal * pr * Math.pow(1 + pr, n)) / (Math.pow(1 + pr, n) - 1);
}

// ─── Amortization schedule ───────────────────────────────────────────────────

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  frequency: PaymentFrequency,
  periodicPayment: number,
  extraPayment: number,
  lumpSumsByYear: Record<number, number>,
): AmortizationEntry[] {
  if (principal <= 0 || annualRate <= 0) return [];

  const ppy          = getPaymentsPerYear(frequency);
  const periodicRate = getPeriodicRate(annualRate, ppy);
  const maxPayments  = amortizationYears * ppy + ppy;

  const schedule: AmortizationEntry[] = [];
  let balance             = principal;
  let cumulativeInterest  = 0;
  let cumulativePrincipal = 0;
  let paymentNumber       = 0;

  while (balance > 0.01 && paymentNumber < maxPayments) {
    paymentNumber++;

    const interestCharge = balance * periodicRate;
    const totalPayment   = Math.min(periodicPayment + extraPayment, balance + interestCharge);
    const principalPaid  = totalPayment - interestCharge;
    balance              = Math.max(0, balance - principalPaid);
    cumulativeInterest  += interestCharge;
    cumulativePrincipal += principalPaid;

    const entry: AmortizationEntry = {
      paymentNumber,
      payment: totalPayment,
      principal: principalPaid,
      interest: interestCharge,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    };
    schedule.push(entry);

    // Apply lump sum on mortgage anniversary date — after last payment of year N
    const isLastPaymentOfYear = paymentNumber % ppy === 0;
    const completedYear       = paymentNumber / ppy;
    const lumpAmount          = lumpSumsByYear[completedYear] ?? 0;

    if (isLastPaymentOfYear && lumpAmount > 0 && balance > 0.01) {
      const applied             = Math.min(lumpAmount, balance);
      balance                   = Math.max(0, balance - applied);
      cumulativePrincipal      += applied;
      entry.lumpSum             = applied;
      entry.balance             = balance;
      entry.cumulativePrincipal = cumulativePrincipal;
    }
  }

  return schedule;
}

// ─── Land Transfer Tax ───────────────────────────────────────────────────────

export function calculateLandTransferTax(
  price: number,
  province: string,
  city: string,
  isFirstTimeBuyer: boolean,
): LandTransferTaxResult {
  let provincial           = 0;
  let municipal            = 0;
  let firstTimeBuyerRebate = 0;

  const bracket = (p: number, tiers: [number, number, number][]) =>
    tiers.reduce((tax, [from, to, rate]) =>
      p > from ? tax + (Math.min(p, to === Infinity ? p : to) - from) * rate : tax, 0);

  switch (province) {
    case "ON":
      provincial = bracket(price, [
        [0,          55_000,    0.005],
        [55_000,    250_000,    0.01 ],
        [250_000,   400_000,    0.015],
        [400_000, 2_000_000,    0.02 ],
        [2_000_000, Infinity,   0.025],
      ]);
      if (isFirstTimeBuyer) firstTimeBuyerRebate = Math.min(provincial, 4_000);
      if (city === "Toronto") {
        municipal = bracket(price, [
          [0,          55_000,   0.005],
          [55_000,    400_000,   0.01 ],
          [400_000, 2_000_000,   0.02 ],
          [2_000_000, Infinity,  0.025],
        ]);
        if (isFirstTimeBuyer) firstTimeBuyerRebate += Math.min(municipal, 4_475);
      }
      break;
    case "BC":
      provincial = bracket(price, [
        [0,         200_000,   0.01],
        [200_000, 2_000_000,   0.02],
        [2_000_000, 3_000_000, 0.03],
        [3_000_000, Infinity,  0.05],
      ]);
      if (isFirstTimeBuyer && price <= 835_000)
        firstTimeBuyerRebate = price <= 500_000
          ? provincial
          : provincial * ((835_000 - price) / 335_000);
      break;
    case "QC":
      provincial = bracket(price, [
        [0,          53_200,  0.005],
        [53_200,    266_200,  0.01 ],
        [266_200,   532_500,  0.015],
        [532_500, 1_064_000,  0.02 ],
        [1_064_000, Infinity, 0.025],
      ]);
      break;
    case "MB":
      provincial = bracket(price, [
        [0,       30_000,  0    ],
        [30_000,  90_000,  0.005],
        [90_000, 150_000,  0.01 ],
        [150_000, 200_000, 0.015],
        [200_000, Infinity, 0.02 ],
      ]);
      if (isFirstTimeBuyer) firstTimeBuyerRebate = Math.min(provincial, 3_500);
      break;
    case "NS": provincial = price * 0.015; break;
    case "NB": provincial = price * 0.01;  break;
    case "PE":
      provincial = bracket(price, [[0, 30_000, 0], [30_000, Infinity, 0.01]]);
      if (isFirstTimeBuyer) firstTimeBuyerRebate = Math.min(provincial, 2_000);
      break;
    case "AB":
      provincial = Math.min(600 + price * 0.00015, 1_500); // title transfer fee
      break;
    default:
      provincial = 0;
  }

  const total = provincial + municipal;
  const net   = Math.max(0, total - firstTimeBuyerRebate);
  return { provincial, municipal, total, firstTimeBuyerRebate, net };
}

// ─── GST / HST on new builds ─────────────────────────────────────────────────

export function calculateGSTHST(
  price: number,
  province: string,
  isNewBuild: boolean,
): GSTHSTResult {
  if (!isNewBuild || price <= 0)
    return { gross: 0, federalRebate: 0, net: 0, rate: 0, applies: false };

  const rates: Record<string, number> = {
    ON: 0.13, NS: 0.15, NB: 0.15, NL: 0.15, PE: 0.15,
    AB: 0.05, BC: 0.05, MB: 0.05, QC: 0.05, SK: 0.05,
    NT: 0.05, NU: 0.05, YT: 0.05,
  };
  const rate         = rates[province] ?? 0.05;
  const gross        = price * rate;
  const federalGross = price * 0.05;

  // Federal new housing rebate: 36% of 5% GST, max $6,300, phases out $350K–$450K
  let phaseFactor = 1.0;
  if      (price > 450_000) phaseFactor = 0;
  else if (price > 350_000) phaseFactor = (450_000 - price) / 100_000;
  const federalRebate = Math.min(federalGross * 0.36 * phaseFactor, 6_300);
  const net           = Math.max(0, gross - federalRebate);

  return { gross, federalRebate, net, rate, applies: true };
}

// ─── Mortgage break penalty (simplified) ─────────────────────────────────────

export interface BreakPenaltyResult {
  threeMonthInterest: number;
  ird:                number;
  penalty:            number;
  isIRD:              boolean;
}

export function calculateBreakPenalty(
  remainingBalance: number,
  originalRate: number,        // your contracted rate (%)
  currentPostedRate: number,   // current posted rate for similar remaining term (%)
  remainingMonths: number,
  isVariable: boolean,
): BreakPenaltyResult {
  if (remainingBalance <= 0) return { threeMonthInterest: 0, ird: 0, penalty: 0, isIRD: false };

  // 3-month interest: balance × annual rate × 3/12
  const threeMonthInterest = remainingBalance * (originalRate / 100) * (3 / 12);

  // IRD: balance × rate difference × remaining years
  // Variable mortgages only ever pay 3-month interest
  const rateDiff = isVariable ? 0 : Math.max(0, originalRate - currentPostedRate);
  const ird = isVariable ? 0 : remainingBalance * (rateDiff / 100) * (remainingMonths / 12);

  const penalty = isVariable ? threeMonthInterest : Math.max(threeMonthInterest, ird);
  const isIRD   = !isVariable && ird > threeMonthInterest;

  return { threeMonthInterest, ird, penalty, isIRD };
}

// ─── Remaining amortization solver ───────────────────────────────────────────

export function solveRemainingAmortization(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
): number | null {
  if (balance <= 0 || annualRate <= 0 || monthlyPayment <= 0) return null;
  const minPmt = calculateMortgagePayment(balance, annualRate, 30, "monthly");
  if (monthlyPayment < minPmt) return null;
  const maxPmt = calculateMortgagePayment(balance, annualRate, 1, "monthly");
  if (monthlyPayment >= maxPmt) return 1;
  let lo = 0.5, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calculateMortgagePayment(balance, annualRate, mid, "monthly");
    if (Math.abs(pmt - monthlyPayment) < 0.005) return mid;
    pmt > monthlyPayment ? lo = mid : hi = mid;
  }
  return (lo + hi) / 2;
}

// ─── Main calculation ────────────────────────────────────────────────────────

export function calculateMortgage(
  mode: MortgageMode,
  homePrice: number,
  downPayment: number,
  currentBalance: number,
  homeValue: number,
  cashOutAmount: number,
  annualRate: number,
  amortizationYears: number,
  termYears: number,
  frequency: PaymentFrequency,
  propertyTax: number,
  condoFees: number,
  heatingCost: number,
  homeInsurance: number,
  extraPayment: number,
  lumpSumsByYear: Record<number, number>,
  includeCMHC: boolean,
  closingCosts: number,
  province: string,
  city: string,
  isFirstTimeBuyer: boolean,
  isNewBuild: boolean,
  currentRate: number = 0,
  currentMonthlyPayment: number = 0,
  renewalAmortization: number = 0,
): MortgageOutputs {
  // ── Loan amount by mode ──────────────────────────────────────────────────
  const isPurchase  = mode === "purchase";
  const isRenewal   = mode === "renewal";
  const isRefinance = mode === "refinance";

  // Renewal: use renewalAmortization
  // Refinance: when amortizationYears=0, solve from current balance/rate/payment
  // Purchase: use amortizationYears directly
  const solvedRefinanceAmort = isRefinance && amortizationYears === 0 && currentMonthlyPayment > 0
    ? solveRemainingAmortization(currentBalance, currentRate, currentMonthlyPayment)
    : null;
  const amortForCalc = isRenewal
    ? (renewalAmortization > 0 ? renewalAmortization : 25)
    : isRefinance
      ? (amortizationYears > 0 ? amortizationYears : (solvedRefinanceAmort ?? 25))
      : amortizationYears;

  const minimumDownPayment = isPurchase ? calculateMinimumDownPayment(homePrice) : 0;
  const isValidDownPayment = isPurchase
    ? downPayment >= minimumDownPayment && downPayment < homePrice && downPayment > 0
    : true;

  // CMHC only applies on purchase
  const cmhcPremium = isPurchase && includeCMHC && isValidDownPayment
    ? calculateCMHCPremium(homePrice, downPayment) : 0;
  const cmhcProvincialTax = cmhcPremium > 0 ? calculateCMHCProvincialTax(cmhcPremium, province) : 0;

  let loanAmount: number;
  let ltv: number;

  if (isPurchase) {
    const baseLoan  = Math.max(0, homePrice - downPayment);
    loanAmount = baseLoan + cmhcPremium;
    ltv        = homePrice > 0 ? loanAmount / homePrice : 0;
  } else if (isRenewal) {
    loanAmount = Math.max(0, currentBalance);
    ltv        = homeValue > 0 ? loanAmount / homeValue : 0;
  } else {
    // refinance — max 80% LTV
    loanAmount = Math.max(0, currentBalance + cashOutAmount);
    ltv        = homeValue > 0 ? loanAmount / homeValue : 0;
  }

  const insuredMortgage = loanAmount; // for purchase, already includes CMHC

  // ── Payment calculation ───────────────────────────────────────────────────
  const periodicPayment = calculateMortgagePayment(loanAmount, annualRate, amortForCalc, frequency);
  const ppy             = getPaymentsPerYear(frequency);

  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount, annualRate, amortForCalc, frequency,
    periodicPayment, extraPayment, lumpSumsByYear,
  );

  const lastEntry     = amortizationSchedule[amortizationSchedule.length - 1];
  const totalInterest = lastEntry?.cumulativeInterest ?? 0;
  const totalCost     = loanAmount + totalInterest;
  const effectiveAmortizationYears = amortizationSchedule.length / ppy;

  // ── Interest saved by lump sums ───────────────────────────────────────────
  let interestSavedByLumpSums = 0;
  let paymentsSavedByLumpSums = 0;
  const hasLumpSums = Object.values(lumpSumsByYear).some((v) => v > 0);
  if (hasLumpSums) {
    const noLumps = generateAmortizationSchedule(
      loanAmount, annualRate, amortForCalc, frequency, periodicPayment, extraPayment, {},
    );
    const intNoLumps = noLumps[noLumps.length - 1]?.cumulativeInterest ?? 0;
    interestSavedByLumpSums = Math.max(0, intNoLumps - totalInterest);
    paymentsSavedByLumpSums = Math.max(0, noLumps.length - amortizationSchedule.length);
  }

  // ── Monthly ownership ─────────────────────────────────────────────────────
  const monthlyPayment        = calculateMortgagePayment(loanAmount, annualRate, amortForCalc, "monthly");
  const totalMonthlyOwnership = monthlyPayment + propertyTax / 12 + condoFees + heatingCost + homeInsurance / 12;

  // ── Term summary ──────────────────────────────────────────────────────────
  const termPayments     = Math.min(termYears * ppy, amortizationSchedule.length);
  const termSlice        = amortizationSchedule.slice(0, termPayments);
  const termInterestPaid  = termSlice.reduce((s, e) => s + e.interest, 0);
  const termPrincipalPaid = termSlice.reduce((s, e) => s + e.principal + (e.lumpSum ?? 0), 0);
  const termEndBalance    = termSlice.length > 0 ? termSlice[termSlice.length - 1].balance : loanAmount;

  // ── Stress test ───────────────────────────────────────────────────────────
  const stressTestRate    = Math.max(annualRate + 2, 5.25);
  const stressTestPayment = calculateMortgagePayment(loanAmount, stressTestRate, amortForCalc, frequency);

  // ── LTT / GST/HST (purchase only) ────────────────────────────────────────
  const ltt    = isPurchase ? calculateLandTransferTax(homePrice, province, city, isFirstTimeBuyer)
                            : { provincial: 0, municipal: 0, total: 0, firstTimeBuyerRebate: 0, net: 0 };
  const gstHst = isPurchase ? calculateGSTHST(homePrice, province, isNewBuild)
                            : { gross: 0, federalRebate: 0, net: 0, rate: 0, applies: false };

  // ── Upfront cash ─────────────────────────────────────────────────────────
  const upfrontCash      = isPurchase ? downPayment + closingCosts : closingCosts;
  const totalUpfrontCash = isPurchase
    ? downPayment + ltt.net + closingCosts + gstHst.net + cmhcProvincialTax
    : closingCosts;

  // ── Without-CMHC comparison (purchase mode) ───────────────────────────────
  const loanWithoutCMHC    = isPurchase ? Math.max(0, homePrice * 0.8) : 0;
  const paymentWithoutCMHC  = isPurchase ? calculateMortgagePayment(loanWithoutCMHC, annualRate, amortizationYears, frequency) : 0;
  // Renewal: current payment at old contracted rate + remaining amortization
  // Use the actual payment from the user's mortgage statement when provided
  // Fall back to estimate from currentRate only if not provided
  const currentPayment = currentMonthlyPayment > 0
    ? currentMonthlyPayment
    : (isRenewal || isRefinance) && currentRate > 0 && currentBalance > 0
      ? calculateMortgagePayment(currentBalance, currentRate, amortizationYears, frequency)
      : 0;

  return {
    periodicPayment,
    monthlyPayment,
    totalMonthlyOwnership,
    totalInterest,
    totalCost,
    cmhcPremium,
    cmhcProvincialTax,
    insuredMortgage,
    upfrontCash,
    loanAmount,
    paymentsPerYear: ppy,
    totalPayments: amortizationSchedule.length,
    mortgageBalance: termEndBalance,
    minimumDownPayment,
    isValidDownPayment,
    ltv,
    amortizationSchedule,
    termEndBalance,
    termInterestPaid,
    termPrincipalPaid,
    stressTestRate,
    stressTestPayment,
    effectiveAmortizationYears,
    interestSavedByLumpSums,
    paymentsSavedByLumpSums,
    ltt,
    gstHst,
    totalUpfrontCash,
    paymentWithoutCMHC,
    loanWithoutCMHC,
    currentPayment,
  };
}
