// Batch scaler: multiplies ingredient measures (×2, ×4 ...) and converts
// between ml and oz. Everything happens in the browser, so it works offline.
//
// Examples:
//   scaleMeasure('25 ml', 4, 'ml')    -> '100 ml'
//   scaleMeasure('50 ml', 1, 'oz')    -> '1⅔ oz'  (bar standard: 1 oz = 30 ml)
//   scaleMeasure('1 1/2 oz', 2, 'ml') -> '90 ml'
//   scaleMeasure('2 dashes', 4, 'ml') -> '8 dashes'
//   scaleMeasure('Top', 4, 'ml')      -> 'Top'    (no number, left as it is)

const ML_PER_OZ = 30; // the round number bartenders use (a US fl oz is 29.6 ml)
const ML_PER_CL = 10;

// Turn "½" style characters into "1/2" so they can be parsed.
const UNICODE_FRACTIONS = { '¼': '1/4', '½': '1/2', '¾': '3/4', '⅓': '1/3', '⅔': '2/3' };

// Reads the number at the start of a measure: "1 1/2", "3/4", "7.5", "2".
// Returns { value, rest } or null when the measure has no number ("Top").
function parseLeadingNumber(text) {
  let input = text.trim();
  for (const [char, frac] of Object.entries(UNICODE_FRACTIONS)) {
    input = input.replace(new RegExp(`(\\d)?\\s*${char}`), (_, whole) => (whole ? `${whole} ${frac}` : frac));
  }

  const mixed = input.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/); // "1 1/2 oz"
  if (mixed) return { value: Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]), rest: mixed[4] };

  const fraction = input.match(/^(\d+)\/(\d+)\s*(.*)$/); // "3/4 oz"
  if (fraction) return { value: Number(fraction[1]) / Number(fraction[2]), rest: fraction[3] };

  const decimal = input.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/); // "7.5 ml", "2 dashes"
  if (decimal) return { value: Number(decimal[1].replace(',', '.')), rest: decimal[2] };

  return null;
}

// Which volume unit (if any) the rest of the measure starts with.
function detectVolumeUnit(rest) {
  if (/^ml\b/i.test(rest)) return 'ml';
  if (/^cl\b/i.test(rest)) return 'cl';
  if (/^(fl\.?\s*)?(oz|ounces?)\b/i.test(rest)) return 'oz';
  return null;
}

const UNIT_PATTERN = /^((fl\.?\s*)?(ml|cl|oz|ounces?))\b\s*/i;

// 22.5 -> "22.5", 100 -> "100"
function formatMl(ml) {
  // Nearest 0.5 ml for single-drink amounts (¾ oz = 22.5 ml), whole ml for big batches.
  const rounded = ml < 100 ? Math.round(ml * 2) / 2 : Math.round(ml);
  return String(rounded);
}

// 1.75 -> "1¾", 0.5 -> "½", 1.666 -> "1⅔"
function formatOz(oz) {
  const fractions = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
  let whole = Math.floor(oz);
  const remainder = oz - whole;
  // Pick the closest common bar fraction.
  const [value, symbol] = fractions.reduce((best, f) => (Math.abs(f[0] - remainder) < Math.abs(best[0] - remainder) ? f : best));
  if (value === 1) whole += 1;
  if (whole === 0 && !symbol) return '0';
  return `${whole || ''}${symbol}`;
}

// 2.4 -> "2.4", 2 -> "2"
const formatCount = (n) => String(Math.round(n * 10) / 10);

export function scaleMeasure(measure, multiplier, targetUnit) {
  const parsed = parseLeadingNumber(measure);
  if (!parsed) return measure; // "Top", "Pinch", "To taste"...

  const unit = detectVolumeUnit(parsed.rest);

  // Not a volume (dashes, drops, barspoons, "1" egg white): just multiply.
  if (!unit) {
    if (multiplier === 1) return measure;
    return `${formatCount(parsed.value * multiplier)} ${parsed.rest}`.trim();
  }

  // Already in the wanted unit and not scaled: show it exactly as the manager wrote it.
  if (multiplier === 1 && unit === targetUnit) return measure;

  const ml = parsed.value * multiplier * (unit === 'oz' ? ML_PER_OZ : unit === 'cl' ? ML_PER_CL : 1);
  const afterUnit = parsed.rest.replace(UNIT_PATTERN, ''); // keep anything after the unit
  const amount = targetUnit === 'oz' ? `${formatOz(ml / ML_PER_OZ)} oz` : `${formatMl(ml)} ml`;
  return `${amount} ${afterUnit}`.trim();
}

// A measure in millilitres, or null if it isn't a volume ("2 dashes", "Top").
// Used by the animated glass to work out how much of each colour to pour.
export function measureToMl(measure) {
  const parsed = parseLeadingNumber(measure);
  const unit = parsed && detectVolumeUnit(parsed.rest);
  if (!unit) return null;
  return parsed.value * (unit === 'oz' ? ML_PER_OZ : unit === 'cl' ? ML_PER_CL : 1);
}

// Total liquid volume of a spec (for pre-batching a jug), plus whether some
// ingredients couldn't be counted ("Top", dashes...).
export function totalVolume(ingredients, multiplier, targetUnit) {
  let ml = 0;
  let uncounted = false;
  for (const { measure } of ingredients) {
    const parsed = parseLeadingNumber(measure);
    const unit = parsed && detectVolumeUnit(parsed.rest);
    if (!unit) { uncounted = true; continue; }
    ml += parsed.value * multiplier * (unit === 'oz' ? ML_PER_OZ : unit === 'cl' ? ML_PER_CL : 1);
  }
  const text = targetUnit === 'oz' ? `${formatOz(ml / ML_PER_OZ)} oz` : `${formatMl(ml)} ml`;
  return { text, uncounted, hasVolume: ml > 0 };
}
