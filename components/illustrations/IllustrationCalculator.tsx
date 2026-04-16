export default function IllustrationCalculator() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="c-sh">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0B1927" floodOpacity="0.28"/>
        </filter>
        <filter id="c-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
        </filter>
        <linearGradient id="c-body" x1="0.2" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16304f"/>
          <stop offset="100%" stopColor="#0B1927"/>
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

      {/* Ground shadow */}
      <ellipse cx="80" cy="152" rx="40" ry="6" fill="#0B1927" opacity="0.10"/>

      {/* Calculator body — tall, narrow, phone-like */}
      <rect x="44" y="10" width="72" height="138" rx="14"
        fill="url(#c-body)" filter="url(#c-sh)"/>

      {/* Body highlight */}
      <rect x="44" y="10" width="72" height="138" rx="14"
        fill="none" stroke="white" strokeWidth="0.75" opacity="0.07"/>

      {/* Top notch dots */}
      <circle cx="74" cy="22" r="1.8" fill="#1a3a5c"/>
      <circle cx="80" cy="22" r="1.8" fill="#1a3a5c"/>
      <circle cx="86" cy="22" r="1.8" fill="#1a3a5c"/>

      {/* Screen */}
      <rect x="52" y="30" width="56" height="46" rx="6"
        fill="url(#c-screen)"/>
      {/* Screen inner glow edge */}
      <rect x="52" y="30" width="56" height="46" rx="6"
        fill="none" stroke="#1068A8" strokeWidth="1" opacity="0.3"/>
      {/* Screen glare */}
      <path d="M55 33 Q66 31 72 35 L70 40 Q63 37 55 38 Z"
        fill="white" opacity="0.05"/>

      {/* Screen label */}
      <text x="80" y="50" textAnchor="middle" fontSize="6.5"
        fill="rgba(255,255,255,0.38)" fontFamily="sans-serif"
        fontWeight="600" letterSpacing="1.2">YOUR PAYMENT</text>

      {/* Screen $ symbol — large, teal */}
      <text x="80" y="68" textAnchor="middle" fontSize="26"
        fill="#00B4A0" fontFamily="Georgia, serif" fontWeight="700">$</text>

      {/* Divider */}
      <line x1="54" y1="84" x2="106" y2="84"
        stroke="white" strokeWidth="0.5" opacity="0.08"/>

      {/* Keys — 3 cols × 4 rows + operator column */}
      {/* Row heights: y=90, 104, 118, 132. Col x: 51, 65, 79, 93 */}
      {/* Numbers */}
      {[
        [["7","8","9"], 90],
        [["4","5","6"], 104],
        [["1","2","3"], 118],
        [["0",".",""], 132],
      ].map(([keys, y]) =>
        (keys as string[]).map((k, ci) => k ? (
          <g key={`n-${y}-${ci}`}>
            <rect x={51 + ci * 14} y={y as number} width="11" height="10" rx="3"
              fill="#1a3356"/>
            <text x={51 + ci * 14 + 5.5} y={(y as number) + 8} textAnchor="middle"
              fontSize="6" fill="rgba(255,255,255,0.65)" fontFamily="sans-serif">
              {k}
            </text>
          </g>
        ) : null)
      )}

      {/* Operator column */}
      {[["÷",90],["×",104],["−",118]].map(([op, y]) => (
        <g key={`op-${y}`}>
          <rect x="93" y={y as number} width="11" height="10" rx="3"
            fill="url(#c-op)" filter="url(#c-sh-sm)"/>
          <text x="98.5" y={(y as number) + 8} textAnchor="middle"
            fontSize="7" fill="white" fontFamily="sans-serif" fontWeight="700">
            {op}
          </text>
        </g>
      ))}

      {/* = key — teal accent, wide */}
      <rect x="93" y="132" width="11" height="10" rx="3"
        fill="url(#c-eq)" filter="url(#c-sh-sm)"/>
      <text x="98.5" y="140" textAnchor="middle"
        fontSize="7" fill="white" fontFamily="sans-serif" fontWeight="700">=</text>

      {/* Home bar */}
      <rect x="68" y="144" width="24" height="2.5" rx="1.25"
        fill="white" opacity="0.12"/>
    </svg>
  );
}
