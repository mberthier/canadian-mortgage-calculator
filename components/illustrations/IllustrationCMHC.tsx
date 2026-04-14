export default function IllustrationCMHC() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Shield */}
      <path d="M100 18 L148 36 L148 80 C148 108 100 124 100 124 C100 124 52 108 52 80 L52 36 Z"
        fill="#eff6ff" stroke="#1068A8" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M100 28 L138 43 L138 78 C138 100 100 114 100 114 C100 114 62 100 62 78 L62 43 Z"
        fill="#dbeafe"/>

      {/* House inside shield */}
      <path d="M84 90 L84 72 L100 60 L116 72 L116 90 Z" fill="#1068A8" strokeLinejoin="round"/>
      <rect x="92" y="78" width="16" height="12" rx="1" fill="#eff6ff"/>
      <path d="M80 73 L100 58 L120 73" stroke="#1068A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Small check mark */}
      <path d="M88 84 L95 91 L112 72" stroke="#eff6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Decorative dots */}
      <circle cx="30" cy="50" r="4" fill="#dbeafe"/>
      <circle cx="22" cy="68" r="2.5" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1"/>
      <circle cx="170" cy="50" r="4" fill="#dbeafe"/>
      <circle cx="178" cy="68" r="2.5" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1"/>
    </svg>
  );
}
