"use client";

import React, { useState } from "react";

interface Props {
  url: string;
}

export default function ShareButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
      style={copied ? {
        background: "var(--green-light)",
        borderColor: "var(--green-border)",
        color: "var(--green)",
      } : {
        background: "#fff",
        borderColor: "#e7e5e4",
        color: "var(--ink-mid)",
      }}
      title="Copy shareable link"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 4H2.5A1.5 1.5 0 001 5.5v4A1.5 1.5 0 002.5 11h4A1.5 1.5 0 008 9.5V8M5.5 1H9.5A1.5 1.5 0 0111 2.5v4A1.5 1.5 0 019.5 8h-4A1.5 1.5 0 014 6.5v-4A1.5 1.5 0 015.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}
