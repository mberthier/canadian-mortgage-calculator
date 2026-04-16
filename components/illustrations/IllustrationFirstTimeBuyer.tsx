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
      </defs>

      {/* Soft glow — matches CMHC/LTT pattern */}
      <ellipse cx="72" cy="90" rx="58" ry="54" fill="#eff6ff" opacity="0.6"/>

      {/* Ground shadow */}
      <ellipse cx="72" cy="140" rx="52" ry="8" fill="#dbeafe" opacity="0.5"/>

      {/* House — centred, vertically fills the viewBox */}
      <g filter="url(#ftb-sh)">
        {/* Roof left */}
        <path d="M26 72 L72 40 L72 72 Z" fill="#0a4f85"/>
        {/* Roof right */}
        <path d="M72 40 L118 72 L72 72 Z" fill="#0d6bbf"/>
        {/* Roof ridge */}
        <path d="M26 72 L72 40 L118 72"
          stroke="white" strokeWidth="1.2" opacity="0.15" fill="none"/>

        {/* Front wall */}
        <rect x="26" y="72" width="46" height="62" fill="url(#ftb-front)"/>
        {/* Side wall */}
        <rect x="72" y="72" width="46" height="62" fill="url(#ftb-side)"/>

        {/* Front window left */}
        <rect x="34" y="83" width="13" height="12" rx="2" fill="#bfdbfe" opacity="0.9"/>
        <line x1="40" y1="83" x2="40" y2="95" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        <line x1="34" y1="89" x2="47" y2="89" stroke="white" strokeWidth="0.8" opacity="0.6"/>

        {/* Front window right */}
        <rect x="53" y="83" width="13" height="12" rx="2" fill="#bfdbfe" opacity="0.9"/>
        <line x1="59" y1="83" x2="59" y2="95" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        <line x1="53" y1="89" x2="66" y2="89" stroke="white" strokeWidth="0.8" opacity="0.6"/>

        {/* Side window */}
        <rect x="81" y="83" width="18" height="12" rx="2" fill="#93c5fd" opacity="0.45"/>
        <line x1="90" y1="83" x2="90" y2="95" stroke="white" strokeWidth="0.7" opacity="0.4"/>

        {/* Front door — arched */}
        <path d="M42 134 L42 112 Q42 106 49 106 Q56 106 56 112 L56 134 Z"
          fill="#063d6e"/>
        <path d="M43 134 L43 112 Q43 107 49 107 Q55 107 55 112 L55 134 Z"
          fill="#0a4f85" opacity="0.4"/>

        {/* Front step */}
        <rect x="38" y="132" width="22" height="4" rx="1.5" fill="#0a4f85"/>

        {/* Ground line */}
        <line x1="26" y1="134" x2="72" y2="134"
          stroke="white" strokeWidth="0.4" opacity="0.15"/>
      </g>

      {/* "1st" ribbon — top right, clean and contained */}
      <g filter="url(#ftb-sh-sm)">
        <path d="M104 28 L148 28 L148 50 L104 50 L112 39 Z" fill="#00B4A0"/>
        <path d="M104 28 L112 39 L104 50 Z" fill="#008f80"/>
        <text x="130" y="39" textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13" fill="white"
          fontFamily="Georgia, serif" fontWeight="800">1st</text>
      </g>

      {/* Decorative dots — same language as CMHC, LTT */}
      <circle cx="16" cy="56" r="4" fill="#bfdbfe"/>
      <circle cx="10" cy="74" r="2.5" fill="#dbeafe"/>
      <circle cx="138" cy="52" r="3.5" fill="#bfdbfe"/>
      <circle cx="146" cy="68" r="2" fill="#dbeafe"/>
      <circle cx="140" cy="118" r="3" fill="#99f6e4" opacity="0.7"/>
    </svg>
  );
}
