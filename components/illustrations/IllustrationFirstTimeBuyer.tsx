export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ftb-sh">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <filter id="ftb-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.14"/>
        </filter>
        <linearGradient id="ftb-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#1878c0"/>
        </linearGradient>
        <linearGradient id="ftb-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#084a80"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
        <linearGradient id="ftb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eff6ff"/>
          <stop offset="100%" stopColor="#f0f6ff"/>
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="160" height="160" fill="url(#ftb-sky)" rx="0"/>

      {/* Ground */}
      <ellipse cx="80" cy="136" rx="58" ry="10" fill="#dbeafe" opacity="0.5"/>
      <rect x="22" y="130" width="116" height="6" rx="3" fill="#dbeafe" opacity="0.4"/>

      {/* ── House ── */}
      <g filter="url(#ftb-sh)">
        {/* Roof left */}
        <path d="M36 74 L80 48 L80 74 Z" fill="#0a4f85"/>
        {/* Roof right */}
        <path d="M80 48 L124 74 L80 74 Z" fill="#0d6bbf"/>
        {/* Roof peak accent */}
        <path d="M36 74 L80 48 L124 74" stroke="white" strokeWidth="1.5" opacity="0.15" fill="none"/>

        {/* Front wall */}
        <rect x="36" y="74" width="44" height="56" fill="url(#ftb-front)"/>
        {/* Side wall */}
        <rect x="80" y="74" width="44" height="56" fill="url(#ftb-side)"/>

        {/* Front window left */}
        <rect x="44" y="84" width="12" height="12" rx="2" fill="#bfdbfe" opacity="0.9"/>
        <line x1="50" y1="84" x2="50" y2="96" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        <line x1="44" y1="90" x2="56" y2="90" stroke="white" strokeWidth="0.8" opacity="0.6"/>

        {/* Front window right */}
        <rect x="62" y="84" width="12" height="12" rx="2" fill="#bfdbfe" opacity="0.9"/>
        <line x1="68" y1="84" x2="68" y2="96" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        <line x1="62" y1="90" x2="74" y2="90" stroke="white" strokeWidth="0.8" opacity="0.6"/>

        {/* Side window */}
        <rect x="88" y="84" width="16" height="12" rx="2" fill="#93c5fd" opacity="0.5"/>
        <line x1="96" y1="84" x2="96" y2="96" stroke="white" strokeWidth="0.8" opacity="0.4"/>

        {/* Front door with arch */}
        <path d="M52 130 L52 108 Q52 102 58 102 Q64 102 64 108 L64 130 Z"
          fill="#063d6e"/>
        {/* Door arch highlight */}
        <path d="M53 130 L53 108 Q53 103 58 103 Q63 103 63 108 L63 130 Z"
          fill="#0a4f85" opacity="0.5"/>
        {/* Keyhole */}
        <circle cx="58" cy="118" r="2.5" fill="#1068A8" opacity="0.8"/>
        <path d="M56.5 118 L59.5 118 L59.5 124 L56.5 124 Z" fill="#1068A8" opacity="0.8"/>

        {/* Front step */}
        <rect x="48" y="128" width="20" height="4" rx="1" fill="#0a4f85"/>
      </g>

      {/* ── "1st" ribbon banner ── */}
      <g filter="url(#ftb-sh-sm)">
        <path d="M100 38 L148 38 L148 62 L100 62 L108 50 Z" fill="#00B4A0"/>
        <text x="128" y="55" textAnchor="middle" fontSize="13" fill="white"
          fontFamily="Georgia, serif" fontWeight="800">1st</text>
      </g>

      {/* Ribbon tail */}
      <path d="M100 38 L108 50 L100 62 Z" fill="#008f80"/>

      {/* Sun / sparkles */}
      <circle cx="30" cy="36" r="8" fill="#fde68a" opacity="0.8"/>
      <line x1="30" y1="24" x2="30" y2="20" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="42" y1="36" x2="46" y2="36" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="28" x2="41" y2="25" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="28" x2="19" y2="25" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>

      {/* Small clouds */}
      <ellipse cx="112" cy="26" rx="10" ry="5" fill="white" opacity="0.8"/>
      <ellipse cx="122" cy="24" rx="7" ry="5" fill="white" opacity="0.8"/>
      <ellipse cx="104" cy="25" rx="7" ry="4" fill="white" opacity="0.8"/>
    </svg>
  );
}
