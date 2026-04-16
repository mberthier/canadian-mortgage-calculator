import React from "react";
import Breadcrumb from "./Breadcrumb";

interface GuideItem {
  label: string;
}

interface Props {
  crumbs?:    { label: string; href?: string }[];
  title:      string;
  subtitle?:  string;
  needs?:     GuideItem[];  // "You'll need"
  gets?:      GuideItem[];  // "You'll know"
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="6.5" cy="6.5" r="6" stroke={color} strokeWidth="1.5"/>
      <path d="M4 6.5l1.8 1.8 3.2-3.2" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DotIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="6.5" cy="6.5" r="2.5" fill={color}/>
    </svg>
  );
}

export default function PageHeader({ crumbs, title, subtitle, needs, gets }: Props) {
  const hasGuide = (needs && needs.length > 0) || (gets && gets.length > 0);

  return (
    <div className="mb-10">
      {crumbs && <Breadcrumb crumbs={crumbs} />}

      <div className="mt-8">
        {/* Title + subtitle */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-3"
          style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--ink-muted)" }}>
            {subtitle}
          </p>
        )}

        {/* Guided cards */}
        {hasGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* You'll need */}
            {needs && needs.length > 0 && (
              <div className="rounded-xl px-4 py-3.5"
                style={{ background: "#f9f8f7", border: "1px solid #e8e8e8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
                  style={{ color: "var(--ink-faint)" }}>
                  You will need
                </p>
                <ul className="space-y-1.5">
                  {needs.map(item => (
                    <li key={item.label} className="flex items-start gap-2 text-sm"
                      style={{ color: "var(--ink-mid)" }}>
                      <DotIcon color="var(--ink-faint)" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* You'll know */}
            {gets && gets.length > 0 && (
              <div className="rounded-xl px-4 py-3.5"
                style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
                  style={{ color: "var(--green)" }}>
                  You will know
                </p>
                <ul className="space-y-1.5">
                  {gets.map(item => (
                    <li key={item.label} className="flex items-start gap-2 text-sm"
                      style={{ color: "var(--ink-mid)" }}>
                      <CheckIcon color="var(--green)" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
