export default function IllustrationGlossary() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="glos-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1068A8" floodOpacity="0.15"/>
        </filter>
        <linearGradient id="book-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1068A8"/>
          <stop offset="100%" stopColor="#0d5a96"/>
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="82" cy="136" rx="50" ry="8" fill="#dbeafe" opacity="0.4"/>

      {/* Book pages stack — right side */}
      <rect x="82" y="28" width="52" height="96" rx="3"
        fill="#f8faff" stroke="#dbeafe" strokeWidth="1" filter="url(#glos-shadow)"/>

      {/* Page lines */}
      {[44, 54, 64, 74, 84, 94, 104].map((y, i) => (
        <rect key={i} x="90" y={y} width={i % 2 === 0 ? 36 : 28} height="3" rx="1.5" fill="#dbeafe"/>
      ))}

      {/* Book spine */}
      <rect x="68" y="24" width="16" height="104" rx="2"
        fill="#063d6e" filter="url(#glos-shadow)"/>

      {/* Book cover */}
      <rect x="26" y="24" width="56" height="104" rx="4"
        fill="url(#book-front)" filter="url(#glos-shadow)"/>

      {/* Cover highlight line */}
      <rect x="28" y="24" width="52" height="104" rx="4"
        fill="white" opacity="0.04"/>

      {/* Cover decoration */}
      <text x="54" y="62" textAnchor="middle" fontSize="32" fill="white"
        opacity="0.15" fontFamily="Georgia, serif" fontWeight="700">A</text>

      {/* Cover lines */}
      <rect x="36" y="74" width="36" height="3" rx="1.5" fill="white" opacity="0.25"/>
      <rect x="36" y="82" width="28" height="3" rx="1.5" fill="white" opacity="0.18"/>
      <rect x="36" y="90" width="32" height="3" rx="1.5" fill="white" opacity="0.18"/>

      {/* Bookmark ribbon */}
      <path d="M72 24 L72 58 L68 54 L64 58 L64 24 Z" fill="#00B4A0"/>

      {/* Magnifier */}
      <circle cx="120" cy="42" r="14" stroke="#1068A8" strokeWidth="3"
        fill="white" filter="url(#glos-shadow)"/>
      <circle cx="120" cy="42" r="9" fill="#eff6ff"/>
      <text x="120" y="47" textAnchor="middle" fontSize="12" fill="#1068A8"
        fontFamily="Georgia, serif" fontWeight="700">A</text>
      <line x1="130" y1="52" x2="140" y2="62"
        stroke="#1068A8" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}
