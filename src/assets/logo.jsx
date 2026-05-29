export default function TaxitLogo({ width = 140, white = false }) {
  const text   = white ? '#ffffff' : '#1A2B6B'
  const sub    = white ? 'rgba(255,255,255,0.55)' : '#64748b'
  const globe  = white ? 'rgba(255,255,255,0.18)' : '#e8ecf8'
  const line   = white ? 'rgba(255,255,255,0.55)' : '#3a4fa0'
  const accent = '#F5C518'
  const h = Math.round(width * 0.36)
  return (
    <svg width={width} height={h} viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg">
      {/* Globe */}
      <circle cx="48" cy="54" r="38" fill={globe}/>
      <circle cx="48" cy="54" r="38" fill="none" stroke={line} strokeWidth="2"/>
      <ellipse cx="48" cy="54" rx="18" ry="38" fill="none" stroke={line} strokeWidth="1.8"/>
      <line x1="10" y1="54" x2="86" y2="54" stroke={line} strokeWidth="1.5"/>
      <line x1="15" y1="35" x2="81" y2="35" stroke={line} strokeWidth="1.2" opacity="0.6"/>
      <line x1="15" y1="73" x2="81" y2="73" stroke={line} strokeWidth="1.2" opacity="0.6"/>
      {/* Accent pin on top */}
      <circle cx="48" cy="16" r="6" fill={accent}/>
      <line x1="48" y1="22" x2="48" y2="32" stroke={accent} strokeWidth="2"/>
      {/* TAXIT */}
      <text x="102" y="46" fontFamily="'Segoe UI',Arial,sans-serif" fontWeight="800" fontSize="30" fill={text} letterSpacing="0.5">TAXIT</text>
      {/* WORLD in accent */}
      <text x="102" y="76" fontFamily="'Segoe UI',Arial,sans-serif" fontWeight="800" fontSize="30" fill={accent} letterSpacing="0.5">WORLD</text>
      {/* tagline */}
      <text x="103" y="93" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="9.5" fill={sub} letterSpacing="2.5">BUSINESS CONSULTANCY</text>
    </svg>
  )
}
