import React from "react";

interface Props {
  size?: "hero" | "section" | "nav" | "footer" | "min";
}

const SIZE_MAP = {
  hero:    44,
  section: 30,
  nav:     22,
  footer:  16,
  min:     12,
};

export default function Wordmark({ size = "nav" }: Props) {
  const px = SIZE_MAP[size];
  const caSize = Math.round(px * 0.55);
  const caOffset = Math.round(px * -0.35);

  return (
    <span
      aria-label="CrystalKey"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {/* crystal — italic, regular weight, lowercase, Midnight */}
      <span
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: px,
          color: "var(--brand-midnight)",
          letterSpacing: "-0.01em",
        }}
      >
        crystal
      </span>

      {/* KEY — roman, bold, uppercase, Crystal Blue */}
      <span
        style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: px,
          color: "var(--brand-crystal-blue)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        KEY
      </span>

      {/* .ca — teal, raised, smaller, roman */}
      <span
        style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: caSize,
          color: "var(--brand-teal)",
          position: "relative",
          top: caOffset,
          letterSpacing: "0.01em",
        }}
      >
        .ca
      </span>
    </span>
  );
}
