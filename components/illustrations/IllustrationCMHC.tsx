export default function IllustrationCMHC() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="cmhc-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1068A8" floodOpacity="0.18"/>
        </filter>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Soft glow behind shield */}
      <ellipse cx="80" cy="85" rx="48" ry="52" fill="#eff6ff" opacity="0.7"/>

      {/* Shield */}
      <g filter="url(#cmhc-shadow)">
        <path d="M80 22 L118 38 L118 82 C118 108 80 126 80 126 C80 126 42 108 42 82 L42 38 Z"
          fill="url(#shield-grad)"/>
        {/* Shield inner highlight */}
        <path d="M80 28 L112 42 L112 80 C112 102 80 118 80 118 C80 118 48 102 48 80 L48 42 Z"
          fill="#1878c0" opacity="0.4"/>
        {/* Shield rim */}
        <path d="M80 22 L118 38 L118 82 C118 108 80 126 80 126 C80 126 42 108 42 82 L42 38 Z"
          stroke="#fff" strokeWidth="1" opacity="0.2" fill="none"/>
      </g>

      {/* Check inside shield */}
      <path d="M58 78 L72 94 L104 62"
        stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M58 78 L72 94 L104 62"
        stroke="#5eead4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Lock icon at top of shield */}
      <rect x="70" y="36" width="20" height="15" rx="3" fill="white" opacity="0.9"/>
      <path d="M75 36 C75 30 85 30 85 36" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" fill="none" opacity="0.9"/>
      <circle cx="80" cy="43" r="2" fill="#1068A8"/>

      {/* Small decorative dots */}
      <circle cx="30" cy="50" r="4" fill="#bfdbfe"/>
      <circle cx="22" cy="66" r="2.5" fill="#dbeafe"/>
      <circle cx="132" cy="48" r="3.5" fill="#bfdbfe"/>
      <circle cx="140" cy="66" r="2" fill="#dbeafe"/>
    </svg>
  );
}
