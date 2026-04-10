"use client";

import React, { useState, useRef, useEffect } from "react";

interface Props {
  content: string;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="More information"
        className="inline-flex items-center justify-center rounded-full ml-1 shrink-0 transition-colors"
        style={{
          width: 15,
          height: 15,
          background: open ? "var(--green)" : "var(--cream-dark)",
          color: open ? "#fff" : "var(--ink-muted)",
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
          border: "none",
          cursor: "pointer",
        }}
      >
        ?
      </button>

      {open && (
        <span
          className="absolute z-50 rounded-xl shadow-lg text-xs leading-relaxed"
          style={{
            background: "var(--ink)",
            color: "#fff",
            padding: "10px 14px",
            width: 240,
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          {content}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 10,
              height: 5,
              background: "var(--ink)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
        </span>
      )}
      {children}
    </span>
  );
}
