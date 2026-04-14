export default function IllustrationGlossary() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Book left page */}
      <path d="M24 26 Q24 20 30 20 L98 20 L98 116 Q64 108 30 116 Q24 116 24 110 Z"
        fill="#e6f1fb" stroke="#1068A8" strokeWidth="2"/>

      {/* Book right page */}
      <path d="M102 20 L170 20 Q176 20 176 26 L176 110 Q176 116 170 116 Q136 108 102 116 Z"
        fill="#dce8f2" stroke="#1068A8" strokeWidth="2"/>

      {/* Spine */}
      <rect x="97" y="18" width="6" height="100" rx="3" fill="#1068A8"/>

      {/* Left page lines — text */}
      <line x1="36" y1="38" x2="90" y2="38" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="48" x2="82" y2="48" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="58" x2="88" y2="58" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="68" x2="76" y2="68" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="78" x2="86" y2="78" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="88" x2="80" y2="88" stroke="#b5d4f4" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Right page — highlighted term */}
      <rect x="110" y="34" width="54" height="14" rx="3" fill="#b5d4f4"/>
      <line x1="110" y1="56" x2="160" y2="56" stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="64" x2="155" y2="64" stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="72" x2="162" y2="72" stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="110" y1="80" x2="150" y2="80" stroke="#7a9ab5" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Magnifying glass */}
      <circle cx="152" cy="104" r="18" fill="white" stroke="#1068A8" strokeWidth="3"/>
      <circle cx="152" cy="104" r="12" fill="#e6f1fb"/>
      {/* A inside mag glass — glossary reference */}
      <text x="146" y="110" fontSize="14" fill="#1068A8" fontFamily="serif" fontWeight="700">A</text>
      {/* Handle */}
      <line x1="164" y1="116" x2="178" y2="130" stroke="#1068A8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
