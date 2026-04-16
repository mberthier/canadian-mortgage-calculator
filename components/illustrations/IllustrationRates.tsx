export default function IllustrationRates() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="rates-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1068A8" floodOpacity="0.15"/>
        </filter>
        <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="50%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#00B4A0"/>
        </linearGradient>
      </defs>

      {/* Chart background card */}
      <rect x="18" y="22" width="124" height="100" rx="10"
        fill="white" stroke="#dbeafe" strokeWidth="1.5" filter="url(#rates-shadow)"/>

      {/* Grid lines */}
      <line x1="30" y1="50" x2="130" y2="50" stroke="#f0f6ff" strokeWidth="1.5"/>
      <line x1="30" y1="68" x2="130" y2="68" stroke="#f0f6ff" strokeWidth="1.5"/>
      <line x1="30" y1="86" x2="130" y2="86" stroke="#f0f6ff" strokeWidth="1.5"/>
      <line x1="30" y1="104" x2="130" y2="104" stroke="#f0f6ff" strokeWidth="1.5"/>

      {/* Rate line — rises then falls (BoC cycle) */}
      <path d="M30 98 C45 95 52 88 60 70 C68 52 72 44 82 44 C90 44 94 52 100 60 C108 70 116 76 130 72"
        stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Area fill under line */}
      <path d="M30 98 C45 95 52 88 60 70 C68 52 72 44 82 44 C90 44 94 52 100 60 C108 70 116 76 130 72 L130 112 L30 112 Z"
        fill="url(#line-grad)" opacity="0.08"/>

      {/* Peak dot */}
      <circle cx="82" cy="44" r="5" fill="#1068A8" filter="url(#rates-shadow)"/>
      <circle cx="82" cy="44" r="3" fill="white"/>

      {/* End dot */}
      <circle cx="130" cy="72" r="5" fill="#00B4A0" filter="url(#rates-shadow)"/>
      <circle cx="130" cy="72" r="3" fill="white"/>

      {/* % label at peak */}
      <rect x="86" y="34" width="24" height="14" rx="4" fill="#1068A8"/>
      <text x="98" y="45" textAnchor="middle" fontSize="8" fill="white"
        fontFamily="sans-serif" fontWeight="700">5.0%</text>

      {/* Current rate label */}
      <rect x="106" y="60" width="30" height="14" rx="4" fill="#f0fdfa"
        stroke="#99f6e4" strokeWidth="1"/>
      <text x="121" y="71" textAnchor="middle" fontSize="7.5" fill="#0f766e"
        fontFamily="sans-serif" fontWeight="700">3.35%</text>

      {/* Axis labels */}
      <text x="30" y="120" fontSize="7" fill="#999" fontFamily="sans-serif">2021</text>
      <text x="72" y="120" fontSize="7" fill="#999" fontFamily="sans-serif">2023</text>
      <text x="116" y="120" fontSize="7" fill="#999" fontFamily="sans-serif">2026</text>
    </svg>
  );
}
