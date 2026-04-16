export default function IllustrationCalculator() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="calc-sh">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0B1927" floodOpacity="0.22"/>
        </filter>
        <filter id="calc-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.2"/>
        </filter>
        <linearGradient id="calc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2744"/>
          <stop offset="100%" stopColor="#0B1927"/>
        </linearGradient>
        <linearGradient id="calc-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d3a6e"/>
          <stop offset="100%" stopColor="#0a2d56"/>
        </linearGradient>
        <linearGradient id="key-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1878c0"/>
          <stop offset="100%" stopColor="#1068A8"/>
        </linearGradient>
        <linearGradient id="key-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00cbb4"/>
          <stop offset="100%" stopColor="#00B4A0"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="148" rx="46" ry="7" fill="#0B1927" opacity="0.12"/>

      {/* Calculator body */}
      <rect x="32" y="14" width="96" height="130" rx="12"
        fill="url(#calc-body)" filter="url(#calc-sh)"/>

      {/* Body highlight edge */}
      <rect x="32" y="14" width="96" height="130" rx="12"
        fill="none" stroke="white" strokeWidth="0.8" opacity="0.08"/>

      {/* Top camera / speaker dots */}
      <circle cx="72" cy="24" r="2" fill="#1a3a5c"/>
      <circle cx="80" cy="24" r="2" fill="#1a3a5c"/>
      <circle cx="88" cy="24" r="2" fill="#1a3a5c"/>

      {/* Screen */}
      <rect x="40" y="32" width="80" height="44" rx="6"
        fill="url(#calc-screen)" filter="url(#calc-sh-sm)"/>
      {/* Screen glare */}
      <path d="M44 34 Q60 32 70 36 L68 42 Q58 38 44 40 Z"
        fill="white" opacity="0.04"/>

      {/* Screen label */}
      <text x="80" y="52" textAnchor="middle" fontSize="7.5"
        fill="rgba(255,255,255,0.4)" fontFamily="sans-serif" fontWeight="500"
        letterSpacing="1">MONTHLY PAYMENT</text>

      {/* Screen value */}
      <text x="80" y="70" textAnchor="middle" fontSize="19"
        fill="#00B4A0" fontFamily="Georgia, serif" fontWeight="700"
        letterSpacing="-0.5">$3,120</text>

      {/* Key grid — 4 columns × 4 rows */}
      {[
        ["7","8","9","÷"],
        ["4","5","6","×"],
        ["1","2","3","−"],
        ["0",".","=","+"],
      ].map((row, ri) =>
        row.map((key, ci) => {
          const x = 42 + ci * 20;
          const y = 88 + ri * 18;
          const isEquals = key === "=";
          const isOp = ["÷","×","−","+"].includes(key);
          return (
            <g key={`${ri}-${ci}`}>
              <rect x={x} y={y} width="14" height="12" rx="3"
                fill={isEquals ? "url(#key-teal)" : isOp ? "url(#key-blue)" : "#1a3356"}
                filter={isEquals ? "url(#calc-sh-sm)" : undefined}/>
              <text x={x + 7} y={y + 9} textAnchor="middle"
                fontSize={isOp ? "8" : "7.5"} fill={isOp || isEquals ? "white" : "rgba(255,255,255,0.7)"}
                fontFamily="sans-serif" fontWeight={isOp || isEquals ? "700" : "400"}>
                {key}
              </text>
            </g>
          );
        })
      )}

      {/* Bottom home bar */}
      <rect x="68" y="136" width="24" height="3" rx="1.5" fill="#1a3a5c"/>
    </svg>
  );
}
