// Formula illustration, correct Canadian math
export function IllustrationFormula() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="80" height="64" rx="12" fill="#eff6ff"/>
      <text x="10" y="22" fontSize="10" fill="#1068A8" fontFamily="monospace" fontWeight="700">EAR =</text>
      <text x="10" y="36" fontSize="9" fill="#0d5a96" fontFamily="monospace">(1 + r/2)² − 1</text>
      <line x1="10" y1="44" x2="70" y2="44" stroke="#dbeafe" strokeWidth="1"/>
      <text x="10" y="56" fontSize="8" fill="#999999" fontFamily="sans-serif">Interest Act</text>
    </svg>
  );
}

// Receipt illustration, every upfront cost
export function IllustrationReceipt() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="80" height="64" rx="12" fill="#eff6ff"/>
      {/* Receipt shape */}
      <rect x="18" y="8" width="44" height="48" rx="3" fill="white" stroke="#dbeafe" strokeWidth="1.5"/>
      <line x1="24" y1="20" x2="56" y2="20" stroke="#dbeafe" strokeWidth="1"/>
      <line x1="24" y1="28" x2="56" y2="28" stroke="#dbeafe" strokeWidth="1"/>
      <line x1="24" y1="36" x2="56" y2="36" stroke="#dbeafe" strokeWidth="1"/>
      <line x1="24" y1="44" x2="56" y2="44" stroke="#1068A8" strokeWidth="1.5"/>
      <text x="24" y="53" fontSize="8" fill="#1068A8" fontFamily="sans-serif" fontWeight="700">TOTAL</text>
    </svg>
  );
}

// Calendar illustration, rules updated
export function IllustrationCalendar() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="80" height="64" rx="12" fill="#eff6ff"/>
      <rect x="12" y="14" width="56" height="42" rx="4" fill="white" stroke="#dbeafe" strokeWidth="1.5"/>
      <rect x="12" y="14" width="56" height="14" rx="4" fill="#1068A8"/>
      {/* Calendar header pins */}
      <line x1="28" y1="10" x2="28" y2="20" stroke="#0d5a96" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="52" y1="10" x2="52" y2="20" stroke="#0d5a96" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="30" y="24" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Dec 2024</text>
      {/* Grid dots for days */}
      {[0,1,2,3,4,5,6].map(c => (
        <circle key={c} cx={20 + c*9} cy={38} r={2} fill={c === 4 ? "#1068A8" : "#dbeafe"}/>
      ))}
      {[0,1,2,3].map(c => (
        <circle key={c} cx={20 + c*9} cy={48} r={2} fill="#dbeafe"/>
      ))}
      {/* Checkmark on the highlighted day */}
      <path d="M61 34 L64 38 L70 30" stroke="#1068A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
