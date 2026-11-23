// Works out what colour a cocktail really is, from its ingredients.
//
// Each ingredient gets a colour and a "strength" (how much it tints the drink):
// gin or vodka barely change the colour, Campari or espresso change it a lot.
// The drink's colour is the average of all colours, weighted by
// volume × strength - so a Gin & Tonic stays almost clear and a Negroni is red.
import { measureToMl } from './scaleMeasure.js';

// [pattern, colour, strength]. The FIRST match wins, so specific names come first.
const INGREDIENT_COLOURS = [
  [/blue cura[cç]ao/, '#1f8fd6', 1],
  [/crème de menthe \(white\)|white crème de menthe|cacao \(white\)|white chocolate/, '#f2ead9', 0.3],
  [/crème de menthe|grasshopper/, '#3fa35b', 1],
  [/absinthe/, '#9bc18c', 0.6],
  [/sloe gin/, '#8e1b3d', 0.9],
  [/stout|guinness/, '#2b1a12', 1],
  [/lager|pale ale|(?<!ginger )beer|cider/, '#e8b84a', 0.6],   // not "ginger beer"
  [/\bros[ée]\b/, '#f2a5a8', 0.7],                            // rosé / rose, not rosemary
  [/red wine|tempranillo|light red/, '#7b1730', 0.9],
  [/white wine|pipeño|sherry|lillet|umeshu/, '#efe2a8', 0.4],
  [/cassis|blackcurrant|blackberr|crème de mûre|chambord/, '#4a1238', 1],
  [/violette/, '#b8a9d9', 0.8],
  [/galliano|licor 43|suze|yellow chartreuse/, '#f2cf2a', 0.8],
  [/apricot|peach/, '#f2a65a', 0.6],
  [/sour apple|green apple|apple schnapps|kiwi/, '#a8d26b', 0.7],
  [/watermelon|strawberr|raspberr|dragon fruit|hibiscus|beetroot|pomegranate|sarti|select aperitivo|pink gin/, '#d83a4f', 0.85],
  [/blueberr/, '#4b3f8f', 0.9],
  [/matcha|pandan|pistachio/, '#7fae3c', 0.8],
  [/chocolate|cacao|caramel|hazelnut|nocino|walnut|jägermeister|averna|cola/, '#3b2214', 1],
  [/\btea\b|chai|earl grey/, '#b5793a', 0.7],
  [/limoncello|yuzu|mandarin/, '#f3d34a', 0.6],
  [/sake|soju|shochu|makgeolli|yakult/, '#f3efe6', 0.2],
  [/pimm/, '#8b3a1e', 0.8],
  [/navy rum|demerara rum|overproof|blackstrap|gold rum|barbados rum|jamaican rum|aged rum/, '#b8702a', 0.75],
  [/campari/, '#c8102e', 1],
  [/aperol/, '#f2611d', 1],
  [/grenadine|raspberry|cranberry|cherry/, '#b3123b', 0.9],
  [/coffee liqueur|kahl[uú]a|tia maria/, '#2a160d', 1],
  [/espresso|coffee|cola/, '#3b2418', 1],
  [/sweet vermouth|rosso|red vermouth|port/, '#7a1f1a', 0.9],
  [/dry vermouth|lillet|blanc/, '#efe9c8', 0.35],
  [/angostura|bitters/, '#5a1a0f', 1],
  [/chartreuse|midori|melon/, '#7cb342', 0.9],
  [/cream|milk|egg white|coconut|baileys/, '#f3ece1', 0.7],
  [/egg yolk/, '#f2c14e', 0.7],
  [/lime/, '#c9d96b', 0.55],
  [/lemon/, '#f3e27a', 0.5],
  [/grapefruit/, '#f4a7a0', 0.6],
  [/orange|triple sec|cointreau|curacao/, '#f7a541', 0.6],
  [/pineapple|passion|mango/, '#f4d35e', 0.7],
  [/tomato/, '#c1272d', 1],
  [/mint|basil|cucumber/, '#7fbf6a', 0.35],
  [/honey|maple|agave|demerara/, '#d9a032', 0.5],
  [/sugar|syrup|gomme/, '#f7f0d6', 0.15],
  [/bourbon|whisk|rye|scotch|cognac|brandy|armagnac|calvados/, '#c27c2c', 0.75],
  [/dark rum|aged rum|gold rum|spiced rum|añejo|anejo|reposado/, '#b8702a', 0.75],
  [/amaro|averna|montenegro|cynar|fernet/, '#4a2412', 0.9],
  [/amaretto|frangelico/, '#b5651d', 0.8],
  [/prosecco|champagne|sparkling wine|cava/, '#f4e6a8', 0.35],
  [/\bgin\b|vodka|white rum|blanco|silver|tequila|mezcal|pisco|cacha[cç]a|sake/, '#eef3f5', 0.08],
  [/soda|tonic|water|sparkling|lemonade|ginger ale|ginger beer/, '#eef3f5', 0.05],
];
const DEFAULT_COLOUR = ['#e8d9b5', 0.5];

// Bubbles appear in drinks topped with something fizzy.
const FIZZY = /soda|tonic|ginger beer|ginger ale|lemonade|prosecco|champagne|cava|sparkling|cola|lager|beer|cider|energy drink/;

function colourFor(name) {
  const lower = name.toLowerCase();
  const match = INGREDIENT_COLOURS.find(([pattern]) => pattern.test(lower));
  return match ? { colour: match[1], strength: match[2] } : { colour: DEFAULT_COLOUR[0], strength: DEFAULT_COLOUR[1] };
}

// Rough volume for measures without a unit, so they still count a little.
function estimateMl(measure) {
  const ml = measureToMl(measure);
  if (ml !== null) return ml;
  const lower = measure.toLowerCase();
  const count = parseFloat(lower) || 1;
  if (/top|fill/.test(lower)) return 60;
  if (/dash/.test(lower)) return count * 1;
  if (/drop/.test(lower)) return count * 0.2;
  if (/barspoon|tsp/.test(lower)) return count * 5;
  if (/pinch/.test(lower)) return 0.5;
  return count * 15; // "1" egg white etc.
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

// Blend a list of { colour, strength, ml } into one colour + opacity.
function blend(parts) {
  let totalMl = 0;
  let totalWeight = 0;
  const sum = [0, 0, 0];
  for (const { colour, strength, ml } of parts) {
    const weight = ml * strength;
    const rgb = hexToRgb(colour);
    for (let i = 0; i < 3; i += 1) sum[i] += rgb[i] * weight;
    totalWeight += weight;
    totalMl += ml;
  }
  if (totalWeight === 0) return { colour: '#eef3f5', opacity: 0.25 };
  const colour = rgbToHex(sum.map((v) => v / totalWeight));
  // Weak tints (clear spirits, soda) give a see-through drink; strong ones are opaque.
  // The square root lifts mid values, so e.g. half a glass of espresso already looks dark.
  const opacity = Math.min(0.95, 0.25 + 0.75 * Math.sqrt(totalWeight / totalMl));
  return { colour, opacity };
}

// The "recipe" the animated glass follows: after each ingredient is poured,
// how full the glass is (0-1) and what colour the drink is at that moment.
export function getPourSteps(ingredients) {
  const parts = ingredients.map((ing) => ({ ...colourFor(ing.name), ml: estimateMl(ing.measure), name: ing.name }));
  const totalMl = parts.reduce((sum, p) => sum + p.ml, 0) || 1;

  let pouredMl = 0;
  return parts.map((part, i) => {
    pouredMl += part.ml;
    return {
      level: pouredMl / totalMl,
      ...blend(parts.slice(0, i + 1)),
      streamColour: part.colour, // the stream shows the ingredient being poured
    };
  });
}

export const isFizzy = (ingredients) => ingredients.some((ing) => FIZZY.test(ing.name.toLowerCase()));

// Shaken espresso makes a tan "crema"; egg white or aquafaba makes a white foam.
// Returns the foam colour, or null for no foam.
export function foamColour(ingredients) {
  const names = ingredients.map((ing) => ing.name.toLowerCase()).join(' ');
  if (/espresso/.test(names)) return '#c8a27a';
  if (/egg white|aquafaba|foamer|whipped cream|stout|guinness/.test(names)) return '#f6f0e6';
  return null;
}
