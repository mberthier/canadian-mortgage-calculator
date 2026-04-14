export default function IllustrationStressTest() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background gradient band — the "ceiling" */}
      <rect x="20" y="52" width="160" height="14" rx="4" fill="#dce8f2"/>
      <rect x="20" y="52" width="160" height="4" rx="4" fill="#b5d4f4"/>

      {/* Ceiling label */}
      <text x="148" y="64" fontSize="9" fill="#7a9ab5" fontFamily="sans-serif">5.25%</text>

      {/* Rate line going up — past the ceiling */}
      <path d="M24 118 L52 110 L80 102 L100 90 L114 72 L122 40"
        stroke="#1068A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Arrow head breaking through */}
      <path d="M116 30 L122 40 L128 30" stroke="#1068A8" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Crack in ceiling */}
      <path d="M106 52 L114 60 L108 66 L116 56 L122 62"
        stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Crack pieces falling */}
      <path d="M96 56 L92 66" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M118 62 L122 70" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="88" y="68" width="8" height="4" rx="1" fill="#b5d4f4" transform="rotate(-15 88 68)"/>
      <rect x="118" y="70" width="6" height="3" rx="1" fill="#b5d4f4" transform="rotate(10 118 70)"/>

      {/* Your rate label */}
      <rect x="24" y="106" width="52" height="18" rx="4" fill="#e6f1fb"/>
      <text x="30" y="119" fontSize="9" fill="#1068A8" fontFamily="sans-serif" fontWeight="600">Your rate</text>

      {/* Stress test label */}
      <rect x="130" y="28" width="54" height="18" rx="4" fill="#1068A8"/>
      <text x="136" y="41" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="600">+2% test</text>

      {/* Small data points on line */}
      <circle cx="52" cy="110" r="3" fill="#0d5a96"/>
      <circle cx="80" cy="102" r="3" fill="#0d5a96"/>
      <circle cx="100" cy="90" r="3" fill="#0d5a96"/>
    </svg>
  );
}
