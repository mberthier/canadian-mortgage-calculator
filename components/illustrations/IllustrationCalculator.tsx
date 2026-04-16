export default function IllustrationCalculator() {
  // Key layout constants
  // Body: x=34 to x=126 (width=92). Padding 8px each side = 76px key area
  // 4 cols, 3 gaps: each col = 76/4 = 19px wide. Key width = 15px, gap = 4px
  // Col centres from left edge (34+8=42): 42+9.5, 42+28.5, 42+47.5, 42+66.5 = 51.5, 70.5, 89.5, 108.5
  // 4 rows: y start at 80. Key height = 13px, gap = 4px. Row centres: 86.5, 103.5, 120.5, 137.5

  const COLS = [51.5, 70.5, 89.5, 108.5];
  const ROWS = [86.5, 103.5, 120.5, 137.5];
  const KW = 15; const KH = 13;

  const keys: { label: string; col: number; row: number; type: "num" | "op" | "eq" }[] = [
    { label:"7", col:0, row:0, type:"num" }, { label:"8", col:1, row:0, type:"num" },
    { label:"9", col:2, row:0, type:"num" }, { label:"÷", col:3, row:0, type:"op"  },
    { label:"4", col:0, row:1, type:"num" }, { label:"5", col:1, row:1, type:"num" },
    { label:"6", col:2, row:1, type:"num" }, { label:"×", col:3, row:1, type:"op"  },
    { label:"1", col:0, row:2, type:"num" }, { label:"2", col:1, row:2, type:"num" },
    { label:"3", col:2, row:2, type:"num" }, { label:"−", col:3, row:2, type:"op"  },
    { label:"0", col:0, row:3, type:"num" }, { label:".", col:1, row:3, type:"num" },
    { label:"=", col:3, row:3, type:"eq"  },
  ];

  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="c-sh">
          <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#1068A8" floodOpacity="0.13"/>
        </filter>
        <filter id="c-sh-sm">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1068A8" floodOpacity="0.2"/>
        </filter>
        <linearGradient id="c-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f9ff"/>
          <stop offset="100%" stopColor="#eaf1fc"/>
        </linearGradient>
        <linearGradient id="c-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e3d72"/>
          <stop offset="100%" stopColor="#091f3e"/>
        </linearGradient>
        <linearGradient id="c-op" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1878c0"/>
          <stop offset="100%" stopColor="#0f5fa0"/>
        </linearGradient>
        <linearGradient id="c-eq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00cbb4"/>
          <stop offset="100%" stopColor="#009e90"/>
        </linearGradient>
      </defs>

      {/* Calculator body — wider, light */}
      <rect x="34" y="8" width="92" height="148" rx="8"
        fill="url(#c-body)" stroke="#dbeafe" strokeWidth="1.5"
        filter="url(#c-sh)"/>

      {/* Screen */}
      <rect x="42" y="16" width="76" height="52" rx="5"
        fill="url(#c-screen)" filter="url(#c-sh-sm)"/>
      <rect x="42" y="16" width="76" height="52" rx="5"
        fill="none" stroke="#1068A8" strokeWidth="0.8" opacity="0.3"/>

      {/* $ centred on screen. Screen centre y = 16+26 = 42. fontSize=32, baseline offset ≈ 11px */}
      <text x="80" y="53" textAnchor="middle" fontSize="32"
        fill="#00B4A0" fontFamily="Georgia, serif" fontWeight="700">$</text>

      {/* Divider */}
      <line x1="42" y1="74" x2="126" y2="74"
        stroke="#dbeafe" strokeWidth="1"/>

      {/* Keys */}
      {keys.map(({ label, col, row, type }) => {
        const cx = COLS[col];
        const cy = ROWS[row];
        const bg = type === "op" ? "url(#c-op)"
                 : type === "eq" ? "url(#c-eq)"
                 : "#dbeafe";
        const fg = type === "num" ? "#1068A8" : "white";
        const fs = 7;
        // SVG text baseline: cy + fs*0.35 centres caps vertically in button
        const ty = cy + fs * 0.38;
        return (
          <g key={`${label}${col}${row}`}>
            <rect
              x={cx - KW / 2} y={cy - KH / 2}
              width={KW} height={KH} rx="3"
              fill={bg}
              filter={type !== "num" ? "url(#c-sh-sm)" : undefined}
            />
            <text
              x={cx} y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fs} fill={fg}
              fontFamily="sans-serif"
              fontWeight={type !== "num" ? "700" : "500"}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
