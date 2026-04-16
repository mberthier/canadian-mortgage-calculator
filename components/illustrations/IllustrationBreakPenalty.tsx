export default function IllustrationBreakPenalty() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="bp-sh">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1068A8" floodOpacity="0.16"/>
        </filter>
        <filter id="bp-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.14"/>
        </filter>
        <linearGradient id="doc-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#f0f6ff"/>
        </linearGradient>
        <linearGradient id="doc-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#e8f2ff"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="138" rx="50" ry="7" fill="#dbeafe" opacity="0.4"/>

      {/* ── Left half of document ── */}
      <g filter="url(#bp-sh)">
        <path d="M22 28 L22 122 L74 122 L84 108 L84 28 Z" rx="5"
          fill="url(#doc-a)" stroke="#dbeafe" strokeWidth="1.5"/>
        {/* Folded corner */}
        <path d="M22 28 L22 32 Q22 28 26 28 Z" fill="#dbeafe"/>
        {/* Text lines — left half */}
        <rect x="30" y="44" width="36" height="4" rx="2" fill="#bfdbfe"/>
        <rect x="30" y="54" width="42" height="3" rx="1.5" fill="#dbeafe"/>
        <rect x="30" y="62" width="38" height="3" rx="1.5" fill="#dbeafe"/>
        <rect x="30" y="70" width="44" height="3" rx="1.5" fill="#dbeafe"/>
        <rect x="30" y="78" width="32" height="3" rx="1.5" fill="#dbeafe"/>
        {/* Signature line */}
        <line x1="30" y1="100" x2="66" y2="100" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M30 100 Q38 94 44 100 Q50 106 56 100" stroke="#1068A8" strokeWidth="2"
          strokeLinecap="round" fill="none"/>
      </g>

      {/* ── Right half of document ── */}
      <g filter="url(#bp-sh)">
        <path d="M76 28 L76 108 L138 108 L138 28 Z" rx="5"
          fill="url(#doc-b)" stroke="#dbeafe" strokeWidth="1.5"/>
        {/* Corner fold */}
        <path d="M116 28 L138 50 L116 50 Z" fill="#dbeafe"/>
        <path d="M116 28 L138 50" stroke="#bfdbfe" strokeWidth="1.5"/>
        {/* Text lines — right half */}
        <rect x="84" y="44" width="38" height="4" rx="2" fill="#bfdbfe"/>
        <rect x="84" y="54" width="32" height="3" rx="1.5" fill="#dbeafe"/>
        <rect x="84" y="62" width="40" height="3" rx="1.5" fill="#dbeafe"/>
        <rect x="84" y="70" width="28" height="3" rx="1.5" fill="#dbeafe"/>
        {/* Seal circle */}
        <circle cx="108" cy="90" r="14" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
        <circle cx="108" cy="90" r="9" fill="none" stroke="#dbeafe" strokeWidth="1"
          strokeDasharray="2.5 2"/>
      </g>

      {/* ── Crack / tear line between halves ── */}
      <path d="M78 22 L74 48 L80 58 L74 72 L80 88 L74 102 L80 118 L80 130"
        stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="0" fill="none"/>
      {/* Crack glow */}
      <path d="M78 22 L74 48 L80 58 L74 72 L80 88 L74 102 L80 118 L80 130"
        stroke="#fca5a5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        opacity="0.25" fill="none"/>

      {/* ── Cost badge ── */}
      <g filter="url(#bp-sh)">
        <circle cx="124" cy="42" r="18" fill="#1068A8"/>
        <text x="124" y="38" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.65)"
          fontFamily="sans-serif" fontWeight="600">cost</text>
        <text x="124" y="52" textAnchor="middle" fontSize="16" fill="white"
          fontFamily="Georgia, serif" fontWeight="800">$</text>
      </g>

      {/* Small decorative dots */}
      <circle cx="20" cy="52" r="3" fill="#bfdbfe"/>
      <circle cx="14" cy="68" r="2" fill="#dbeafe"/>
      <circle cx="148" cy="88" r="2.5" fill="#fecaca"/>
    </svg>
  );
}
