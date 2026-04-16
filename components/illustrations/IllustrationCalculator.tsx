export default function IllustrationCalculator() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="calc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f0ff"/>
          <stop offset="100%" stopColor="#f0f6ff"/>
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#1878c0"/>
        </linearGradient>
        <linearGradient id="side-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a4f85"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Ground */}
      <ellipse cx="80" cy="138" rx="60" ry="10" fill="#dbeafe" opacity="0.5"/>

      {/* House isometric */}
      <g filter="url(#calc-shadow)">
        {/* Roof left face */}
        <path d="M44 72 L80 52 L80 72 Z" fill="#0d5a96"/>
        {/* Roof right face */}
        <path d="M80 52 L116 72 L80 72 Z" fill="#1878c0"/>
        {/* Roof ridge cap */}
        <path d="M44 72 L80 52 L116 72" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3"/>

        {/* Front wall */}
        <path d="M44 72 L44 118 L80 118 L80 72 Z" fill="url(#wall)"/>
        {/* Side wall */}
        <path d="M80 72 L80 118 L116 118 L116 72 Z" fill="url(#side-wall)"/>

        {/* Ground edge */}
        <path d="M44 118 L80 118 L116 118" stroke="#fff" strokeWidth="0.5" opacity="0.2"/>

        {/* Front door */}
        <rect x="56" y="96" width="16" height="22" rx="3" fill="#063d6e"/>
        <rect x="57" y="97" width="14" height="10" rx="1" fill="#0d5a96" opacity="0.6"/>
        <circle cx="70" cy="108" r="1.5" fill="#fff" opacity="0.7"/>

        {/* Front window */}
        <rect x="50" y="81" width="12" height="10" rx="2" fill="#bfdbfe" opacity="0.8"/>
        <line x1="56" y1="81" x2="56" y2="91" stroke="#1068A8" strokeWidth="0.8"/>
        <line x1="50" y1="86" x2="62" y2="86" stroke="#1068A8" strokeWidth="0.8"/>

        {/* Side window */}
        <rect x="88" y="81" width="16" height="10" rx="2" fill="#93c5fd" opacity="0.5"/>
        <line x1="96" y1="81" x2="96" y2="91" stroke="#0d5a96" strokeWidth="0.8"/>
      </g>

      {/* Floating $ badge */}
      <circle cx="122" cy="42" r="18" fill="#00B4A0" filter="url(#calc-shadow)"/>
      <text x="122" y="48" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="Georgia, serif">$</text>

      {/* Small sparkles */}
      <circle cx="32" cy="58" r="3" fill="#bfdbfe"/>
      <circle cx="24" cy="72" r="2" fill="#dbeafe"/>
      <circle cx="142" cy="80" r="2.5" fill="#bfdbfe"/>
    </svg>
  );
}
