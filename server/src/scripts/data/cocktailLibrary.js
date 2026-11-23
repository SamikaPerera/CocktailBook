// The full cocktail library: hand-written specs + variations generated from
// base recipes. Used by "npm run seed" together with worldCocktails.js.
import { worldCocktails } from './worldCocktails.js';
import { LIBRARY_ROWS } from './libraryRows.js';
import { fromRow, spiritStyle, flavoured, frozen } from './libraryBuilder.js';

// --- "Spirit + style" drinks: Vodka Collins, Rum Old Fashioned, ... ---
const SPIRIT_STYLE_LIST = {
  Tequila: ['Sour', 'Old Fashioned', 'Negroni', 'Collins', 'Daisy', 'Smash', 'Rickey', 'Cobbler', 'Sling', 'Buck', 'Fix', 'Toddy', 'Fizz', 'Highball'],
  Mezcal: ['Mule', 'Paloma', 'Sour', 'Martini', 'Negroni', 'Margarita'],
  Vodka: ['Collins', 'Sour', 'Gimlet', 'Rickey', 'Fizz', 'Mojito', 'Sunrise', 'Daisy', 'Smash', 'Julep', 'Cobbler', 'Spritz', 'Royale', 'Sling', 'Buck', 'Tonic', 'Soda', 'Cranberry', 'Espresso', 'Highball', 'Lemonade', 'Martini'],
  Gin: ['Rickey', 'Buck', 'Daisy', 'Sling', 'Smash', 'Julep', 'Cobbler', 'Toddy', 'Sour', 'Alexander', 'Old Fashioned', 'Mule', 'Spritz', 'Paloma', 'Caipirinha', 'Highball', 'Martini'],
  Rum: ['Old Fashioned', 'Manhattan', 'Sour', 'Collins', 'Rickey', 'Swizzle', 'Cobbler', 'Toddy', 'Alexander', 'Negroni', 'Espresso Martini', 'Espresso', 'Sidecar', 'Margarita', 'Mule', 'Spritz', 'Fizz', 'Daisy', 'Sling', 'Julep', 'Fix', 'Buck', 'Highball', 'Punch'],
  'White Rum': ['Punch'],
  'Dark Rum': ['Punch', 'Highball'],
  'Spiced Rum': ['Punch'],
  Whiskey: ['Highball', 'Ginger', 'Collins', 'Fizz', 'Rickey', 'Buck', 'Daisy', 'Fix', 'Cobbler', 'Sling', 'Julep', 'Alexander', 'Negroni'],
  Bourbon: ['Smash', 'Sidecar', 'Rickey', 'Spritz', 'Espresso', 'Highball', 'Lemonade'],
  Scotch: ['Sour', 'Highball', 'Collins'],
  Irish: ['Mule', 'Sour', 'Old Fashioned'],
  Brandy: ['Sour', 'Old Fashioned', 'Manhattan', 'Smash', 'Collins', 'Fizz', 'Highball'],
  Cognac: ['Old Fashioned', 'Sour'],
  Tiki: ['Old Fashioned', 'Manhattan', 'Sour', 'Mule', 'Spritz', 'Fizz', 'Punch'],
};

// --- "Flavour + base" drinks: Strawberry Margarita, Mango Daiquiri, ... ---
const FLAVOUR_LIST = {
  Martini: ['Raspberry', 'Lychee', 'Watermelon', 'Passionfruit', 'Mango', 'Pineapple', 'Cucumber', 'Elderflower', 'Peach', 'Strawberry', 'Coconut', 'Cherry', 'Pomegranate', 'Green Apple', 'Cranberry', 'Blueberry', 'Blackberry', 'Blood Orange', 'Pear', 'Honey', 'Ginger', 'Vanilla', 'Yuzu', 'Dragon Fruit'],
  Margarita: ['Strawberry', 'Mango', 'Watermelon', 'Pineapple', 'Coconut', 'Blood Orange', 'Passionfruit', 'Raspberry', 'Blackberry', 'Peach', 'Cucumber', 'Jalapeño', 'Hibiscus', 'Prickly Pear', 'Grapefruit', 'Guava'],
  Daiquiri: ['Banana', 'Strawberry', 'Mango', 'Watermelon', 'Pineapple', 'Coconut', 'Passionfruit', 'Raspberry', 'Peach', 'Blueberry', 'Blackberry', 'Dragon Fruit'],
  Mojito: ['Coconut', 'Pineapple', 'Strawberry', 'Watermelon', 'Passionfruit', 'Raspberry'],
  Caipiroska: ['Strawberry', 'Passionfruit', 'Mango', 'Raspberry', 'Watermelon'],
  'Gin Fizz': ['Strawberry', 'Raspberry', 'Blackberry', 'Blood Orange', 'Peach', 'Pear', 'Lychee', 'Pineapple', 'Watermelon', 'Hibiscus', 'Blackcurrant'],
  'Gin Fizz Herb': ['Rosemary', 'Lemon Thyme'],
  'Gin Sour': ['Lavender', 'Rose', 'Honey', 'Grapefruit', 'Passionfruit', 'Hibiscus', 'Rosemary'],
  'Gin Smash': ['Blueberry', 'Kiwi'],
  Collins: ['Elderflower', 'Cucumber', 'Raspberry', 'Strawberry', 'Peach', 'Lavender', 'Lemongrass'],
  'Rum Cooler': ['Coconut', 'Pineapple', 'Mango', 'Passionfruit', 'Strawberry'],
  'Rum Punch': ['Guava', 'Tamarind', 'Coconut', 'Pineapple'],
  Colada: ['Mango', 'Strawberry', 'Banana', 'Guava', 'Papaya', 'Lychee', 'Kiwi', 'Passionfruit', 'Pandan', 'Matcha'],
  'Whiskey Sour': ['Apple', 'Peach', 'Blackberry', 'Raspberry', 'Cherry', 'Ginger', 'Cinnamon', 'Maple', 'Yuzu'],
  'Old Fashioned': ['Maple', 'Honey', 'Fig'],
  Sangria: ['Peach', 'Strawberry', 'Watermelon', 'Pomegranate', 'Apple'],
  Highball: ['Ginger', 'Citrus', 'Grapefruit', 'Cucumber', 'Pineapple', 'Apple', 'Peach', 'Lychee', 'Yuzu'],
  'Espresso Martini': ['Coconut'],
  Spritz: ['Elderflower'],
  Negroni: ['Blood Orange', 'Pandan'],
};

// Alternative names for drinks that are already in the library.
export const ALIASES = {
  'Pornstar Martini': 'Porn Star Martini',
  'Kir Royale': 'Kir Royal',
  'Gin & Tonic': 'Gin and Tonic',
  'Classic Mojito': 'Mojito',
  'Classic Daiquiri': 'Daiquiri',
  Hugo: 'Hugo Spritz',
  'Gibson Martini': 'Gibson',
  'Chilcano de Pisco': 'Chilcano',
  'Toronto Cocktail': 'Toronto',
  'Alaska Cocktail': 'Alaska',
  'La Rosita': 'Rosita',
  'Juan Collins': 'Tequila Collins',
  'Spritz Veneziano': 'Aperol Spritz',
  'Venetian Spritz': 'Aperol Spritz',
  'Scorpion Bowl': 'Scorpion',
  'Guinness Black Velvet': 'Black Velvet',
  'B-52 Shot': 'B-52',
  'B-53 Shot': 'B-53',
  'Orgasm Shot': 'Orgasm',
  'Screaming Orgasm Shot': 'Screaming Orgasm',
  'Gold Rush Sour': 'Gold Rush',
  'Gin Negroni': 'Negroni',
  'Basil Gin Smash': 'Gin Basil Smash',
  Fernandito: 'Fernet con Coca',
};

function build() {
  const specs = [];

  specs.push(...LIBRARY_ROWS.map(fromRow));

  for (const [spirit, styles] of Object.entries(SPIRIT_STYLE_LIST)) {
    for (const style of styles) specs.push(spiritStyle(spirit, style));
  }

  for (const [base, flavours] of Object.entries(FLAVOUR_LIST)) {
    for (const flavour of flavours) specs.push(flavoured(flavour, base));
  }

  // Frozen versions, built from the drink they are based on.
  const byName = new Map([...worldCocktails, ...specs].map((s) => [s.name.toLowerCase(), s]));
  const FROZEN = {
    'Frozen Margarita': 'Margarita',
    'Frozen Daiquiri': 'Daiquiri',
    'Frozen Mango Daiquiri': 'Mango Daiquiri',
    'Frozen Strawberry Daiquiri': 'Strawberry Daiquiri',
    'Frozen Passionfruit Daiquiri': 'Passionfruit Daiquiri',
    'Frozen Piña Colada': 'Piña Colada',
    'Frozen Blue Lagoon': 'Blue Lagoon',
    'Frozen Mojito': 'Mojito',
    'Frozen Coconut Mojito': 'Coconut Mojito',
    'Frozen Watermelon Margarita': 'Watermelon Margarita',
    'Frozen Peach Bellini': 'Bellini',
    'Frozen Hurricane': 'Hurricane',
    'Frozen Rum Punch': 'Rum Punch',
  };
  for (const [name, baseName] of Object.entries(FROZEN)) {
    const base = byName.get(baseName.toLowerCase());
    if (base) specs.push(frozen({ ...base, category: base.category === 'Spritz' ? 'Spritz' : base.category }, name));
  }

  // Remove duplicates (the same drink can appear in several groups): first one wins.
  const seen = new Set();
  return specs.filter((spec) => {
    const key = spec.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const cocktailLibrary = build();
