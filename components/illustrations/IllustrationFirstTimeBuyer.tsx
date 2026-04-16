export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ftb-sh">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <filter id="ftb-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.14"/>
        </filter>
        <linearGradient id="door-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1878c0"/>
          <stop offset="100%" stopColor="#083560"/>
        </linearGradient>
        <linearGradient id="wall-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef5ff"/>
          <stop offset="100%" stopColor="#dbeafe"/>
        </linearGradient>
        <linearGradient id="step-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe"/>
          <stop offset="100%" stopColor="#bfdbfe"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="152" rx="50" ry="6" fill="#bfdbfe" opacity="0.4"/>

      {/* Wall surround — wide, breathing room around door */}
      <rect x="14" y="14" width="132" height="132" rx="8"
        fill="url(#wall-g)" stroke="#dbeafe" strokeWidth="1.5"
        filter="url(#ftb-sh)"/>

      {/* Transom window above door — narrow like the door */}
      <rect x="54" y="22" width="52" height="20" rx="3"
        fill="#bfdbfe" opacity="0.7"/>
      <line x1="80" y1="22" x2="80" y2="42" stroke="white" strokeWidth="1.2" opacity="0.6"/>
      <line x1="67" y1="22" x2="67" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4"/>
      <line x1="93" y1="22" x2="93" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4"/>
      <rect x="55" y="23" width="50" height="18" rx="2"
        fill="#93c5fd" opacity="0.18"/>

      {/* Door — narrow portrait proportion, centred */}
      <rect x="54" y="44" width="52" height="98" rx="4"
        fill="url(#door-g)" filter="url(#ftb-sh-sm)"/>

      {/* Door top panel */}
      <rect x="61" y="52" width="38" height="30" rx="3"
        fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
      <rect x="62" y="53" width="36" height="28" rx="2"
        fill="white" opacity="0.05"/>

      {/* Door bottom panel */}
      <rect x="61" y="88" width="38" height="40" rx="3"
        fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
      <rect x="62" y="89" width="36" height="38" rx="2"
        fill="white" opacity="0.05"/>

      {/* Door number — 1 */}
      <text x="80" y="74" textAnchor="middle" fontSize="16"
        fill="white" opacity="0.25" fontFamily="Georgia, serif" fontWeight="700">1</text>

      {/* Door knob */}
      <circle cx="97" cy="100" r="4" fill="#bfdbfe" filter="url(#ftb-sh-sm)"/>
      <circle cx="97" cy="100" r="2.8" fill="#93c5fd"/>
      <circle cx="96" cy="99" r="1" fill="white" opacity="0.5"/>

      {/* Letter slot */}
      <rect x="64" y="108" width="22" height="4" rx="2"
        fill="#063d6e" stroke="#0d5a96" strokeWidth="0.5" opacity="0.8"/>

      {/* Steps */}
      <rect x="44" y="140" width="72" height="6" rx="3"
        fill="url(#step-g)" stroke="#bfdbfe" strokeWidth="1"/>
      <rect x="36" y="145" width="88" height="5" rx="2.5"
        fill="#dbeafe" stroke="#bfdbfe" strokeWidth="0.8"/>

      {/* Left plant */}
      <rect x="22" y="124" width="14" height="14" rx="3" fill="#bfdbfe"/>
      <rect x="23" y="125" width="12" height="12" rx="2" fill="#93c5fd" opacity="0.5"/>
      <path d="M29 124 Q24 116 25 108" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M29 124 Q34 116 33 108" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M29 124 Q29 115 29 107" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="26" cy="111" rx="5" ry="3" fill="#86efac" opacity="0.85" transform="rotate(-15 26 111)"/>
      <ellipse cx="32" cy="113" rx="5" ry="3" fill="#4ade80" opacity="0.75" transform="rotate(10 32 113)"/>

      {/* Right plant */}
      <rect x="124" y="124" width="14" height="14" rx="3" fill="#bfdbfe"/>
      <rect x="125" y="125" width="12" height="12" rx="2" fill="#93c5fd" opacity="0.5"/>
      <path d="M131 124 Q126 116 127 108" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M131 124 Q136 116 135 108" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M131 124 Q131 115 131 107" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="128" cy="111" rx="5" ry="3" fill="#86efac" opacity="0.85" transform="rotate(-15 128 111)"/>
      <ellipse cx="134" cy="113" rx="5" ry="3" fill="#4ade80" opacity="0.75" transform="rotate(10 134 113)"/>
    </svg>
  );
}
