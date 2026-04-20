"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { RATE_HISTORY } from "@/lib/rateHistory";

interface Props {
  currentRate:   number;
  onSelectRate?: (rate: number) => void;
  bocOvernight?: number;
  prime?:        number;
  best5yrFixed?: number;
  updatedLabel?: string;
}

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
        <p className="mt-1.5 pt-1.5 border-t border-neutral-100 text-neutral-500">{point.event}</p>
      )}
    </div>
  );
};

export default function RateHistoryChart({
  currentRate,
  onSelectRate,
  bocOvernight = 2.25,
  prime = 4.45,
  best5yrFixed = 3.89,
  updatedLabel = "April 9, 2026",
}: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<"1y" | "2y" | "3y">("2y");

  const cutoff = range === "1y" ? "2025-04" : range === "2y" ? "2024-04" : "2023-01";
  const data = RATE_HISTORY.filter((p) => p.date >= cutoff);

  const minRate = Math.min(...data.map((p) => Math.min(p.overnight, p.fiveYearFixed))) - 0.2;
  const maxRate = Math.max(...data.map((p) => Math.max(p.overnight, p.fiveYearFixed))) + 0.2;
  const tickInterval = range === "1y" ? 1 : range === "2y" ? 2 : 4;

  return (
    <div className="border-t border-neutral-100 pt-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-expanded={open}
      >
        <span>Rate History</span>
        <div className="flex items-center gap-2">
          <span className="normal-case font-normal" style={{ color: "var(--ink-faint)" }}>
            BoC {bocOvernight}% · Prime {prime}%
          </span>
          <span className="text-base">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            Bank of Canada overnight rate and best available 5-year fixed mortgage rate.
            After 9 consecutive cuts, the BoC has held at {bocOvernight}% since September 2025.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "BoC Overnight", value: `${bocOvernight}%`, sub: "Held since Sep '25", color: "var(--green)" },
              { label: "Prime Rate",    value: `${prime}%`,        sub: "All major banks",    color: "var(--ink)" },
              { label: "Best 5yr Fixed", value: `${best5yrFixed}%`, sub: `As of ${updatedLabel}`, color: "var(--ink)" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-3 text-center border border-neutral-100"
                style={{ background: "#fafafa" }}>
                <p className="text-lg font-semibold" style={{ color }}>{value}</p>
                <p className="text-xs font-medium text-neutral-600 mt-0.5">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Range toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              Updated {updatedLabel}
            </p>
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

          {/* Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overnightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fixedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#999999" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#999999" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: "#999999" }}
                  interval={tickInterval} />
                <YAxis tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: "#999999" }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[Math.max(0, minRate), maxRate]}
                  width={36} />
                <Tooltip content={<CustomTooltip />} />
                {currentRate > 0 && (
                  <ReferenceLine y={currentRate} stroke="var(--amber)"
                    strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: "Your rate", position: "right", fontSize: 10, fill: "var(--amber)" }}
                  />
                )}
                <Area type="monotone" dataKey="overnight" name="BoC Overnight"
                  stroke="var(--green)" strokeWidth={2}
                  fill="url(#overnightGrad)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="fiveYearFixed" name="5yr Fixed"
                  stroke="#999999" strokeWidth={2}
                  fill="url(#fixedGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Use rate button */}
          {onSelectRate && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span style={{ color: "var(--ink-faint)" }}>
                Use today's best rate in your calculation:
              </span>
              <button
                onClick={() => onSelectRate(best5yrFixed)}
                className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                style={{ background: "var(--green-light)", color: "var(--green)", border: "1px solid var(--green-border)" }}
              >
                Use {best5yrFixed}% →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
