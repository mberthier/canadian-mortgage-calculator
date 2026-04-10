"use client";

import { useState, useCallback, useMemo } from "react";
import { MortgageInputs, MortgageOutputs, ValidationErrors, MortgageMode } from "@/lib/types";
import { DEFAULTS } from "@/lib/constants";
import { calculateMortgage } from "@/lib/mortgageMath";

function initInputs(): MortgageInputs {
  const homePrice          = DEFAULTS.homePrice;
  const downPaymentPercent = DEFAULTS.downPaymentPercent;
  const downPayment        = Math.round(homePrice * (downPaymentPercent / 100));
  return {
    mortgageMode:        DEFAULTS.mortgageMode,
    homePrice,
    downPayment,
    downPaymentPercent,
    currentBalance:      DEFAULTS.currentBalance,
    homeValue:           DEFAULTS.homeValue,
    cashOutAmount:       DEFAULTS.cashOutAmount,
    interestRate:        DEFAULTS.interestRate,
    amortizationYears:   DEFAULTS.amortizationYears,
    termYears:           DEFAULTS.termYears,
    paymentFrequency:    DEFAULTS.paymentFrequency,
    propertyTax:         DEFAULTS.propertyTax,
    condoFees:           DEFAULTS.condoFees,
    heatingCost:         DEFAULTS.heatingCost,
    homeInsurance:       DEFAULTS.homeInsurance,
    extraPayment:        DEFAULTS.extraPayment,
    lumpSumsByYear:      DEFAULTS.lumpSumsByYear,
    includeCMHC:         downPaymentPercent < 20,
    closingCosts:        DEFAULTS.closingCosts,
    province:            DEFAULTS.province,
    city:                DEFAULTS.city,
    isFirstTimeBuyer:    DEFAULTS.isFirstTimeBuyer,
    isNewBuild:          DEFAULTS.isNewBuild,
  };
}

export function useMortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(initInputs);

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
      const pct          = prev.homePrice > 0 ? (value / prev.homePrice) * 100 : 0;
      const includeCMHC  = pct < 20 ? prev.includeCMHC : false;
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
  ), [inputs]);

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {};
    if (inputs.mortgageMode === "purchase") {
      if (inputs.homePrice <= 0)           e.homePrice = "Enter a valid home price.";
      if (inputs.homePrice > 50_000_000)   e.homePrice = "Price seems too high.";
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
    inputs, outputs, errors,
    setMode, setHomePrice, setDownPayment, setDownPaymentPercent,
    setLumpSumForYear, setField,
  };
}
