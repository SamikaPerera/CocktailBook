// Countries a cocktail can come from: their 2-letter ISO code (used to show
// a flag) and the region used by the "Region" filter on the spec list.
// The manager can type any country; unknown ones simply show no flag and
// fall under "Other".
export const REGIONS = ['Europe', 'North America', 'Latin America & Caribbean', 'Asia & Pacific', 'Africa & Middle East'];

const COUNTRIES = {
  // Europe
  'United Kingdom': ['GB', 'Europe'], Ireland: ['IE', 'Europe'], France: ['FR', 'Europe'], Italy: ['IT', 'Europe'],
  Spain: ['ES', 'Europe'], Portugal: ['PT', 'Europe'], Germany: ['DE', 'Europe'], Belgium: ['BE', 'Europe'],
  Netherlands: ['NL', 'Europe'], Poland: ['PL', 'Europe'], Greece: ['GR', 'Europe'], Sweden: ['SE', 'Europe'],
  Russia: ['RU', 'Europe'], Switzerland: ['CH', 'Europe'], Austria: ['AT', 'Europe'], Czechia: ['CZ', 'Europe'],
  // North America
  'United States': ['US', 'North America'], Canada: ['CA', 'North America'],
  // Latin America & Caribbean
  Mexico: ['MX', 'Latin America & Caribbean'], Cuba: ['CU', 'Latin America & Caribbean'],
  Brazil: ['BR', 'Latin America & Caribbean'], Peru: ['PE', 'Latin America & Caribbean'],
  Chile: ['CL', 'Latin America & Caribbean'], Argentina: ['AR', 'Latin America & Caribbean'],
  Colombia: ['CO', 'Latin America & Caribbean'], 'Puerto Rico': ['PR', 'Latin America & Caribbean'],
  Jamaica: ['JM', 'Latin America & Caribbean'], Martinique: ['MQ', 'Latin America & Caribbean'],
  'Trinidad and Tobago': ['TT', 'Latin America & Caribbean'], Barbados: ['BB', 'Latin America & Caribbean'],
  'Dominican Republic': ['DO', 'Latin America & Caribbean'], Venezuela: ['VE', 'Latin America & Caribbean'],
  Bahamas: ['BS', 'Latin America & Caribbean'], Bermuda: ['BM', 'Latin America & Caribbean'],
  'Cayman Islands': ['KY', 'Latin America & Caribbean'], 'British Virgin Islands': ['VG', 'Latin America & Caribbean'],
  // Asia & Pacific
  Japan: ['JP', 'Asia & Pacific'], Singapore: ['SG', 'Asia & Pacific'], 'South Korea': ['KR', 'Asia & Pacific'],
  China: ['CN', 'Asia & Pacific'], India: ['IN', 'Asia & Pacific'], 'Sri Lanka': ['LK', 'Asia & Pacific'],
  Thailand: ['TH', 'Asia & Pacific'], Vietnam: ['VN', 'Asia & Pacific'], Philippines: ['PH', 'Asia & Pacific'],
  Australia: ['AU', 'Asia & Pacific'], 'New Zealand': ['NZ', 'Asia & Pacific'],
  Malaysia: ['MY', 'Asia & Pacific'], Myanmar: ['MM', 'Asia & Pacific'], 'French Polynesia': ['PF', 'Asia & Pacific'],
  // Africa & Middle East
  Kenya: ['KE', 'Africa & Middle East'], 'South Africa': ['ZA', 'Africa & Middle East'],
  Nigeria: ['NG', 'Africa & Middle East'], Ghana: ['GH', 'Africa & Middle East'],
  Morocco: ['MA', 'Africa & Middle East'], Lebanon: ['LB', 'Africa & Middle East'],
  Egypt: ['EG', 'Africa & Middle East'],
};

// Sorted names for the form's suggestion list.
export const COUNTRY_NAMES = Object.keys(COUNTRIES).sort();

// Case-insensitive lookup, so "italy" also works.
function lookup(country = '') {
  const key = Object.keys(COUNTRIES).find((name) => name.toLowerCase() === country.trim().toLowerCase());
  return key ? COUNTRIES[key] : null;
}

// Can this device draw colour flag emojis? Phones can; Windows fonts can't
// (they show the two letters "IT" instead). We draw a flag on a hidden
// canvas and check whether any pixel is coloured rather than grey.
let flagSupport = null;
function supportsFlagEmoji() {
  if (flagSupport !== null) return flagSupport;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.font = '20px sans-serif';
    ctx.fillText('\u{1F1EE}\u{1F1F9}', 0, 20); // the Italian flag
    const pixels = ctx.getImageData(0, 0, 24, 24).data;
    flagSupport = false;
    for (let p = 0; p < pixels.length; p += 4) {
      if (pixels[p + 3] > 0 && (pixels[p] !== pixels[p + 1] || pixels[p + 1] !== pixels[p + 2])) {
        flagSupport = true;
        break;
      }
    }
  } catch {
    flagSupport = false;
  }
  return flagSupport;
}

// A flag emoji is two "regional indicator" letters, e.g. I + T = 🇮🇹.
// Where flags can't be drawn, a globe is shown instead.
export function flagFor(country) {
  const entry = lookup(country);
  if (!entry || !supportsFlagEmoji()) return country ? '🌍' : '';
  return String.fromCodePoint(...[...entry[0]].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

export const regionFor = (country) => lookup(country)?.[1] || 'Other';
