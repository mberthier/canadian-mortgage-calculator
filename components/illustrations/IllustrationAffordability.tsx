export default function IllustrationAffordability() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Scale pole */}
      <line x1="100" y1="30" x2="100" y2="110" stroke="#1068A8" strokeWidth="3" strokeLinecap="round"/>

      {/* Scale base */}
      <rect x="82" y="108" width="36" height="8" rx="4" fill="#1068A8"/>
      <rect x="90" y="100" width="20" height="10" rx="2" fill="#0d5a96"/>

      {/* Scale beam, tilted slightly left (house is heavier, reality) */}
      <line x1="34" y1="44" x2="166" y2="36" stroke="#1068A8" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="100" cy="40" r="5" fill="#1068A8"/>

      {/* Left pan, house (heavier, lower) */}
      <line x1="34" y1="44" x2="34" y2="72" stroke="#0d5a96" strokeWidth="1.5"/>
      <path d="M18 82 L18 72 L34 60 L50 72 L50 82 Z" fill="#1068A8" strokeLinejoin="round"/>
      <rect x="26" y="74" width="16" height="8" rx="1" fill="#eff6ff"/>
      <path d="M16 74 L34 61 L52 74" stroke="#1068A8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Pan */}
      <path d="M14 84 Q34 90 54 84" stroke="#0d5a96" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Right pan, income (lighter, higher) */}
      <line x1="166" y1="36" x2="166" y2="60" stroke="#0d5a96" strokeWidth="1.5"/>
      {/* Coin stack */}
      <ellipse cx="166" cy="76" rx="18" ry="5" fill="#dbeafe"/>
      <rect x="148" y="68" width="36" height="8" rx="4" fill="#dbeafe" stroke="#0d5a96" strokeWidth="1"/>
      <rect x="148" y="62" width="36" height="8" rx="4" fill="#eff6ff" stroke="#0d5a96" strokeWidth="1"/>
      <rect x="148" y="56" width="36" height="8" rx="4" fill="#eff6ff" stroke="#0d5a96" strokeWidth="1"/>
      {/* Pan */}
      <path d="M148 78 Q166 84 184 78" stroke="#0d5a96" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* % sign */}
      <text x="90" y="26" fontSize="11" fill="#999999" fontFamily="sans-serif">39%</text>
    </svg>
  );
}
