export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ftb-sh">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#1068A8" floodOpacity="0.2"/>
        </filter>
        <filter id="ftb-sh-sm">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1068A8" floodOpacity="0.15"/>
        </filter>
        <linearGradient id="door-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0a3d6e"/>
        </linearGradient>
        <linearGradient id="frame-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f6ff"/>
          <stop offset="100%" stopColor="#dbeafe"/>
        </linearGradient>
        <linearGradient id="step-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2eeff"/>
          <stop offset="100%" stopColor="#bfdbfe"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="148" rx="52" ry="7" fill="#dbeafe" opacity="0.5"/>

      {/* Door frame / wall surround */}
      <rect x="28" y="22" width="104" height="122" rx="8"
        fill="url(#frame-grad)" stroke="#dbeafe" strokeWidth="1.5"
        filter="url(#ftb-sh)"/>

      {/* Transom window above door */}
      <rect x="42" y="28" width="76" height="22" rx="4" fill="#dbeafe" opacity="0.6"/>
      {/* Transom panes */}
      <line x1="80" y1="28" x2="80" y2="50" stroke="#bfdbfe" strokeWidth="1.5"/>
      <line x1="61" y1="28" x2="61" y2="50" stroke="#bfdbfe" strokeWidth="1"/>
      <line x1="99" y1="28" x2="99" y2="50" stroke="#bfdbfe" strokeWidth="1"/>
      {/* Transom glow */}
      <rect x="43" y="29" width="74" height="20" rx="3" fill="#93c5fd" opacity="0.2"/>

      {/* Door */}
      <rect x="42" y="52" width="76" height="88" rx="4"
        fill="url(#door-grad)" filter="url(#ftb-sh-sm)"/>

      {/* Door panel — top */}
      <rect x="50" y="60" width="60" height="30" rx="3"
        fill="white" opacity="0.06"/>
      <rect x="51" y="61" width="58" height="28" rx="2"
        fill="none" stroke="white" strokeWidth="1" opacity="0.12"/>

      {/* Door panel — bottom */}
      <rect x="50" y="96" width="60" height="34" rx="3"
        fill="white" opacity="0.06"/>
      <rect x="51" y="97" width="58" height="32" rx="2"
        fill="none" stroke="white" strokeWidth="1" opacity="0.12"/>

      {/* Door knob */}
      <circle cx="108" cy="100" r="5" fill="#bfdbfe" filter="url(#ftb-sh-sm)"/>
      <circle cx="108" cy="100" r="3.5" fill="#93c5fd"/>
      <circle cx="107" cy="99" r="1.2" fill="white" opacity="0.6"/>

      {/* Key in lock */}
      <circle cx="108" cy="90" r="3" fill="#00B4A0"/>
      <circle cx="108" cy="90" r="1.5" fill="#f0fdfa"/>
      <rect x="109.5" y="88.5" width="7" height="2.5" rx="1" fill="#00B4A0"/>
      <rect x="114" y="91" width="2.5" height="4" rx="1" fill="#00B4A0"/>
      <rect x="110.5" y="91" width="2.5" height="3" rx="1" fill="#00B4A0"/>

      {/* Letter slot */}
      <rect x="66" y="86" width="28" height="5" rx="2.5"
        fill="#063d6e" stroke="#0d5a96" strokeWidth="0.8"/>

      {/* Door number */}
      <text x="80" y="82" textAnchor="middle" fontSize="11"
        fill="white" opacity="0.35" fontFamily="Georgia, serif" fontWeight="700">01</text>

      {/* Steps */}
      <rect x="36" y="138" width="88" height="7" rx="3"
        fill="url(#step-grad)" stroke="#bfdbfe" strokeWidth="1"/>
      <rect x="28" y="143" width="104" height="6" rx="3"
        fill="#dbeafe" stroke="#bfdbfe" strokeWidth="1"/>

      {/* Potted plant left */}
      <rect x="30" y="118" width="10" height="12" rx="2" fill="#bfdbfe"/>
      <ellipse cx="35" cy="118" rx="7" ry="5" fill="#93c5fd" opacity="0.4"/>
      <path d="M35 100 Q30 108 32 118" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M35 100 Q40 108 38 118" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M35 100 Q35 106 35 118" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="32" cy="106" rx="5" ry="3" fill="#86efac" opacity="0.8"/>
      <ellipse cx="38" cy="109" rx="5" ry="3" fill="#4ade80" opacity="0.7"/>

      {/* Potted plant right */}
      <rect x="120" y="118" width="10" height="12" rx="2" fill="#bfdbfe"/>
      <path d="M125 100 Q120 108 122 118" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M125 100 Q130 108 128 118" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M125 100 Q125 106 125 118" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="122" cy="106" rx="5" ry="3" fill="#86efac" opacity="0.8"/>
      <ellipse cx="128" cy="109" rx="5" ry="3" fill="#4ade80" opacity="0.7"/>
    </svg>
  );
}
