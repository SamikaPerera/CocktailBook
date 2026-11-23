// Login page intro: a bottle slides in and tips, amber liquid pours into a
// coupe, the glass fills, a cherry drops in and the bottle leaves.
// All timing is in CSS (.splash-* and @keyframes in index.css) - one 2.4 s
// timeline that plays once. The login form fades in while it's still playing,
// so it never slows anyone down.
export default function PourSplash() {
  return (
    <svg className="splash" viewBox="0 0 240 180" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="splash-bowl">
          <path d="M80 100 C84 130 104 138 120 138 C136 138 156 130 160 100 Z" />
        </clipPath>
        <linearGradient id="splash-drink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4c77a" />
          <stop offset="1" stopColor="#d9861f" />
        </linearGradient>
        <linearGradient id="splash-bottle-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f5d3a" />
          <stop offset="0.5" stopColor="#4c8a5a" />
          <stop offset="1" stopColor="#2f5d3a" />
        </linearGradient>
      </defs>

      {/* Liquid rising inside the coupe */}
      <g clipPath="url(#splash-bowl)">
        <path d="M80 100 C84 130 104 138 120 138 C136 138 156 130 160 100 Z" fill="rgba(255,255,255,0.06)" />
        <g className="splash-liquid">
          <rect x="70" y="100" width="100" height="45" fill="url(#splash-drink)" opacity="0.9" />
          <rect x="70" y="100" width="100" height="2" fill="#fff" opacity="0.35" />
        </g>
      </g>

      {/* Stream from the bottle's mouth down into the glass */}
      <rect className="splash-stream" x="129.5" y="64" width="3" height="56" rx="1.5" fill="#e8a33d" />

      {/* Coupe glass outline */}
      <g fill="none" stroke="var(--glass-stroke)" strokeWidth="2" strokeLinecap="round">
        <path d="M78 98 C82 132 102 140 120 140 C138 140 158 132 162 98" />
        <path d="M120 140 V168" />
        <path d="M98 172 Q120 164 142 172" />
      </g>

      {/* Cherry that drops in at the end */}
      <g className="splash-cherry">
        <path d="M148 96 q3 -12 12 -16" fill="none" stroke="#5b3a1a" strokeWidth="1.5" />
        <circle cx="147" cy="100" r="6.5" fill="#b3122b" />
        <circle cx="145" cy="98" r="1.8" fill="#fff" opacity="0.6" />
      </g>

      {/* Bottle: drawn upright, then rotated into a pouring position */}
      <g className="splash-bottle">
        <g transform="translate(152 50) rotate(-125)">
          <rect x="-13" y="0" width="26" height="50" rx="6" fill="url(#splash-bottle-glass)" />
          <path d="M-13 4 Q-13 -6 -4 -10 L-4 -22 L4 -22 L4 -10 Q13 -6 13 4 Z" fill="url(#splash-bottle-glass)" />
          <rect x="-5" y="-26" width="10" height="5" rx="1.5" fill="#c9a24a" />
          <rect x="-11" y="16" width="22" height="18" rx="2" fill="#f4eee8" />
          <rect x="-7" y="22" width="14" height="2" fill="#e8a33d" />
          <rect x="-7" y="27" width="10" height="2" fill="#b9adb8" />
        </g>
      </g>

      {/* Sparkles when the drink is ready */}
      {[[96, 92], [166, 112], [112, 84]].map(([x, y], i) => (
        <path
          key={i}
          className="splash-sparkle"
          style={{ animationDelay: `${i * 80}ms` }}
          d={`M${x} ${y - 5} L${x + 1.5} ${y - 1.5} L${x + 5} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 5} L${x - 1.5} ${y + 1.5} L${x - 5} ${y} L${x - 1.5} ${y - 1.5} Z`}
          fill="#f4c77a"
        />
      ))}
    </svg>
  );
}
