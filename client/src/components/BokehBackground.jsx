// Animated background: soft "bar lights" (bokeh) drifting slowly behind the app,
// like out-of-focus lights in a dim cocktail bar.
// It's pure CSS (see .bokeh in index.css); this component just places the lights.
// Radial gradients are used instead of blur filters because they are much
// cheaper for phones to draw.
const LIGHTS = [
  { x: '-10%', y: '5%', size: '45vmax', colour: 'rgba(232, 163, 61, 0.55)', duration: '28s', delay: '0s' },   // amber
  { x: '60%', y: '-10%', size: '40vmax', colour: 'rgba(229, 83, 75, 0.35)', duration: '34s', delay: '-6s' },  // red
  { x: '70%', y: '55%', size: '38vmax', colour: 'rgba(120, 90, 200, 0.35)', duration: '30s', delay: '-12s' }, // violet
  { x: '5%', y: '65%', size: '34vmax', colour: 'rgba(60, 170, 160, 0.28)', duration: '38s', delay: '-3s' },   // teal
  { x: '35%', y: '30%', size: '22vmax', colour: 'rgba(244, 199, 122, 0.35)', duration: '24s', delay: '-9s' },  // pale gold
  { x: '85%', y: '20%', size: '14vmax', colour: 'rgba(255, 255, 255, 0.18)', duration: '22s', delay: '-15s' }, // small white
  { x: '20%', y: '15%', size: '10vmax', colour: 'rgba(255, 255, 255, 0.14)', duration: '26s', delay: '-4s' },
];

export default function BokehBackground() {
  return (
    <div className="bokeh" aria-hidden="true">
      {LIGHTS.map((light, i) => (
        <span
          key={i}
          style={{
            '--x': light.x,
            '--y': light.y,
            '--size': light.size,
            '--colour': light.colour,
            '--duration': light.duration,
            '--delay': light.delay,
          }}
        />
      ))}
    </div>
  );
}
