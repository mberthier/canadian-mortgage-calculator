"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MortgageInputs, MortgageOutputs, ValidationErrors, MortgageMode, PaymentFrequency } from "@/lib/types";
import { DEFAULTS } from "@/lib/constants";
import { calculateMortgage } from "@/lib/mortgageMath";

// ── URL param helpers ─────────────────────────────────────────────────────────

function readParams(): Partial<MortgageInputs> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const result: Partial<MortgageInputs> = {};

  const mode = p.get("mode");
  if (mode === "purchase" || mode === "renewal" || mode === "refinance")
    result.mortgageMode = mode;

  const price = Number(p.get("price"));
  if (price > 0) result.homePrice = price;

  const down = Number(p.get("down"));
  if (down > 0 && down < 100) result.downPaymentPercent = down;

  const rate = Number(p.get("rate"));
  if (rate > 0 && rate < 30) result.interestRate = rate;

  const amort = Number(p.get("amort"));
  if ([5,10,15,20,25,30].includes(amort)) result.amortizationYears = amort;

  const term = Number(p.get("term"));
  if ([1,2,3,4,5,7,10].includes(term)) result.termYears = term;

  const freq = p.get("freq");
  if (freq && ["monthly","semi-monthly","biweekly","accelerated-biweekly","weekly","accelerated-weekly"].includes(freq))
    result.paymentFrequency = freq as PaymentFrequency;

  const province = p.get("province");
  if (province && province.length === 2) result.province = province.toUpperCase();

  const balance = Number(p.get("balance"));
  if (balance > 0) result.currentBalance = balance;

  const hv = Number(p.get("hv"));
  if (hv > 0) result.homeValue = hv;

  return result;
}

function buildURL(inputs: MortgageInputs): string {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams();
  p.set("mode",     inputs.mortgageMode);
  p.set("rate",     inputs.interestRate.toFixed(2));
  p.set("amort",    String(inputs.amortizationYears));
  p.set("term",     String(inputs.termYears));
  p.set("freq",     inputs.paymentFrequency);
  p.set("province", inputs.province);

  if (inputs.mortgageMode === "purchase") {
    p.set("price", String(inputs.homePrice));
    p.set("down",  inputs.downPaymentPercent.toFixed(1));
  } else if (inputs.mortgageMode === "renewal") {
    p.set("balance", String(inputs.currentBalance));
  } else {
    p.set("balance", String(inputs.currentBalance));
    p.set("hv",      String(inputs.homeValue));
  }

  return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
}

// ── Init inputs ───────────────────────────────────────────────────────────────

function initInputs(): MortgageInputs {
  const overrides = readParams();
  const homePrice          = overrides.homePrice ?? DEFAULTS.homePrice;
  const downPaymentPercent = overrides.downPaymentPercent ?? DEFAULTS.downPaymentPercent;
  const downPayment        = Math.round(homePrice * (downPaymentPercent / 100));

  return {
    mortgageMode:        overrides.mortgageMode        ?? DEFAULTS.mortgageMode,
    homePrice,
    downPayment,
    downPaymentPercent,
    currentBalance:      overrides.currentBalance      ?? DEFAULTS.currentBalance,
    currentRate:         DEFAULTS.currentRate,
    renewalAmortization: DEFAULTS.renewalAmortization,
    homeValue:           overrides.homeValue           ?? DEFAULTS.homeValue,
    cashOutAmount:       DEFAULTS.cashOutAmount,
    interestRate:        overrides.interestRate        ?? DEFAULTS.interestRate,
    amortizationYears:   overrides.amortizationYears   ?? DEFAULTS.amortizationYears,
    termYears:           overrides.termYears           ?? DEFAULTS.termYears,
    paymentFrequency:    overrides.paymentFrequency    ?? DEFAULTS.paymentFrequency,
    propertyTax:         DEFAULTS.propertyTax,
    condoFees:           DEFAULTS.condoFees,
    heatingCost:         DEFAULTS.heatingCost,
    homeInsurance:       DEFAULTS.homeInsurance,
    extraPayment:        DEFAULTS.extraPayment,
    lumpSumsByYear:      DEFAULTS.lumpSumsByYear,
    includeCMHC:         downPaymentPercent < 20,
    mortgageType:        (downPaymentPercent < 20 ? "insured" : "insurable") as "insured" | "insurable" | "uninsurable",
    closingCosts:        DEFAULTS.closingCosts,
    province:            overrides.province            ?? DEFAULTS.province,
    city:                DEFAULTS.city,
    isFirstTimeBuyer:    DEFAULTS.isFirstTimeBuyer,
    isNewBuild:          DEFAULTS.isNewBuild,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(initInputs);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync inputs → URL (debounced 400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = buildURL(inputs);
      if (url) window.history.replaceState(null, "", url);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputs]);

  const shareURL = useMemo(() => buildURL(inputs), [inputs]);

  const setMode = useCallback((mode: MortgageMode) => {
    setInputs((prev) => ({ ...prev, mortgageMode: mode }));
  }, []);

  const setHomePrice = useCallback((value: number) => {
    setInputs((prev) => {
      const downPayment = Math.round(value * (prev.downPaymentPercent / 100));
      return { ...prev, homePrice: value, downPayment };
    });
  }, []);

  const setDownPayment = useCallback((value: number) => {
    setInputs((prev) => {
      const pct         = prev.homePrice > 0 ? (value / prev.homePrice) * 100 : 0;
      const includeCMHC = pct < 20 ? prev.includeCMHC : false;
      return { ...prev, downPayment: value, downPaymentPercent: pct, includeCMHC };
    });
  }, []);

  const setDownPaymentPercent = useCallback((percent: number) => {
    setInputs((prev) => {
      const downPayment = Math.round(prev.homePrice * (percent / 100));
      const includeCMHC = percent < 20;
      return { ...prev, downPaymentPercent: percent, downPayment, includeCMHC };
    });
  }, []);

  const setLumpSumForYear = useCallback((year: number, amount: number) => {
    setInputs((prev) => ({
      ...prev,
      lumpSumsByYear: { ...prev.lumpSumsByYear, [year]: amount },
    }));
  }, []);

  const setField = useCallback(
    <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    }, [],
  );

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
  ), [inputs]);

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {};
    if (inputs.mortgageMode === "purchase") {
      if (inputs.homePrice <= 0)         e.homePrice = "Enter a valid home price.";
      if (inputs.homePrice > 50_000_000) e.homePrice = "Price seems too high.";
      if (!outputs.isValidDownPayment && inputs.homePrice > 0 && inputs.downPayment > 0) {
        const minPct = ((outputs.minimumDownPayment / inputs.homePrice) * 100).toFixed(1);
        e.downPayment = `Minimum is $${Math.ceil(outputs.minimumDownPayment).toLocaleString("en-CA")} (${minPct}%).`;
      }
      if (inputs.downPayment >= inputs.homePrice)
        e.downPayment = "Down payment cannot exceed home price.";
    }
    if (inputs.mortgageMode === "renewal" || inputs.mortgageMode === "refinance") {
      if (inputs.currentBalance <= 0) e.currentBalance = "Enter your current mortgage balance.";
    }
    if (inputs.mortgageMode === "refinance" && inputs.homeValue > 0) {
      if (outputs.ltv > 0.80) e.ltv = `LTV is ${(outputs.ltv * 100).toFixed(1)}% — refinances are capped at 80% LTV.`;
    }
    if (inputs.interestRate <= 0 || inputs.interestRate > 30)
      e.interestRate = "Enter a rate between 0.1% and 30%.";
    return e;
  }, [inputs, outputs]);

  return {
    inputs, outputs, errors, shareURL,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  };
}
