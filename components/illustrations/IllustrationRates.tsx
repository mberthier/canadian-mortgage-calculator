export default function IllustrationRates() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Grid lines */}
      <line x1="24" y1="110" x2="186" y2="110" stroke="#eeeeee" strokeWidth="1"/>
      <line x1="24" y1="88" x2="186" y2="88" stroke="#eeeeee" strokeWidth="1"/>
      <line x1="24" y1="66" x2="186" y2="66" stroke="#eeeeee" strokeWidth="1"/>
      <line x1="24" y1="44" x2="186" y2="44" stroke="#eeeeee" strokeWidth="1"/>

      {/* Y axis */}
      <line x1="24" y1="22" x2="24" y2="112" stroke="#dbeafe" strokeWidth="1.5"/>

      {/* Rate labels */}
      <text x="6" y="113" fontSize="8" fill="#999999" fontFamily="sans-serif">0%</text>
      <text x="6" y="91" fontSize="8" fill="#999999" fontFamily="sans-serif">2%</text>
      <text x="6" y="69" fontSize="8" fill="#999999" fontFamily="sans-serif">4%</text>
      <text x="6" y="47" fontSize="8" fill="#999999" fontFamily="sans-serif">6%</text>

      {/* 5yr Fixed rate line (blue → now green family), goes up then down */}
      <path d="M28 100 L50 90 L70 72 L90 54 L106 50 L120 52 L136 58 L152 66 L170 68 L186 66"
        stroke="#dbeafe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        strokeDasharray="5 3"/>

      {/* BoC overnight rate line, sharp rise, nine steps down */}
      <path d="M28 108 L46 108 L46 86 L64 86 L64 70 L80 70 L80 55 L96 55 L96 55 L110 55
               L110 63 L122 63 L122 70 L134 70 L134 80 L148 80 L148 88 L162 88 L162 88 L186 88"
        stroke="#1068A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Peak annotation */}
      <circle cx="96" cy="55" r="4" fill="#1068A8"/>
      <rect x="88" y="36" width="38" height="16" rx="3" fill="#1068A8"/>
      <text x="93" y="47" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Peak 5%</text>
      <line x1="96" y1="52" x2="96" y2="51" stroke="#1068A8" strokeWidth="1.5"/>

      {/* Current level annotation */}
      <circle cx="186" cy="88" r="4" fill="#0d5a96"/>
      <rect x="152" y="72" width="44" height="16" rx="3" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1"/>
      <text x="157" y="83" fontSize="8" fill="#1068A8" fontFamily="sans-serif" fontWeight="600">Now 2.25%</text>

      {/* Legend */}
      <line x1="28" y1="126" x2="44" y2="126" stroke="#1068A8" strokeWidth="2" strokeLinecap="round"/>
      <text x="47" y="129" fontSize="8" fill="#999999" fontFamily="sans-serif">BoC Rate</text>
      <line x1="100" y1="126" x2="116" y2="126" stroke="#dbeafe" strokeWidth="2"
        strokeDasharray="5 3" strokeLinecap="round"/>
      <text x="119" y="129" fontSize="8" fill="#999999" fontFamily="sans-serif">5yr Fixed</text>
    </svg>
  );
}
