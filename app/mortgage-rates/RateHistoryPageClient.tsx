"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { RATE_HISTORY, CURRENT_OVERNIGHT, CURRENT_PRIME, RATE_DATA_AS_OF } from "@/lib/rateHistory";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = RATE_HISTORY.find((p) => p.label === label);
  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-sm text-xs">
      <p className="font-semibold text-neutral-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-semibold">{p.value.toFixed(2)}%</span>
        </p>
      ))}
      {point?.event && (
        <p className="mt-1.5 pt-1.5 border-t border-neutral-100 text-neutral-500 font-medium">{point.event}</p>
      )}
    </div>
  );
};

export default function RateHistoryPageClient() {
  const [range, setRange] = useState<"1y" | "2y" | "3y">("3y");

  const cutoff = range === "1y" ? "2025-04" : range === "2y" ? "2024-04" : "2023-01";
  const data = RATE_HISTORY.filter((p) => p.date >= cutoff);

  const minRate = Math.min(...data.map((p) => Math.min(p.overnight, p.fiveYearFixed))) - 0.2;
  const maxRate = Math.max(...data.map((p) => Math.max(p.overnight, p.fiveYearFixed))) + 0.2;
  const tickInterval = range === "1y" ? 1 : range === "2y" ? 2 : 3;

  return (
    <div className="space-y-5">
      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "BoC Overnight Rate", value: `${CURRENT_OVERNIGHT}%`, sub: "Held since Sep 2025", color: "var(--green)" },
          { label: "Prime Rate", value: `${CURRENT_PRIME}%`, sub: "All major banks", color: "var(--ink)" },
          { label: "Best 5yr Fixed", value: "3.89%", sub: "As of Apr 9, 2026", color: "var(--ink)" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl bg-white border border-neutral-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
            <p className="text-xs font-medium text-neutral-600 mt-1">{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-neutral-700">Rate History</p>
          <div className="flex items-center gap-3">
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Updated {RATE_DATA_AS_OF}</p>
            <div className="flex bg-neutral-100 rounded-lg p-0.5 text-xs">
              {(["1y", "2y", "3y"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className="px-3 py-1 rounded-md font-medium transition-colors"
                  style={range === r
                    ? { background: "#fff", color: "var(--green)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
                    : { color: "var(--ink-faint)" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="oGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#999999" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#999999" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: "#999999" }} interval={tickInterval} />
              <YAxis tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: "#999999" }}
                tickFormatter={(v) => `${v}%`}
                domain={[Math.max(0, minRate), maxRate]} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="overnight" name="BoC Overnight"
                stroke="var(--green)" strokeWidth={2.5} fill="url(#oGrad)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="fiveYearFixed" name="5yr Fixed Rate"
                stroke="#999999" strokeWidth={2.5} fill="url(#fGrad)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-neutral-50">
          {[
            { color: "var(--green)", label: "BoC Overnight Rate" },
            { color: "#999999", label: "5-Year Fixed Mortgage Rate" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Key events timeline */}
      <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-neutral-700 mb-4">Key Rate Events</p>
        <div className="space-y-3">
          {RATE_HISTORY.filter((p) => p.event && p.date >= cutoff).map((p) => (
            <div key={p.date} className="flex gap-4 items-start">
              <span className="text-xs font-medium shrink-0 w-16" style={{ color: "var(--ink-faint)" }}>{p.label}</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--green)" }} />
                <span className="text-xs text-neutral-600">{p.event}</span>
                <span className="text-xs ml-auto shrink-0" style={{ color: "var(--green)" }}>
                  {p.overnight}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
