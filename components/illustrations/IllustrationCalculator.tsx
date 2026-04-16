export default function IllustrationCalculator() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="c-sh">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1068A8" floodOpacity="0.14"/>
        </filter>
        <filter id="c-sh-sm">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="c-body" x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#f4f8ff"/>
          <stop offset="100%" stopColor="#e8f0fb"/>
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
          <stop offset="100%" stopColor="#00a090"/>
        </linearGradient>
      </defs>

      {/* Calculator body — light, flat, blends into page */}
      <rect x="42" y="8" width="76" height="144" rx="8"
        fill="url(#c-body)" stroke="#dbeafe" strokeWidth="1.5"
        filter="url(#c-sh)"/>

      {/* Screen */}
      <rect x="50" y="16" width="60" height="48" rx="4"
        fill="url(#c-screen)" filter="url(#c-sh-sm)"/>
      {/* Screen border */}
      <rect x="50" y="16" width="60" height="48" rx="4"
        fill="none" stroke="#1068A8" strokeWidth="0.8" opacity="0.35"/>

      {/* $ on screen */}
      <text x="80" y="50" textAnchor="middle" fontSize="30"
        fill="#00B4A0" fontFamily="Georgia, serif" fontWeight="700">$</text>

      {/* Divider below screen */}
      <line x1="50" y1="70" x2="118" y2="70"
        stroke="#dbeafe" strokeWidth="1"/>

      {/* Keys — 3 num cols + 1 op col, 4 rows */}
      {/* Col x centres: 62, 76, 90, 104. Row y centres: 84, 99, 114, 129 */}
      {[
        { label:"7", col:0, row:0, type:"num" },
        { label:"8", col:1, row:0, type:"num" },
        { label:"9", col:2, row:0, type:"num" },
        { label:"÷", col:3, row:0, type:"op"  },
        { label:"4", col:0, row:1, type:"num" },
        { label:"5", col:1, row:1, type:"num" },
        { label:"6", col:2, row:1, type:"num" },
        { label:"×", col:3, row:1, type:"op"  },
        { label:"1", col:0, row:2, type:"num" },
        { label:"2", col:1, row:2, type:"num" },
        { label:"3", col:2, row:2, type:"num" },
        { label:"−", col:3, row:2, type:"op"  },
        { label:"0", col:0, row:3, type:"num" },
        { label:".", col:1, row:3, type:"num" },
        { label:"=", col:3, row:3, type:"eq"  },
      ].map(({ label, col, row, type }) => {
        const cx = 62 + col * 14;
        const cy = 84 + row * 15;
        const bg = type === "op" ? "url(#c-op)"
                 : type === "eq" ? "url(#c-eq)"
                 : "#dbeafe";
        const fg = type === "num" ? "#1068A8" : "white";
        return (
          <g key={label + col + row}>
            <rect x={cx - 6} y={cy - 5} width="12" height="10" rx="3"
              fill={bg} filter={type !== "num" ? "url(#c-sh-sm)" : undefined}/>
            <text x={cx} y={cy + 4} textAnchor="middle"
              fontSize="6.5" fill={fg}
              fontFamily="sans-serif" fontWeight={type !== "num" ? "700" : "500"}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
