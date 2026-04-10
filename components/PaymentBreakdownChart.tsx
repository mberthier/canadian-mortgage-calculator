"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MortgageOutputs, MortgageInputs } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  outputs: MortgageOutputs;
  inputs: MortgageInputs;
}

const COLORS = ["var(--green)", "#2d6a4f", "#c3dece", "#a8a29e", "#ede9e1"];

export default function PaymentBreakdownChart({ outputs, inputs }: Props) {
  const monthlyMortgage = outputs.monthlyPayment;
  const monthlyTax = inputs.propertyTax / 12;
  const condoFees = inputs.condoFees;
  const heating = inputs.heatingCost;

  const data = [
    { name: "Principal & Interest", value: Math.round(monthlyMortgage) },
    { name: "Property Tax", value: Math.round(monthlyTax) },
    { name: "Heating", value: Math.round(heating) },
    { name: "Condo Fees", value: Math.round(condoFees) },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm">
          <p className="font-medium text-slate-900">{item.name}</p>
          <p className="text-slate-600">
            {formatCurrency(item.value)}/mo <span className="text-slate-400">({pct}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Where your money goes each month</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs text-slate-500">Total monthly cost</p>
        <p className="text-xl font-bold text-slate-900">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}
