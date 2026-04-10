"use client";

import React, { useState, useMemo } from "react";
import { AmortizationEntry, PaymentFrequency } from "@/lib/types";
import { PAYMENTS_PER_YEAR } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  schedule: AmortizationEntry[];
  frequency: PaymentFrequency;
  termYears: number;
}

const PAGE_SIZE = 24;

function downloadCSV(schedule: AmortizationEntry[], frequency: PaymentFrequency) {
  const headers = ["Payment #", "Payment", "Principal", "Interest", "Lump Sum", "Balance", "Cumulative Interest"];
  const rows = schedule.map((e) => [
    e.paymentNumber,
    e.payment.toFixed(2),
    e.principal.toFixed(2),
    e.interest.toFixed(2),
    (e.lumpSum ?? 0).toFixed(2),
    e.balance.toFixed(2),
    e.cumulativeInterest.toFixed(2),
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `amortization-${frequency}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function AmortizationTable({ schedule, frequency, termYears }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"yearly" | "payments">("yearly");
  const [page, setPage]         = useState(0);

  const ppy          = PAYMENTS_PER_YEAR[frequency];
  const termPayments = termYears * ppy;

  // ── Yearly rollup ──────────────────────────────────────────────────────────
  const yearlyData = useMemo(() => {
    const years: {
      year: number;
      totalPayment: number; totalPrincipal: number;
      totalInterest: number; totalLumpSum: number;
      endBalance: number; isInTerm: boolean;
    }[] = [];

    for (let y = 1; ; y++) {
      const slice = schedule.slice((y - 1) * ppy, y * ppy);
      if (slice.length === 0) break;
      years.push({
        year: y,
        totalPayment:    slice.reduce((s, e) => s + e.payment, 0),
        totalPrincipal:  slice.reduce((s, e) => s + e.principal, 0),
        totalInterest:   slice.reduce((s, e) => s + e.interest, 0),
        totalLumpSum:    slice.reduce((s, e) => s + (e.lumpSum ?? 0), 0),
        endBalance:      slice[slice.length - 1].balance,
        isInTerm:        y <= termYears,
      });
    }
    return years;
  }, [schedule, ppy, termYears]);

  const hasAnyLumpSums = schedule.some((e) => (e.lumpSum ?? 0) > 0);

  const displayedPayments = useMemo(
    () => schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [schedule, page],
  );
  const totalPages = Math.ceil(schedule.length / PAGE_SIZE);

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
        aria-expanded={false}>
        <span>View Full Amortization Schedule</span>
        <span className="text-xs text-stone-400">{schedule.length.toLocaleString()} payments · ↓ expand</span>
      </button>
    );
  }

  const thCls = "px-4 py-2.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide";
  const thR   = thCls + " text-right";

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 gap-3 flex-wrap">
        <div className="flex gap-1 bg-stone-100 rounded-lg p-0.5">
          {(["yearly", "payments"] as const).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize"
              style={viewMode === m
                ? { background: "#fff", color: "var(--ink)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
                : { color: "var(--ink-faint)" }}>
              {m === "yearly" ? "By Year" : "All Payments"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => downloadCSV(schedule, frequency)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-medium">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
          <button onClick={() => setExpanded(false)}
            className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5">
            ↑ Collapse
          </button>
        </div>
      </div>

      {/* term legend */}
      <div className="px-4 py-2 text-xs flex items-center gap-2 border-b border-stone-50"
        style={{ background: "var(--cream)" }}>
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}></span>
        <span style={{ color: "var(--ink-faint)" }}>Highlighted = current {termYears}-year term</span>
        {hasAnyLumpSums && (
          <>
            <span className="mx-1" style={{ color: "var(--ink-faint)" }}>·</span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-200"></span>
            <span style={{ color: "var(--ink-faint)" }}>Lump sum applied</span>
          </>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr style={{ background: "var(--cream)" }}>
              {viewMode === "yearly" ? (
                <>
                  <th className={thCls}>Year</th>
                  <th className={thR}>Total Paid</th>
                  <th className={thR}>Principal</th>
                  <th className={thR}>Interest</th>
                  {hasAnyLumpSums && <th className={thR}>Lump Sum</th>}
                  <th className={thR}>Balance</th>
                </>
              ) : (
                <>
                  <th className={thCls}>#</th>
                  <th className={thR}>Payment</th>
                  <th className={thR}>Principal</th>
                  <th className={thR}>Interest</th>
                  {hasAnyLumpSums && <th className={thR}>Lump Sum</th>}
                  <th className={thR}>Balance</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {viewMode === "yearly"
              ? yearlyData.map((row) => {
                  const hasLump = row.totalLumpSum > 0;
                  return (
                    <tr key={row.year}
                      className="transition-colors"
                      style={row.isInTerm ? { background: "var(--green-light)" } : undefined}
                      onMouseEnter={(e) => { if (!row.isInTerm) (e.currentTarget as HTMLElement).style.background = "var(--cream)"; }}
                      onMouseLeave={(e) => { if (!row.isInTerm) (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-stone-700">Year {row.year}</span>
                        {row.isInTerm && <span className="ml-2 text-xs font-medium" style={{ color: "var(--green)" }}>Term</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600 tabular-nums">{formatCurrency(row.totalPayment)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "var(--green-mid)" }}>{formatCurrency(row.totalPrincipal)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "var(--red)" }}>{formatCurrency(row.totalInterest)}</td>
                      {hasAnyLumpSums && (
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {hasLump
                            ? <span className="font-semibold text-blue-700">{formatCurrency(row.totalLumpSum)}</span>
                            : <span className="text-stone-300">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right font-semibold text-stone-900 tabular-nums">{formatCurrency(row.endBalance)}</td>
                    </tr>
                  );
                })
              : displayedPayments.map((row) => {
                  const isInTerm = row.paymentNumber <= termPayments;
                  const hasLump  = (row.lumpSum ?? 0) > 0;
                  return (
                    <tr key={row.paymentNumber}
                      className="transition-colors"
                      style={isInTerm ? { background: "var(--green-light)" } : undefined}
                      onMouseEnter={(e) => { if (!isInTerm) (e.currentTarget as HTMLElement).style.background = "var(--cream)"; }}
                      onMouseLeave={(e) => { if (!isInTerm) (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <td className="px-4 py-2 text-stone-400 tabular-nums text-xs">{row.paymentNumber}</td>
                      <td className="px-4 py-2 text-right text-stone-700 tabular-nums text-xs">{formatCurrency(row.payment)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-xs" style={{ color: "var(--green-mid)" }}>{formatCurrency(row.principal)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-xs" style={{ color: "var(--red)" }}>{formatCurrency(row.interest)}</td>
                      {hasAnyLumpSums && (
                        <td className="px-4 py-2 text-right tabular-nums text-xs">
                          {hasLump
                            ? <span className="font-semibold text-blue-700">{formatCurrency(row.lumpSum!)}</span>
                            : <span className="text-stone-300">—</span>}
                        </td>
                      )}
                      <td className="px-4 py-2 text-right font-medium text-stone-900 tabular-nums text-xs">{formatCurrency(row.balance)}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {viewMode === "payments" && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50">
            ← Prev
          </button>
          <span className="text-xs text-stone-500">Page {page + 1} of {totalPages} · {schedule.length} payments</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
