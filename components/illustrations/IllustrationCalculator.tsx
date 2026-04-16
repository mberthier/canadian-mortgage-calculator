export default function IllustrationCalculator() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* House */}
      <path d="M60 95 L60 65 L100 40 L140 65 L140 95 Z"
        fill="#eff6ff" stroke="#1068A8" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M55 67 L100 38 L145 67"
        stroke="#1068A8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Door */}
      <rect x="88" y="75" width="24" height="20" rx="2" fill="#1068A8"/>
      <circle cx="108" cy="85" r="2" fill="#eff6ff"/>
      {/* Window */}
      <rect x="67" y="68" width="16" height="14" rx="2" fill="#dbeafe" stroke="#1068A8" strokeWidth="1.5"/>
      <line x1="75" y1="68" x2="75" y2="82" stroke="#1068A8" strokeWidth="1"/>
      <line x1="67" y1="75" x2="83" y2="75" stroke="#1068A8" strokeWidth="1"/>
      {/* Dollar sign bubble */}
      <circle cx="152" cy="38" r="20" fill="#1068A8"/>
      <text x="152" y="44" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">$</text>
      {/* Chart bars */}
      <rect x="22" y="72" width="10" height="23" rx="2" fill="#dbeafe"/>
      <rect x="35" y="62" width="10" height="33" rx="2" fill="#93c5fd"/>
      <rect x="48" y="52" width="10" height="43" rx="2" fill="#1068A8"/>
      {/* Decorative dots */}
      <circle cx="30" cy="40" r="3" fill="#dbeafe"/>
      <circle cx="170" cy="80" r="3" fill="#dbeafe"/>
      <circle cx="165" cy="95" r="2" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1"/>
    </svg>
  );
}
