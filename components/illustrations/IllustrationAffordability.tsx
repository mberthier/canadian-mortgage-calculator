export default function IllustrationAffordability() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="aff-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#1068A8"/>
        </linearGradient>
        <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Base plane */}
      <rect x="24" y="115" width="112" height="4" rx="2" fill="#dbeafe"/>

      {/* Grid lines subtle */}
      <line x1="24" y1="100" x2="136" y2="100" stroke="#dbeafe" strokeWidth="1"/>
      <line x1="24" y1="82" x2="136" y2="82" stroke="#dbeafe" strokeWidth="1"/>
      <line x1="24" y1="64" x2="136" y2="64" stroke="#dbeafe" strokeWidth="1"/>

      {/* Bar 1 */}
      <rect x="34" y="90" width="22" height="25" rx="4"
        fill="url(#bar1)" filter="url(#aff-shadow)"/>
      {/* Bar 1 top highlight */}
      <rect x="34" y="90" width="22" height="5" rx="4" fill="#93c5fd" opacity="0.5"/>

      {/* Bar 2 — tallest, green = pass */}
      <rect x="69" y="60" width="22" height="55" rx="4"
        fill="url(#bar2)" filter="url(#aff-shadow)"/>
      <rect x="69" y="60" width="22" height="5" rx="4" fill="#6ee7b7" opacity="0.5"/>

      {/* Bar 3 */}
      <rect x="104" y="74" width="22" height="41" rx="4"
        fill="url(#bar3)" filter="url(#aff-shadow)"/>
      <rect x="104" y="74" width="22" height="5" rx="4" fill="#60a5fa" opacity="0.5"/>

      {/* Check badge on bar 2 */}
      <circle cx="80" cy="50" r="12" fill="#059669" filter="url(#aff-shadow)"/>
      <path d="M74 50 L78 55 L87 44"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* GDS/TDS label chips */}
      <rect x="30" y="120" width="30" height="14" rx="7" fill="#dbeafe"/>
      <text x="45" y="131" textAnchor="middle" fontSize="7" fill="#1068A8"
        fontFamily="sans-serif" fontWeight="700">GDS</text>

      <rect x="65" y="120" width="30" height="14" rx="7" fill="#d1fae5"/>
      <text x="80" y="131" textAnchor="middle" fontSize="7" fill="#059669"
        fontFamily="sans-serif" fontWeight="700">TDS</text>

      {/* Sparkles */}
      <circle cx="28" cy="60" r="3" fill="#bfdbfe"/>
      <circle cx="140" cy="56" r="2.5" fill="#a7f3d0"/>
    </svg>
  );
}
