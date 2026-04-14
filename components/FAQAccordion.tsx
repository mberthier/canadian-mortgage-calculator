"use client";

import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
  pageUrl: string;
}

export default function FAQAccordion({ items, pageUrl }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-slate-800 pr-4">{item.question}</span>
              <span className="shrink-0 text-slate-400 text-lg leading-none font-light">
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed border-t border-slate-50"
                style={{ color: "var(--ink-mid)" }}>
                <div className="pt-3">{item.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
