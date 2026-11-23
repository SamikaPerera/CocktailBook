// Animated cocktail glass, drawn with SVG.
//
// - The glass shape comes from the spec's "glass" field (coupe, martini, rocks,
//   highball, wine, shot).
// - The ingredients are "poured" one after another: the liquid rises and its
//   colour changes as each one is added (see getPourSteps in drinkColour.js).
// - The surface moves in a gentle wave, fizzy drinks get rising bubbles, the
//   "ice" field adds floating cubes, and the "garnish" field adds a garnish
//   that drops onto the rim at the end.
// - Tap the glass to pour it again. With "reduce motion" switched on, the
//   finished drink is shown straight away.
//
// animated={false} draws a small still version (used in the spec list).
import { useEffect, useId, useMemo, useState } from 'react';
import { foamColour, getPourSteps, isFizzy } from '../utils/drinkColour.js';
import { prefersReducedMotion } from '../utils/motion.js';

const STEP_MS = 650;   // time to pour each ingredient
const MAX_FILL = 0.84; // a full glass is filled to 84% of its height

// Glass shapes in a 120 × 160 drawing area.
//   inside: the area liquid can fill   top/bottom: liquid limits (y)
//   outline + extras: what is drawn    rim: where the garnish sits
//   x: left/right limits for ice and bubbles
const GLASSES = {
  coupe: {
    inside: 'M18 44 C22 78 44 86 60 86 C76 86 98 78 102 44 Z',
    outline: 'M16 42 C20 80 42 88 60 88 C78 88 100 80 104 42',
    extras: ['M60 88 V140', 'M38 143 Q60 136 82 143'],
    top: 44, bottom: 86, rim: [100, 44], x: [30, 90],
  },
  martini: {
    inside: 'M16 36 L60 90 L104 36 Z',
    outline: 'M13 34 L60 92 L107 34',
    extras: ['M60 92 V140', 'M38 143 Q60 136 82 143'],
    top: 36, bottom: 90, rim: [103, 36], x: [40, 80],
  },
  rocks: {
    inside: 'M29 68 L33 136 Q33 139 36 139 L84 139 Q87 139 87 136 L91 68 Z',
    outline: 'M26 64 L31 142 Q32 147 38 147 L82 147 Q88 147 89 142 L94 64',
    extras: ['M33 139 H87'],
    top: 68, bottom: 139, rim: [91, 66], x: [36, 84],
  },
  highball: {
    inside: 'M39 26 L41 142 L79 142 L81 26 Z',
    outline: 'M36 22 L38 147 Q38 151 42 151 L78 151 Q82 151 82 147 L84 22',
    extras: ['M41 142 H79'],
    top: 26, bottom: 142, rim: [82, 24], x: [44, 76],
  },
  wine: {
    inside: 'M32 30 C30 72 42 96 60 96 C78 96 90 72 88 30 Z',
    outline: 'M30 28 C28 74 40 98 60 98 C80 98 92 74 90 28',
    extras: ['M60 98 V140', 'M40 143 Q60 136 80 143'],
    top: 30, bottom: 96, rim: [88, 30], x: [40, 80],
  },
  shot: {
    inside: 'M45 96 L47 141 L73 141 L75 96 Z',
    outline: 'M42 92 L44 146 Q45 149 48 149 L72 149 Q75 149 76 146 L78 92',
    extras: ['M47 141 H73'],
    top: 96, bottom: 141, rim: [76, 94], x: [50, 70],
  },
};

export function glassTypeFor(glassText = '') {
  const g = glassText.toLowerCase();
  if (/coupe|nick|nora|saucer/.test(g)) return 'coupe';
  if (/martini|cocktail glass|v-shape/.test(g)) return 'martini';
  if (/highball|collins|tall|zombie|sling|copper|mug|hurricane|tiki/.test(g)) return 'highball';
  if (/wine|spritz|balloon|goblet|flute|champagne/.test(g)) return 'wine';
  if (/shot|shooter/.test(g)) return 'shot';
  return 'rocks'; // rocks, old fashioned, tumbler and anything unknown
}

// How many ice cubes, and how big, from the "ice" field.
function iceFor(iceText = '') {
  const ice = iceText.toLowerCase();
  if (/none|no ice|up\b|neat|served up/.test(ice)) return { count: 0, size: 0 };
  if (/large|big|block|sphere|king/.test(ice)) return { count: 1, size: 24 };
  if (/crushed|pebble|shaved/.test(ice)) return { count: 9, size: 7 };
  if (/cube|cubed|rocks|ice/.test(ice)) return { count: 3, size: 13 };
  return { count: 0, size: 0 };
}

// Which garnishes to draw, from the "garnish" field (up to two).
const CITRUS = {
  lime: { flesh: '#b5d65a', rind: '#5d8a1c' },
  lemon: { flesh: '#f6dc5c', rind: '#d9a400' },
  orange: { flesh: '#f8b04c', rind: '#e07b12' },
  grapefruit: { flesh: '#f69a8a', rind: '#e0603f' },
};
function garnishesFor(garnishText = '') {
  const g = garnishText.toLowerCase();
  const fruit = Object.keys(CITRUS).find((name) => g.includes(name)) || 'lemon';
  const found = [];
  if (/coffee bean/.test(g)) found.push({ type: 'beans' });
  if (/cherry|cherries/.test(g)) found.push({ type: 'cherry' });
  if (/olive/.test(g)) found.push({ type: 'olive' });
  if (/peel|twist|zest/.test(g)) found.push({ type: 'peel', ...CITRUS[fruit] });
  else if (/wheel|wedge|slice|lime|lemon|orange|grapefruit/.test(g)) found.push({ type: 'citrus', ...CITRUS[fruit] });
  if (/mint|basil|sage|sprig|herb/.test(g)) found.push({ type: 'mint' });
  return found.slice(0, 2);
}

// --- Garnish drawings (positioned at the rim) ---
function Garnish({ item, x, y, still, index }) {
  const className = `garnish ${still ? 'still' : ''}`;
  const style = { animationDelay: `${index * 150}ms` };
  switch (item.type) {
    case 'citrus':
      return (
        <g className={className} style={style}>
          <g transform={`translate(${x} ${y})`}>
            <circle r="12" fill={item.rind} />
            <circle r="10" fill={item.flesh} />
            {[0, 60, 120].map((a) => (
              <line key={a} x1="0" y1="-9" x2="0" y2="9" stroke={item.rind} strokeWidth="0.8" opacity="0.6" transform={`rotate(${a})`} />
            ))}
            <circle r="2" fill={item.rind} opacity="0.5" />
          </g>
        </g>
      );
    case 'peel':
      return (
        <g className={className} style={style}>
          <path d={`M${x - 10} ${y - 6} q10 -10 18 0 q6 8 -2 18`} fill="none" stroke={item.rind} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'cherry':
      return (
        <g className={className} style={style}>
          <path d={`M${x - 4} ${y - 4} q2 -12 12 -16`} fill="none" stroke="#5b3a1a" strokeWidth="1.5" />
          <circle cx={x - 4} cy={y} r="6.5" fill="#b3122b" />
          <circle cx={x - 6} cy={y - 2} r="1.8" fill="#fff" opacity="0.6" />
        </g>
      );
    case 'olive':
      return (
        <g className={className} style={style}>
          <line x1={x + 8} y1={y - 18} x2={x - 16} y2={y + 14} stroke="#c9b28a" strokeWidth="1.5" />
          <ellipse cx={x - 6} cy={y + 2} rx="6" ry="4.5" fill="#7a8b2c" />
        </g>
      );
    case 'mint':
      return (
        <g className={className} style={style}>
          <ellipse cx={x - 6} cy={y - 8} rx="4" ry="9" fill="#5fa64a" transform={`rotate(-30 ${x - 6} ${y - 8})`} />
          <ellipse cx={x + 2} cy={y - 10} rx="4" ry="9" fill="#77bf5c" transform={`rotate(20 ${x + 2} ${y - 10})`} />
        </g>
      );
    default:
      return null; // coffee beans are drawn on the liquid surface instead
  }
}

export default function CocktailGlass({ spec, animated = true }) {
  const rawId = useId();
  const clipId = `glass-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const type = glassTypeFor(spec.glass);
  const glass = GLASSES[type];
  const steps = useMemo(() => getPourSteps(spec.ingredients), [spec.ingredients]);
  const ice = iceFor(spec.ice);
  const garnishes = garnishesFor(spec.garnish);
  const fizzy = isFizzy(spec.ingredients);
  const foam = foamColour(spec.ingredients);

  // The pouring timeline, as a "phase" number:
  //   0          = empty glass, nothing poured yet
  //   1 ... n    = ingredient n is being poured (stream on, liquid rising to step n)
  //   n + 1      = finished: stream off, foam and garnish appear
  const n = steps.length;
  const still = !animated || prefersReducedMotion();
  const [phase, setPhase] = useState(still ? n + 1 : 0);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (still) { setPhase(n + 1); return undefined; }
    setPhase(0);
    // One timer per phase: start after 300 ms, then one ingredient every STEP_MS.
    const timers = Array.from({ length: n + 1 }, (_, i) => setTimeout(() => setPhase(i + 1), 300 + i * STEP_MS));
    return () => timers.forEach(clearTimeout); // stop the timeline if the page changes
  }, [n, still, replay]);

  const poured = Math.min(phase, n);
  const current = poured > 0 ? steps[poured - 1] : { level: 0, colour: steps[0]?.colour || '#eef3f5', opacity: 0 };
  const pouring = phase >= 1 && phase <= n;
  const done = phase > n;

  // y of the liquid surface: from the bottom of the glass up to MAX_FILL.
  const height = glass.bottom - glass.top;
  const surfaceY = glass.bottom - current.level * MAX_FILL * height;
  const depth = glass.bottom - surfaceY;
  const [left, right] = glass.x;
  const centreX = (left + right) / 2;

  return (
    <div
      className="glass-stage"
      style={{ '--drink-glow': done ? current.colour : 'transparent', width: animated ? undefined : '100%' }}
      onClick={animated ? () => setReplay((n) => n + 1) : undefined}
      role={animated ? 'button' : undefined}
      aria-label={animated ? `Animated ${type} glass of ${spec.name}. Tap to pour again.` : undefined}
      aria-hidden={animated ? undefined : true}
    >
      <svg className="glass-svg" viewBox="0 0 120 160" focusable="false">
        <defs>
          <clipPath id={clipId}><path d={glass.inside} /></clipPath>
        </defs>

        {/* Faint glass body behind the liquid */}
        <path className="glass-body" d={glass.inside} />

        {/* Everything inside the glass is clipped to its shape */}
        <g clipPath={`url(#${clipId})`}>
          {/* Liquid: this group moves up as the glass fills */}
          <g className="liquid-level" style={{ transform: `translateY(${surfaceY}px)` }}>
            {/* A wide wavy shape that slides sideways = moving surface */}
            <g className={`liquid-wave ${still ? 'calm' : ''}`}>
              <path
                className="liquid-fill"
                d="M-120 0 q15 -3 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V200 H-120 Z"
                fill={current.colour}
                fillOpacity={current.opacity}
              />
              {/* Foam / crema on top once the drink is finished (Espresso Martini, sours) */}
              {done && foam && (
                <path
                  className="foam"
                  d="M-120 0 q15 -3 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V6 H-120 Z"
                  fill={foam}
                  fillOpacity="0.95"
                />
              )}
              <path
                className="liquid-surface-shine"
                d="M-120 1 q15 -3 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 v2 H-120 Z"
              />
            </g>

            {/* Ice floating at the surface (only once there is liquid) */}
            {poured > 0 && Array.from({ length: ice.count }, (_, i) => {
              const spread = (right - left - ice.size) / Math.max(ice.count - 1, 1);
              const x = ice.count === 1 ? centreX - ice.size / 2 : left + i * spread;
              const y = -ice.size * 0.45 + (i % 2) * 4;
              // The tilt goes on a wrapper <g>, because the CSS "bob" animation
              // replaces the transform of the element it runs on.
              return (
                <g key={i} transform={`rotate(${(i * 23) % 30 - 12} ${x + ice.size / 2} ${y + ice.size / 2})`}>
                  <rect
                    className="ice-cube"
                    x={x}
                    y={y}
                    width={ice.size}
                    height={ice.size}
                    rx={ice.size * 0.2}
                    style={{ animationDelay: `${i * -0.7}s` }}
                  />
                </g>
              );
            })}

            {/* Coffee beans float on top (e.g. Espresso Martini) */}
            {done && garnishes.some((g) => g.type === 'beans') && [-8, 0, 8].map((dx, i) => (
              <ellipse key={dx} className={`garnish ${still ? 'still' : ''}`} cx={centreX + dx} cy={-1} rx="3.2" ry="2.2" fill="#3b2418" style={{ animationDelay: `${i * 120}ms` }} />
            ))}

            {/* Bubbles rising from the bottom to the surface */}
            {fizzy && !still && poured > 0 && Array.from({ length: 8 }, (_, i) => (
              <circle
                key={i}
                className="bubble"
                cx={left + 4 + ((i * 37) % (right - left - 8))}
                cy={depth - 2}
                r={0.8 + (i % 3) * 0.5}
                style={{ '--rise': `${-depth}px`, '--duration': `${1.6 + (i % 4) * 0.4}s`, '--delay': `${i * 0.35}s` }}
              />
            ))}
          </g>

          {/* Reflection along the left side of the glass */}
          <rect className="glass-shine" x={left - 6} y={glass.top} width="4" height={height} rx="2" />
        </g>

        {/* Pour stream from just above the rim, in the colour of the ingredient being poured */}
        {!still && (
          <rect
            className="pour-stream"
            x={centreX - 1.5}
            y={Math.max(glass.top - 30, 0)}
            width="3"
            height={Math.max(surfaceY - Math.max(glass.top - 30, 0), 0)}
            rx="1.5"
            fill={steps[Math.max(poured - 1, 0)]?.streamColour || '#eef3f5'}
            opacity={pouring ? 0.85 : 0}
          />
        )}

        {/* The glass itself, drawn on top so the liquid looks inside it */}
        <path className="glass-outline" d={glass.outline} />
        {glass.extras.map((d) => <path key={d} className="glass-outline" d={d} />)}

        {/* Garnish drops onto the rim once the drink is poured */}
        {done && garnishes.map((item, i) => (
          <Garnish key={item.type} item={item} x={glass.rim[0] - i * 14} y={glass.rim[1]} still={still} index={i} />
        ))}
      </svg>
      {animated && <p className="glass-hint">Tap to pour again</p>}
    </div>
  );
}
