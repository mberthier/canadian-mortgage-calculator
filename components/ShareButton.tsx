"use client";

import React, { useState } from "react";

interface Props {
  url: string;
  variant?: "default" | "hero";
}

export default function ShareButton({ url, variant = "default" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (variant === "hero") {
    return (
      <button onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={copied
          ? { background: "rgba(255,255,255,0.3)", color: "#fff" }
          : { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
        title="Copy shareable link">
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Link copied — share with anyone
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 4H3.5A1.5 1.5 0 002 5.5v5A1.5 1.5 0 003.5 12h5A1.5 1.5 0 0010 10.5V9M6 2h4.5A1.5 1.5 0 0112 3.5V8A1.5 1.5 0 0110.5 9.5h-4A1.5 1.5 0 015 8V3.5A1.5 1.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Share this calculation
          </>
        )}
      </button>
    );
  }

  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
      style={copied
        ? { background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }
        : { background: "#fff", borderColor: "#e7e5e4", color: "var(--ink-mid)" }}
      title="Copy shareable link">
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 4H2.5A1.5 1.5 0 001 5.5v4A1.5 1.5 0 002.5 11h4A1.5 1.5 0 008 9.5V8M5.5 1H9.5A1.5 1.5 0 0111 2.5v4A1.5 1.5 0 019.5 8h-4A1.5 1.5 0 014 6.5v-4A1.5 1.5 0 015.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}
