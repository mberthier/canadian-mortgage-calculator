export default function IllustrationBreakPenalty() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="bp-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="chain-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Background circle glow */}
      <circle cx="80" cy="80" r="52" fill="#fef3c7" opacity="0.3"/>

      {/* Broken chain — left link */}
      <g filter="url(#bp-shadow)">
        <path d="M38 88 C38 78 48 70 58 70 L68 70 C78 70 88 78 88 88 C88 98 78 106 68 106 L58 106 C48 106 38 98 38 88 Z"
          fill="none" stroke="url(#chain-grad)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M38 88 C38 78 48 70 58 70 L68 70 C78 70 88 78 88 88 C88 98 78 106 68 106 L58 106 C48 106 38 98 38 88 Z"
          fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Broken chain — right link (offset and rotated) */}
      <g transform="translate(34, -34) rotate(15, 80, 88)" filter="url(#bp-shadow)">
        <path d="M38 88 C38 78 48 70 58 70 L68 70 C78 70 88 78 88 88 C88 98 78 106 68 106 L58 106 C48 106 38 98 38 88 Z"
          fill="none" stroke="url(#chain-grad)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M38 88 C38 78 48 70 58 70 L68 70 C78 70 88 78 88 88 C88 98 78 106 68 106 L58 106 C48 106 38 98 38 88 Z"
          fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Break point sparks */}
      <line x1="85" y1="62" x2="90" y2="54" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="92" y1="66" x2="100" y2="62" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="88" y1="72" x2="96" y2="74" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>

      {/* Warning badge */}
      <circle cx="122" cy="42" r="16" fill="#f59e0b" filter="url(#bp-shadow)"/>
      <path d="M122 32 L126 48 L118 48 Z" fill="white"/>
      <text x="122" y="53" textAnchor="middle" fontSize="9" fill="white"
        fontFamily="sans-serif" fontWeight="800">!</text>

      {/* $ cost label */}
      <rect x="20" y="114" width="38" height="18" rx="6" fill="#1068A8" filter="url(#bp-shadow)"/>
      <text x="39" y="127" textAnchor="middle" fontSize="9" fill="white"
        fontFamily="sans-serif" fontWeight="700">penalty</text>

      {/* Dots */}
      <circle cx="24" cy="52" r="3" fill="#bfdbfe"/>
      <circle cx="148" cy="100" r="2.5" fill="#fde68a"/>
    </svg>
  );
}
