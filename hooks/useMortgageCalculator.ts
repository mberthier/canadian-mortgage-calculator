"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MortgageInputs, MortgageOutputs, ValidationErrors, MortgageMode, PaymentFrequency } from "@/lib/types";
import { DEFAULTS } from "@/lib/constants";
import { calculateMortgage } from "@/lib/mortgageMath";

// ── URL param helpers ──────────────────────────────────────────────────────────

function readParams(): { mode: MortgageMode; overrides: Partial<MortgageInputs> } {
  if (typeof window === "undefined") return { mode: DEFAULTS.mortgageMode as MortgageMode, overrides: {} };
  const p = new URLSearchParams(window.location.search);
  const overrides: Partial<MortgageInputs> = {};

  const mode = (p.get("mode") ?? DEFAULTS.mortgageMode) as MortgageMode;

  const price = Number(p.get("price"));
  if (price > 0) overrides.homePrice = price;

  const down = Number(p.get("down"));
  if (down > 0 && down < 100) overrides.downPaymentPercent = down;

  const rate = Number(p.get("rate"));
  if (rate > 0 && rate < 30) overrides.interestRate = rate;

  const amort = Number(p.get("amort"));
  if ([5,10,15,20,25,30].includes(amort)) overrides.amortizationYears = amort;

  const term = Number(p.get("term"));
  if ([1,2,3,4,5,7,10].includes(term)) overrides.termYears = term;

  const freq = p.get("freq");
  if (freq && ["monthly","semi-monthly","biweekly","accelerated-biweekly","weekly","accelerated-weekly"].includes(freq))
    overrides.paymentFrequency = freq as PaymentFrequency;

  const province = p.get("province");
  if (province && province.length === 2) overrides.province = province.toUpperCase();

  const balance = Number(p.get("balance"));
  if (balance > 0) overrides.currentBalance = balance;

  const hv = Number(p.get("hv"));
  if (hv > 0) overrides.homeValue = hv;

  return { mode, overrides };
}

function buildURL(mode: MortgageMode, inputs: MortgageInputs): string {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams();
  p.set("mode",     mode);
  p.set("rate",     inputs.interestRate.toFixed(2));
  p.set("amort",    String(inputs.amortizationYears));
  p.set("term",     String(inputs.termYears));
  p.set("freq",     inputs.paymentFrequency);
  if (inputs.province) p.set("province", inputs.province);

  if (mode === "purchase") {
    p.set("price", String(inputs.homePrice));
    p.set("down",  inputs.downPaymentPercent.toFixed(1));
  } else if (mode === "renewal") {
    p.set("balance", String(inputs.currentBalance));
  } else {
    p.set("balance", String(inputs.currentBalance));
    p.set("hv",      String(inputs.homeValue));
  }

  return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
}

// ── Fresh inputs per mode (no cross-contamination) ────────────────────────────

function freshPurchase(overrides: Partial<MortgageInputs> = {}): MortgageInputs {
  const homePrice          = overrides.homePrice ?? 0;
  const downPaymentPercent = overrides.downPaymentPercent ?? 0;
  const downPayment        = Math.round(homePrice * (downPaymentPercent / 100));
  return {
    mortgageMode: "purchase",
    homePrice, downPayment, downPaymentPercent,
    currentBalance: 0, currentRate: 0, currentMonthlyPayment: 0, renewalAmortization: DEFAULTS.renewalAmortization,
    homeValue: 0, cashOutAmount: 0,
    interestRate:      overrides.interestRate      ?? 0,
    amortizationYears: overrides.amortizationYears ?? DEFAULTS.amortizationYears,
    termYears:         overrides.termYears         ?? DEFAULTS.termYears,
    paymentFrequency:  overrides.paymentFrequency  ?? DEFAULTS.paymentFrequency,
    propertyTax: 0, condoFees: 0, heatingCost: 0, homeInsurance: 0,
    extraPayment: 0, lumpSumsByYear: {},
    includeCMHC: downPaymentPercent < 20,
    closingCosts: 0,
    province: overrides.province ?? "",
    city: "", isFirstTimeBuyer: false, isNewBuild: false,
  };
}

function freshRenewal(overrides: Partial<MortgageInputs> = {}): MortgageInputs {
  return {
    mortgageMode: "renewal",
    homePrice: 0, downPayment: 0, downPaymentPercent: 0,
    currentBalance: overrides.currentBalance ?? 0,
    currentRate: 0,
    currentMonthlyPayment: 0,
    renewalAmortization: overrides.amortizationYears ?? DEFAULTS.renewalAmortization,
    homeValue: 0, cashOutAmount: 0,
    interestRate:      overrides.interestRate      ?? 0,
    amortizationYears: overrides.amortizationYears ?? DEFAULTS.amortizationYears,
    termYears:         overrides.termYears         ?? DEFAULTS.termYears,
    paymentFrequency:  overrides.paymentFrequency  ?? DEFAULTS.paymentFrequency,
    propertyTax: 0, condoFees: 0, heatingCost: 0, homeInsurance: 0,
    extraPayment: 0, lumpSumsByYear: {},
    includeCMHC: false, closingCosts: 0,
    province: overrides.province ?? "",
    city: "", isFirstTimeBuyer: false, isNewBuild: false,
  };
}

function freshRefinance(overrides: Partial<MortgageInputs> = {}): MortgageInputs {
  return {
    mortgageMode: "refinance",
    homePrice: 0, downPayment: 0, downPaymentPercent: 0,
    currentBalance: overrides.currentBalance ?? 0,
    currentRate: 0,
    currentMonthlyPayment: 0,
    renewalAmortization: DEFAULTS.renewalAmortization,
    homeValue: overrides.homeValue ?? 0,
    cashOutAmount: 0,
    interestRate:      overrides.interestRate      ?? 0,
    amortizationYears: overrides.amortizationYears ?? DEFAULTS.amortizationYears,
    termYears:         overrides.termYears         ?? DEFAULTS.termYears,
    paymentFrequency:  overrides.paymentFrequency  ?? DEFAULTS.paymentFrequency,
    propertyTax: 0, condoFees: 0, heatingCost: 0, homeInsurance: 0,
    extraPayment: 0, lumpSumsByYear: {},
    includeCMHC: false, closingCosts: 0,
    province: overrides.province ?? "",
    city: "", isFirstTimeBuyer: false, isNewBuild: false,
  };
}

// ── Touched fields tracker ────────────────────────────────────────────────────

type TouchedFields = Partial<Record<keyof MortgageInputs, true>>;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMortgageCalculator() {
  const { mode: initialMode, overrides } = useMemo(readParams, []);

  // Three independent input objects — no state bleeds between modes
  const [purchaseInputs,  setPurchaseInputs]  = useState<MortgageInputs>(() =>
    initialMode === "purchase"  ? freshPurchase(overrides)  : freshPurchase()
  );
  const [renewalInputs,   setRenewalInputs]   = useState<MortgageInputs>(() =>
    initialMode === "renewal"   ? freshRenewal(overrides)   : freshRenewal()
  );
  const [refinanceInputs, setRefinanceInputs] = useState<MortgageInputs>(() =>
    initialMode === "refinance" ? freshRefinance(overrides) : freshRefinance()
  );
  const [mode, setModeState] = useState<MortgageMode>(initialMode);

  // Per-mode touched tracking
  const [purchaseTouched,  setPurchaseTouched]  = useState<TouchedFields>({});
  const [renewalTouched,   setRenewalTouched]   = useState<TouchedFields>({});
  const [refinanceTouched, setRefinanceTouched] = useState<TouchedFields>({});

  const inputs  = mode === "purchase" ? purchaseInputs
                : mode === "renewal"  ? renewalInputs
                : refinanceInputs;

  const touched = mode === "purchase" ? purchaseTouched
                : mode === "renewal"  ? renewalTouched
                : refinanceTouched;

  const setInputs = useCallback((updater: (prev: MortgageInputs) => MortgageInputs) => {
    if (mode === "purchase")  setPurchaseInputs(updater);
    else if (mode === "renewal")   setRenewalInputs(updater);
    else                           setRefinanceInputs(updater);
  }, [mode]);

  const markTouched = useCallback((key: keyof MortgageInputs) => {
    const setter = mode === "purchase"  ? setPurchaseTouched
                 : mode === "renewal"   ? setRenewalTouched
                 : setRefinanceTouched;
    setter(prev => ({ ...prev, [key]: true }));
  }, [mode]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync active mode + inputs → URL
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = buildURL(mode, inputs);
      if (url) window.history.replaceState(null, "", url);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [mode, inputs]);

  const shareURL = useMemo(() => buildURL(mode, inputs), [mode, inputs]);

  const setMode = useCallback((m: MortgageMode) => {
    setModeState(m);
  }, []);

  // ── Field setters ──────────────────────────────────────────────────────────

  const setHomePrice = useCallback((value: number) => {
    markTouched("homePrice");
    setInputs((prev) => {
      const downPayment = Math.round(value * (prev.downPaymentPercent / 100));
      return { ...prev, homePrice: value, downPayment };
    });
  }, [setInputs, markTouched]);

  const setDownPayment = useCallback((value: number) => {
    markTouched("downPayment");
    setInputs((prev) => {
      const pct         = prev.homePrice > 0 ? (value / prev.homePrice) * 100 : 0;
      const includeCMHC = pct < 20 ? prev.includeCMHC : false;
      return { ...prev, downPayment: value, downPaymentPercent: pct, includeCMHC };
    });
  }, [setInputs, markTouched]);

  const setDownPaymentPercent = useCallback((percent: number) => {
    markTouched("downPayment");
    setInputs((prev) => {
      const downPayment = Math.round(prev.homePrice * (percent / 100));
      const includeCMHC = percent < 20;
      return { ...prev, downPaymentPercent: percent, downPayment, includeCMHC };
    });
  }, [setInputs, markTouched]);

  const setLumpSumForYear = useCallback((year: number, amount: number) => {
    setInputs((prev) => ({
      ...prev,
      lumpSumsByYear: { ...prev.lumpSumsByYear, [year]: amount },
    }));
  }, [setInputs]);

  const setField = useCallback(
    <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => {
      markTouched(key);
      setInputs((prev) => ({ ...prev, [key]: value }));
    }, [setInputs, markTouched],
  );

  // ── Calculations ───────────────────────────────────────────────────────────

  const outputs = useMemo<MortgageOutputs>(() => calculateMortgage(
    inputs.mortgageMode,
    inputs.homePrice, inputs.downPayment,
    inputs.currentBalance, inputs.homeValue, inputs.cashOutAmount,
    inputs.interestRate, inputs.amortizationYears, inputs.termYears, inputs.paymentFrequency,
    inputs.propertyTax, inputs.condoFees, inputs.heatingCost, inputs.homeInsurance,
    inputs.extraPayment, inputs.lumpSumsByYear,
    inputs.includeCMHC, inputs.closingCosts,
    inputs.province, inputs.city, inputs.isFirstTimeBuyer, inputs.isNewBuild,
    inputs.currentRate, inputs.renewalAmortization,
    inputs.currentMonthlyPayment,
  ), [inputs]);

  // ── Validation — only for touched fields ───────────────────────────────────

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {};
    if (inputs.mortgageMode === "purchase") {
      if (touched.homePrice) {
        if (inputs.homePrice <= 0)         e.homePrice = "Enter a valid home price.";
        if (inputs.homePrice > 50_000_000) e.homePrice = "Price seems too high.";
      }
      if (touched.downPayment) {
        if (!outputs.isValidDownPayment && inputs.homePrice > 0 && inputs.downPayment > 0) {
          const minPct = ((outputs.minimumDownPayment / inputs.homePrice) * 100).toFixed(1);
          e.downPayment = `Minimum is $${Math.ceil(outputs.minimumDownPayment).toLocaleString("en-CA")} (${minPct}%).`;
        }
        if (inputs.downPayment >= inputs.homePrice && inputs.homePrice > 0)
          e.downPayment = "Down payment cannot exceed home price.";
      }
    }
    if (inputs.mortgageMode === "renewal" || inputs.mortgageMode === "refinance") {
      if (touched.currentBalance && inputs.currentBalance <= 0)
        e.currentBalance = "Enter your current mortgage balance.";
    }
    if (inputs.mortgageMode === "refinance" && inputs.homeValue > 0) {
      if (outputs.ltv > 0.80) e.ltv = `LTV is ${(outputs.ltv * 100).toFixed(1)}% — refinances are capped at 80% LTV.`;
    }
    if (touched.interestRate && (inputs.interestRate <= 0 || inputs.interestRate > 30))
      e.interestRate = "Enter a rate between 0.1% and 30%.";
    return e;
  }, [inputs, outputs, touched]);

  return {
    inputs, outputs, errors, shareURL, mode,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  };
}
