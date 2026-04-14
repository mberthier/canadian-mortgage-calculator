"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { AmortizationEntry } from "@/lib/types";
import { PaymentFrequency } from "@/lib/types";
import { PAYMENTS_PER_YEAR } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  schedule: AmortizationEntry[];
  amortizationYears: number;
  frequency: PaymentFrequency;
}

export default function PrincipalInterestByYear({ schedule, amortizationYears, frequency }: Props) {
  const ppy = PAYMENTS_PER_YEAR[frequency];

  const chartData = useMemo(() => {
    const data: { year: number; principal: number; interest: number }[] = [];
    const totalYears = Math.ceil(schedule.length / ppy);
    for (let y = 1; y <= totalYears; y++) {
      const slice = schedule.slice((y - 1) * ppy, y * ppy);
      if (slice.length === 0) break;
      data.push({
        year: y,
        principal: Math.round(slice.reduce((s, e) => s + e.principal, 0)),
        interest: Math.round(slice.reduce((s, e) => s + e.interest, 0)),
      });
    }
    return data;
  }, [schedule, ppy]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const principal = payload.find((p: any) => p.dataKey === "principal")?.value ?? 0;
      const interest = payload.find((p: any) => p.dataKey === "interest")?.value ?? 0;
      const total = principal + interest;
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm">
          <p className="font-semibold text-slate-900 mb-1.5">Year {label}</p>
          <div className="space-y-0.5">
            <p className="text-xs flex justify-between gap-4">
              <span className="text-blue-600">Principal</span>
              <span className="font-medium">{formatCurrency(principal)}</span>
            </p>
            <p className="text-xs flex justify-between gap-4">
              <span className="text-red-500">Interest</span>
              <span className="font-medium">{formatCurrency(interest)}</span>
            </p>
            <p className="text-xs flex justify-between gap-4 border-t border-slate-100 pt-1 mt-1">
              <span className="text-slate-500">Total</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">How each payment splits over time</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v) => `$${Math.round(v / 1000)}K`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
            />
            <Bar dataKey="principal" name="Principal" fill="var(--green)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="interest" name="Interest" fill="#b5d4f4" stackId="a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
