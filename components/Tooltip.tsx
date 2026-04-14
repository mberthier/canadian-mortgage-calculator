"use client";

import React, { useState, useRef, useEffect } from "react";

interface Props {
  content: string;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: Props) {
  const [open, setOpen]       = useState(false);
  const [side, setSide]       = useState<"center" | "left" | "right">("center");
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref    = useRef<HTMLSpanElement>(null);

  // Detect which side of the viewport we're on so we can flip the popover
  const recalcSide = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const vw   = window.innerWidth;
    if (rect.left < 130)         setSide("left");
    else if (rect.right > vw - 130) setSide("right");
    else                         setSide("center");
  };

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const popoverStyle: React.CSSProperties = {
    position:  "absolute",
    zIndex:    50,
    background: "var(--ink)",
    color:     "#fff",
    padding:   "10px 14px",
    width:     240,
    bottom:    "calc(100% + 8px)",
    borderRadius: 12,
    fontSize:  12,
    lineHeight: 1.5,
    pointerEvents: "none",
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    ...(side === "center" && { left: "50%", transform: "translateX(-50%)" }),
    ...(side === "left"   && { left: 0,     transform: "none" }),
    ...(side === "right"  && { right: 0,    transform: "none" }),
  };

  const arrowLeft =
    side === "center" ? "50%"  :
    side === "left"   ? "10px" : "auto";
  const arrowRight = side === "right" ? "10px" : "auto";

  return (
    <span ref={ref} className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => { recalcSide(); setOpen(true);  }}
        onMouseLeave={() => setOpen(false)}
        onClick={() => { recalcSide(); setOpen(o => !o); }}
        aria-label="More information"
        className="inline-flex items-center justify-center rounded-full ml-1 shrink-0 transition-colors"
        style={{
          width:      15,
          height:     15,
          background: open ? "var(--green)" : "#e8e8e8",
          color:      open ? "#fff" : "var(--ink-muted)",
          fontSize:   9,
          fontWeight: 700,
          lineHeight: 1,
          border:     "none",
          cursor:     "pointer",
        }}
      >
        ?
      </button>

      {open && (
        <span style={popoverStyle}>
          {content}
          {/* Arrow */}
          <span style={{
            position:  "absolute",
            bottom:    -5,
            left:      arrowLeft,
            right:     arrowRight,
            transform: side === "center" ? "translateX(-50%)" : "none",
            width:     10,
            height:    5,
            background: "var(--ink)",
            clipPath:  "polygon(0 0, 100% 0, 50% 100%)",
          }} />
        </span>
      )}
      {children}
    </span>
  );
}
