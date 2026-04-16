export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ftb-sh">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <filter id="ftb-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.14"/>
        </filter>
        <linearGradient id="house-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00B4A0"/>
          <stop offset="100%" stopColor="#00cbb4"/>
        </linearGradient>
        <linearGradient id="house-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#008878"/>
          <stop offset="100%" stopColor="#009e8e"/>
        </linearGradient>
        <linearGradient id="roof-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d5a96"/>
          <stop offset="100%" stopColor="#0a4a80"/>
        </linearGradient>
        <linearGradient id="roof-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
        <linearGradient id="mat-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d5a96"/>
          <stop offset="100%" stopColor="#0a4a80"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="154" rx="54" ry="6" fill="#dbeafe" opacity="0.5"/>

      {/* ── Teal house — centred, isometric ── */}
      <g filter="url(#ftb-sh)">
        {/* Roof left face */}
        <path d="M38 68 L80 46 L80 68 Z" fill="url(#roof-l)"/>
        {/* Roof right face */}
        <path d="M80 46 L122 68 L80 68 Z" fill="url(#roof-r)"/>
        {/* Ridge */}
        <path d="M38 68 L80 46 L122 68"
          stroke="white" strokeWidth="1" opacity="0.2" fill="none"/>

        {/* Front wall — teal */}
        <path d="M38 68 L38 118 L80 118 L80 68 Z" fill="url(#house-front)"/>
        {/* Side wall — darker teal */}
        <path d="M80 68 L80 118 L122 118 L122 68 Z" fill="url(#house-side)"/>

        {/* Front window */}
        <rect x="46" y="78" width="14" height="12" rx="2" fill="#bfdbfe" opacity="0.85"/>
        <line x1="53" y1="78" x2="53" y2="90" stroke="white" strokeWidth="0.8" opacity="0.7"/>
        <line x1="46" y1="84" x2="60" y2="84" stroke="white" strokeWidth="0.8" opacity="0.7"/>

        {/* Side window */}
        <rect x="88" y="78" width="18" height="12" rx="2" fill="#93c5fd" opacity="0.45"/>
        <line x1="97" y1="78" x2="97" y2="90" stroke="white" strokeWidth="0.7" opacity="0.5"/>

        {/* Front door */}
        <rect x="60" y="96" width="14" height="22" rx="2" fill="#063d6e"/>
        <circle cx="72" cy="108" r="1.5" fill="#bfdbfe" opacity="0.8"/>

        {/* Ground line */}
        <line x1="38" y1="118" x2="122" y2="118"
          stroke="white" strokeWidth="0.5" opacity="0.15"/>
      </g>

      {/* ── Welcome mat ── */}
      <g filter="url(#ftb-sh-sm)">
        {/* Mat body */}
        <rect x="42" y="118" width="76" height="26" rx="4"
          fill="url(#mat-g)"/>

        {/* Mat border inset */}
        <rect x="45" y="121" width="70" height="20" rx="2"
          fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>

        {/* Texture lines horizontal */}
        <line x1="46" y1="125" x2="114" y2="125" stroke="white" strokeWidth="0.5" opacity="0.08"/>
        <line x1="46" y1="128" x2="114" y2="128" stroke="white" strokeWidth="0.5" opacity="0.08"/>
        <line x1="46" y1="131" x2="114" y2="131" stroke="white" strokeWidth="0.5" opacity="0.08"/>
        <line x1="46" y1="134" x2="114" y2="134" stroke="white" strokeWidth="0.5" opacity="0.08"/>
        <line x1="46" y1="137" x2="114" y2="137" stroke="white" strokeWidth="0.5" opacity="0.08"/>

        {/* #1 text */}
        <text x="80" y="135" textAnchor="middle" fontSize="12"
          fill="white" fontFamily="Georgia, serif" fontWeight="700"
          opacity="0.9">#1</text>
      </g>

      {/* Chimney */}
      <rect x="100" y="52" width="10" height="18" rx="2"
        fill="#0a4a80" filter="url(#ftb-sh-sm)"/>
      <rect x="98" y="50" width="14" height="5" rx="1.5" fill="#0d5a96"/>

      {/* Smoke puffs */}
      <circle cx="105" cy="44" r="4" fill="#e0eeff" opacity="0.6"/>
      <circle cx="110" cy="38" r="3" fill="#e0eeff" opacity="0.4"/>
      <circle cx="107" cy="32" r="2" fill="#e0eeff" opacity="0.25"/>

      {/* Decorative dots */}
      <circle cx="22" cy="72" r="3" fill="#bfdbfe" opacity="0.7"/>
      <circle cx="16" cy="86" r="2" fill="#dbeafe" opacity="0.6"/>
      <circle cx="142" cy="78" r="2.5" fill="#99f6e4" opacity="0.7"/>
    </svg>
  );
}
