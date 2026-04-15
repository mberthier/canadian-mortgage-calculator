"use client";

import React from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  inputs:  MortgageInputs;
  outputs: MortgageOutputs;
}

export default function CashSummary({ inputs, outputs }: Props) {
  if (inputs.mortgageMode !== "purchase") return null;
  if (inputs.homePrice <= 0) return null;

  const lines: { label: string; value: number; negative?: boolean; muted?: boolean }[] = [];

  lines.push({ label: "Down payment", value: inputs.downPayment });

  if (outputs.ltt.provincial > 0 || outputs.ltt.municipal > 0) {
    lines.push({ label: "Land transfer tax", value: outputs.ltt.provincial + outputs.ltt.municipal });
  }

  if (outputs.ltt.firstTimeBuyerRebate > 0) {
    lines.push({ label: "First-time buyer rebate", value: outputs.ltt.firstTimeBuyerRebate, negative: true });
  }

  if (outputs.cmhcProvincialTax > 0) {
    lines.push({ label: "Provincial tax on CMHC", value: outputs.cmhcProvincialTax });
  }

  if (inputs.closingCosts > 0) {
    lines.push({ label: "Closing costs", value: inputs.closingCosts });
  } else {
    lines.push({ label: "Closing costs (est.)", value: 1500, muted: true });
  }

  if (outputs.gstHst.net > 0) {
    lines.push({ label: "GST/HST (new build, net)", value: outputs.gstHst.net });
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>
          Cash needed at closing
        </p>
      </div>

      {/* Line items */}
      <div className="px-6 py-5 space-y-3">
        {lines.map(({ label, value, negative, muted }) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="text-sm" style={{ color: muted ? "var(--ink-faint)" : "var(--ink-mid)" }}>
              {label}
            </span>
            <span className="text-sm font-medium tabular-nums ml-4"
              style={{ color: negative ? "var(--green-mid)" : muted ? "var(--ink-faint)" : "var(--ink)" }}>
              {negative ? "−" : ""}{formatCurrency(value, 0)}
            </span>
          </div>
        ))}

        {/* Divider + total */}
        <div className="pt-3 border-t border-neutral-100">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-neutral-800">Total cash needed</span>
            <span className="text-xl font-bold tabular-nums" style={{ color: "var(--brand-teal)" }}>
              {formatCurrency(outputs.totalUpfrontCash, 0)}
            </span>
          </div>
          {!inputs.closingCosts && (
            <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
              Closing costs estimated at $1,500. Add your actual figure in Refine your estimate.
            </p>
          )}
        </div>

        {/* Monthly carrying cost — only when costs entered */}
        {(inputs.propertyTax > 0 || inputs.heatingCost > 0 || inputs.condoFees > 0 || inputs.homeInsurance > 0) && (
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-semibold text-neutral-800">All-in monthly cost</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                  Mortgage{inputs.propertyTax > 0 ? " + tax" : ""}
                  {inputs.heatingCost > 0 ? " + heat" : ""}
                  {inputs.condoFees > 0 ? " + condo" : ""}
                  {inputs.homeInsurance > 0 ? " + insurance" : ""}
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums" style={{ color: "var(--brand-teal)" }}>
                {formatCurrency(outputs.totalMonthlyOwnership, 0)}/mo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
