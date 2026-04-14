export default function IllustrationLTT() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Document */}
      <rect x="46" y="18" width="80" height="104" rx="6" fill="white" stroke="#b5d4f4" strokeWidth="2"/>
      <rect x="46" y="18" width="80" height="104" rx="6" fill="#dce8f2"/>

      {/* Document fold corner */}
      <path d="M106 18 L126 38 L106 38 Z" fill="#b5d4f4"/>
      <path d="M106 18 L126 38" stroke="#7a9ab5" strokeWidth="1.5"/>

      {/* Document lines */}
      <line x1="60" y1="54" x2="110" y2="54" stroke="#7a9ab5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="66" x2="100" y2="66" stroke="#7a9ab5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="78" x2="108" y2="78" stroke="#7a9ab5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="90" x2="92" y2="90" stroke="#7a9ab5" strokeWidth="2" strokeLinecap="round"/>

      {/* Stamp circle */}
      <circle cx="138" cy="90" r="32" fill="#1068A8"/>
      <circle cx="138" cy="90" r="26" fill="none" stroke="#0d5a96" strokeWidth="2" strokeDasharray="4 3"/>

      {/* Maple leaf simplified */}
      <path d="M138 72 L141 80 L150 78 L144 84 L147 94 L138 89 L129 94 L132 84 L126 78 L135 80 Z"
        fill="#e6f1fb"/>
      <line x1="138" y1="89" x2="138" y2="98" stroke="#e6f1fb" strokeWidth="2" strokeLinecap="round"/>

      {/* Small $ signs */}
      <text x="60" y="108" fontSize="10" fill="#0d5a96" fontFamily="sans-serif" fontWeight="600">$</text>
      <text x="73" y="108" fontSize="10" fill="#0d5a96" fontFamily="sans-serif" fontWeight="600">$</text>
      <text x="86" y="108" fontSize="10" fill="#0d5a96" fontFamily="sans-serif" fontWeight="600">$</text>
    </svg>
  );
}
