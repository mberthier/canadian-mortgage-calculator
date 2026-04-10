export default function IllustrationFirstTimeBuyer() {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* House body */}
      <rect x="40" y="62" width="90" height="68" rx="3" fill="#e8f2ec" stroke="#1a4731" strokeWidth="2"/>

      {/* Roof */}
      <path d="M30 66 L85 22 L140 66" fill="#1a4731" strokeLinejoin="round"/>
      <path d="M30 66 L85 22 L140 66" stroke="#1a4731" strokeWidth="2" strokeLinejoin="round" fill="#1a4731"/>

      {/* Chimney */}
      <rect x="106" y="28" width="12" height="22" rx="2" fill="#2d6a4f"/>

      {/* Door */}
      <rect x="68" y="96" width="28" height="34" rx="3" fill="#1a4731"/>
      <rect x="71" y="99" width="22" height="28" rx="2" fill="#2d6a4f"/>
      {/* Door knob */}
      <circle cx="87" cy="116" r="3" fill="#e8f2ec"/>

      {/* Windows */}
      <rect x="47" y="72" width="20" height="18" rx="2" fill="white" stroke="#c3dece" strokeWidth="1"/>
      <line x1="57" y1="72" x2="57" y2="90" stroke="#c3dece" strokeWidth="1"/>
      <line x1="47" y1="81" x2="67" y2="81" stroke="#c3dece" strokeWidth="1"/>
      <rect x="103" y="72" width="20" height="18" rx="2" fill="white" stroke="#c3dece" strokeWidth="1"/>
      <line x1="113" y1="72" x2="113" y2="90" stroke="#c3dece" strokeWidth="1"/>
      <line x1="103" y1="81" x2="123" y2="81" stroke="#c3dece" strokeWidth="1"/>

      {/* Key floating to the right */}
      <circle cx="165" cy="68" r="14" stroke="#1a4731" strokeWidth="3" fill="none"/>
      <circle cx="165" cy="68" r="7" fill="#1a4731"/>
      <circle cx="165" cy="68" r="3" fill="#e8f2ec"/>
      <rect x="177" y="65" width="20" height="5" rx="2.5" fill="#1a4731"/>
      <rect x="191" y="70" width="5" height="8" rx="1.5" fill="#1a4731"/>
      <rect x="183" y="70" width="5" height="6" rx="1.5" fill="#1a4731"/>

      {/* Sparkle near key */}
      <line x1="165" y1="46" x2="165" y2="52" stroke="#c3dece" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="148" y1="68" x2="152" y2="68" stroke="#c3dece" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="151" y1="52" x2="155" y2="56" stroke="#c3dece" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Path / walkway */}
      <path d="M85 130 L85 138 L100 138 L100 130" stroke="#c3dece" strokeWidth="1.5" fill="#ede9e1"/>
    </svg>
  );
}
