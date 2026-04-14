"use client";

import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { AmortizationEntry, PaymentFrequency } from "@/lib/types";
import { PAYMENTS_PER_YEAR } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  schedule:          AmortizationEntry[];
  amortizationYears: number;
  frequency:         PaymentFrequency;
  homePrice:         number;     // purchase: price paid. refinance: current home value.
  initialEquity?:    number;     // refinance: equity already built (homeValue - balance)
  showEquity?:       boolean;    // false hides the equity line (renewal mode)
  title?:            string;
}

export default function AmortizationChart({
  schedule, amortizationYears, frequency,
  homePrice, initialEquity = 0, showEquity = true, title,
}: Props) {
  const ppy = PAYMENTS_PER_YEAR[frequency];

  const chartData = useMemo(() => {
    const points: { year: number; balance: number; equity?: number; cumulativeInterest: number }[] = [];
    const first = schedule[0];
    const initialBalance = first ? Math.round(first.balance + first.principal) : 0;

    // Year 0, starting point
    points.push({
      year: 0,
      balance: initialBalance,
      ...(showEquity ? { equity: Math.round(initialEquity) } : {}),
      cumulativeInterest: 0,
    });

    const totalYears = Math.ceil(schedule.length / ppy);
    for (let y = 1; y <= totalYears; y++) {
      const idx   = Math.min(y * ppy - 1, schedule.length - 1);
      const entry = schedule[idx];
      if (!entry) break;
      const equity = showEquity ? Math.max(0, homePrice - entry.balance + initialEquity) : undefined;
      points.push({
        year: y,
        balance: Math.round(entry.balance),
        ...(showEquity ? { equity: Math.round(equity ?? 0) } : {}),
        cumulativeInterest: Math.round(entry.cumulativeInterest),
      });
    }
    return points;
  }, [schedule, ppy, homePrice, initialEquity, showEquity]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2.5 shadow-sm text-sm">
        <p className="font-semibold text-neutral-900 mb-1.5">Year {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs flex justify-between gap-4">
            <span style={{ color: p.stroke }}>{p.name}</span>
            <span className="font-medium text-neutral-800">{formatCurrency(p.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        {title ?? (showEquity ? "Balance, equity & interest over time" : "Balance & interest over time")}
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--green)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0d5a96" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0d5a96" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#999999" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#999999" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
            <XAxis dataKey="year" tickLine={false} axisLine={false}
              tick={{ fontSize: 10, fill: "#999999" }} tickFormatter={(v) => `Yr ${v}`} />
            <YAxis tickLine={false} axisLine={false}
              tick={{ fontSize: 10, fill: "#999999" }}
              tickFormatter={(v) => `$${Math.round(v / 1000)}K`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8}
              formatter={(v) => <span className="text-xs text-neutral-600">{v}</span>} />
            <Area type="monotone" dataKey="balance" name="Remaining Balance"
              stroke="var(--green)" strokeWidth={2} fill="url(#balGrad)" />
            {showEquity && (
              <Area type="monotone" dataKey="equity" name="Home Equity"
                stroke="#0d5a96" strokeWidth={2} fill="url(#eqGrad)" />
            )}
            <Area type="monotone" dataKey="cumulativeInterest" name="Cumulative Interest"
              stroke="#999999" strokeWidth={2} fill="url(#intGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
