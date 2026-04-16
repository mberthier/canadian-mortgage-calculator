export default function IllustrationLTT() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="ltt-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1068A8" floodOpacity="0.15"/>
        </filter>
        <linearGradient id="doc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#f0f6ff"/>
        </linearGradient>
      </defs>

      {/* Shadow under stack */}
      <ellipse cx="80" cy="136" rx="44" ry="7" fill="#dbeafe" opacity="0.5"/>

      {/* Back document */}
      <rect x="56" y="30" width="72" height="90" rx="6"
        fill="#dbeafe" stroke="#bfdbfe" strokeWidth="1.5" filter="url(#ltt-shadow)"/>

      {/* Middle document */}
      <rect x="50" y="24" width="72" height="90" rx="6"
        fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" filter="url(#ltt-shadow)"/>

      {/* Front document */}
      <rect x="44" y="18" width="72" height="90" rx="6"
        fill="url(#doc-grad)" stroke="#dbeafe" strokeWidth="1.5" filter="url(#ltt-shadow)"/>

      {/* Folded corner */}
      <path d="M96 18 L116 38 L96 38 Z" fill="#dbeafe"/>
      <path d="M96 18 L116 38" stroke="#bfdbfe" strokeWidth="1.5"/>

      {/* Document lines */}
      <rect x="56" y="50" width="36" height="4" rx="2" fill="#bfdbfe"/>
      <rect x="56" y="60" width="48" height="3" rx="1.5" fill="#dbeafe"/>
      <rect x="56" y="69" width="42" height="3" rx="1.5" fill="#dbeafe"/>
      <rect x="56" y="78" width="30" height="3" rx="1.5" fill="#dbeafe"/>

      {/* Red stamp circle */}
      <circle cx="94" cy="96" r="22" fill="#1068A8" filter="url(#ltt-shadow)"/>
      <circle cx="94" cy="96" r="17" fill="none" stroke="#fff" strokeWidth="1.5"
        strokeDasharray="3 2" opacity="0.4"/>
      {/* $ in stamp */}
      <text x="94" y="103" textAnchor="middle" fontSize="20" fontWeight="800"
        fill="white" fontFamily="Georgia, serif">$</text>

      {/* Maple leaf accent */}
      <path d="M28 80 L30 86 L36 84 L33 88 L35 95 L28 91 L21 95 L23 88 L20 84 L26 86 Z"
        fill="#bfdbfe" opacity="0.8"/>
    </svg>
  );
}
