"use client";

import React from "react";
import { MortgageInputs, MortgageOutputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  inputs: MortgageInputs;
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
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>
          Cash needed at closing
        </p>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {lines.map(({ label, value, negative, muted }) => (
          <div key={label} className="flex justify-between text-sm">
            <span style={{ color: muted ? "var(--ink-faint)" : "var(--ink-mid)" }}>
              {label}
              {muted && <span className="text-xs ml-1">(add in Advanced)</span>}
            </span>
            <span className="font-medium tabular-nums"
              style={{ color: negative ? "var(--green-mid)" : muted ? "var(--ink-faint)" : "var(--ink)" }}>
              {negative ? "−" : ""}{formatCurrency(value, 0)}
            </span>
          </div>
        ))}

        <div className="flex justify-between text-sm font-semibold border-t border-neutral-100 pt-2.5 mt-1">
          <span className="text-neutral-800">Total cash needed</span>
          <span style={{ color: "var(--green)" }}>
            {formatCurrency(outputs.totalUpfrontCash, 0)}
          </span>
        </div>

        {!inputs.closingCosts && (
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Closing costs are estimated at $1,500. Add your actual figure in Advanced options.
          </p>
        )}
      </div>
    </div>
  );
}
