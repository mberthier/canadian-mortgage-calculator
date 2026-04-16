export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ftb-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="ftb-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#1878c0"/>
        </linearGradient>
        <linearGradient id="ftb-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a4f85"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="76" cy="136" rx="52" ry="8" fill="#dbeafe" opacity="0.4"/>

      {/* House isometric — smaller, left */}
      <g filter="url(#ftb-shadow)">
        <path d="M30 72 L62 55 L62 72 Z" fill="#0d5a96"/>
        <path d="M62 55 L94 72 L62 72 Z" fill="#1878c0"/>
        <path d="M30 72 L30 112 L62 112 L62 72 Z" fill="url(#ftb-wall)"/>
        <path d="M62 72 L62 112 L94 112 L94 72 Z" fill="url(#ftb-side)"/>
        <rect x="40" y="90" width="14" height="22" rx="2" fill="#063d6e"/>
        <circle cx="52" cy="102" r="1.5" fill="#fff" opacity="0.7"/>
        <rect x="42" y="78" width="10" height="8" rx="1.5" fill="#bfdbfe" opacity="0.8"/>
        <line x1="47" y1="78" x2="47" y2="86" stroke="#1068A8" strokeWidth="0.8"/>
        <line x1="42" y1="82" x2="52" y2="82" stroke="#1068A8" strokeWidth="0.8"/>
      </g>

      {/* Key */}
      <g transform="translate(90, 38) rotate(-35)" filter="url(#ftb-shadow)">
        <circle cx="16" cy="16" r="12" stroke="#00B4A0" strokeWidth="3.5" fill="none"/>
        <circle cx="16" cy="16" r="6" fill="#f0fdfa" stroke="#00B4A0" strokeWidth="2"/>
        <rect x="26" y="14" width="24" height="5" rx="2" fill="#00B4A0"/>
        <rect x="44" y="19" width="5" height="7" rx="1.5" fill="#00B4A0"/>
        <rect x="36" y="19" width="5" height="5" rx="1.5" fill="#00B4A0"/>
      </g>

      {/* Star badge */}
      <circle cx="124" cy="108" r="14" fill="#1068A8" filter="url(#ftb-shadow)"/>
      <text x="124" y="114" textAnchor="middle" fontSize="16" fill="#fbbf24">★</text>

      {/* Sparkles */}
      <circle cx="22" cy="48" r="3" fill="#bfdbfe"/>
      <circle cx="14" cy="64" r="2" fill="#dbeafe"/>
      <circle cx="148" cy="58" r="2.5" fill="#99f6e4"/>
    </svg>
  );
}
