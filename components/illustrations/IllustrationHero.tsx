export default function IllustrationHero() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background circles */}
      <circle cx="160" cy="40" r="36" fill="#eff6ff"/>
      <circle cx="160" cy="40" r="22" fill="#dbeafe"/>

      {/* Key bow */}
      <circle cx="72" cy="70" r="28" stroke="#1068A8" strokeWidth="7" fill="none"/>
      <circle cx="72" cy="70" r="14" fill="#1068A8"/>
      <circle cx="72" cy="70" r="6" fill="#eff6ff"/>

      {/* Key shaft */}
      <rect x="96" y="66" width="68" height="8" rx="4" fill="#1068A8"/>

      {/* Key teeth */}
      <rect x="148" y="74" width="8" height="14" rx="2" fill="#1068A8"/>
      <rect x="132" y="74" width="8" height="10" rx="2" fill="#1068A8"/>
      <rect x="116" y="74" width="8" height="16" rx="2" fill="#1068A8"/>

      {/* Sparkle lines, crystal reference */}
      <line x1="160" y1="14" x2="160" y2="24" stroke="#0d5a96" strokeWidth="2" strokeLinecap="round"/>
      <line x1="160" y1="56" x2="160" y2="66" stroke="#0d5a96" strokeWidth="2" strokeLinecap="round"/>
      <line x1="134" y1="40" x2="144" y2="40" stroke="#0d5a96" strokeWidth="2" strokeLinecap="round"/>
      <line x1="176" y1="40" x2="186" y2="40" stroke="#0d5a96" strokeWidth="2" strokeLinecap="round"/>
      <line x1="141" y1="21" x2="148" y2="28" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round"/>
      <line x1="172" y1="52" x2="179" y2="59" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round"/>
      <line x1="141" y1="59" x2="148" y2="52" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round"/>
      <line x1="172" y1="28" x2="179" y2="21" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round"/>

      {/* Small house outline below */}
      <path d="M30 120 L30 100 L44 88 L58 100 L58 120 Z" stroke="#999999" strokeWidth="1.5" fill="#f0f0f0" strokeLinejoin="round"/>
      <rect x="37" y="108" width="14" height="12" rx="1" fill="#dbeafe"/>

      {/* Dollar/chart tick marks, financial context */}
      <path d="M10 115 L20 105 L28 112" stroke="#dbeafe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
