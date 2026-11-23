// Tools for writing the cocktail library compactly.
//
// Hundreds of drinks share the same glasses, ice and methods, and many are
// variations of a base recipe ("Strawberry Daiquiri", "Vodka Collins").
// So instead of repeating everything, each drink is written as a short row,
// and variations are generated from a base recipe - the way a bar builds a menu.

// --- Shorthand codes used in the rows ---
export const GLASS = {
  C: 'Coupe', M: 'Martini glass', N: 'Nick & Nora', R: 'Rocks', H: 'Highball', W: 'Wine glass',
  F: 'Champagne flute', S: 'Shot glass', K: 'Copper mug', T: 'Hurricane', P: 'Pint glass',
  I: 'Irish coffee glass', J: 'Julep cup', G: 'Heatproof glass mug', B: 'Tiki mug',
};

export const ICE = {
  N: 'None (served up)', C: 'Cubed', L: 'Large cube', X: 'Crushed', B: 'Blended with ice',
  H: 'None (served hot)', '-': 'None',
};

export const METHOD = {
  SU: 'Shake all ingredients hard with ice. Double strain into a chilled glass.',
  SR: 'Shake all ingredients with ice. Strain over fresh ice.',
  SX: 'Shake all ingredients with ice. Pour into a glass filled with crushed ice.',
  DS: 'Dry shake all ingredients without ice, then shake hard with ice. Double strain into the glass.',
  TU: 'Stir all ingredients with ice until well chilled. Strain into a chilled glass.',
  TR: 'Stir all ingredients with ice. Strain over fresh ice.',
  B: 'Build over ice in the order listed and stir gently.',
  BT: 'Shake everything except the top-up with ice. Strain into an ice-filled glass and top up.',
  FZ: 'Shake everything except the soda hard with ice. Strain into the glass and top with soda.',
  SP: 'Build over ice in a wine glass, top with the sparkling ingredient and stir once.',
  CH: 'Pour into a chilled flute and top slowly with the sparkling wine.',
  SC: 'Shake everything except the sparkling wine with ice. Strain into the glass and top with sparkling wine.',
  MU: 'Muddle the fruit or herbs in the glass with the sweetener. Add the remaining ingredients and ice, then stir.',
  MS: 'Muddle the fruit or herbs, add the remaining ingredients, shake hard with ice and double strain over fresh ice.',
  JU: 'Gently press the mint with the syrup, add the spirit and crushed ice, churn, then cap with more crushed ice.',
  SW: 'Build over crushed ice and swizzle until the glass frosts. Top with more crushed ice.',
  BL: 'Blend all ingredients with a scoop of ice until smooth.',
  LY: 'Layer the ingredients in the order listed over the back of a barspoon.',
  SH: 'Shake with ice and strain into a shot glass.',
  HOT: 'Add everything except the hot water or coffee to a warmed glass, top up with the hot liquid and stir.',
  FL: 'Build the first ingredients over ice, then gently float the last ingredient on top.',
  BO: 'Pour the shot glass contents into (or drop it into) the beer and drink straight away.',
  PU: 'Combine everything in a jug with ice and fruit, stir well and serve in ice-filled glasses.',
  RO: 'Roll the ingredients between two tins with ice (do not shake) and strain into an ice-filled glass.',
  SUN: 'Build the spirit and juice over ice, then slowly pour the grenadine down the side so it sinks.',
};

// Turns a compact row into a full spec object.
//   ['Name', 'Category', 'Origin', glass, ice, 'Garnish', method, 'Ingredient=measure; Ingredient=measure']
// glass / ice / method may be a code from the tables above or full text.
export function fromRow([name, category, origin, glass, ice, garnish, method, ingredients]) {
  return {
    name,
    category,
    origin,
    glass: GLASS[glass] || glass,
    ice: ICE[ice] || ice,
    garnish,
    method: METHOD[method] || method,
    ingredients: ingredients.split(';').map((part) => {
      const [ingName, measure] = part.split('=').map((s) => s.trim());
      return { name: ingName, measure };
    }),
  };
}

// --- Common ingredients (so spelling is identical everywhere) ---
const LEMON = 'Fresh lemon juice';
const LIME = 'Fresh lime juice';
const SYRUP = 'Sugar syrup (1:1)';
const RICH = 'Sugar syrup (2:1)';
const ANGO = 'Angostura bitters';

// --- Spirit styles: "Vodka Collins", "Rum Old Fashioned", "Tequila Toddy" ... ---
// Base spirits: [ingredient name, usual origin of the style]
export const SPIRITS = {
  Vodka: 'Vodka', Gin: 'London dry gin', Rum: 'White rum', 'White Rum': 'White rum', 'Dark Rum': 'Dark rum',
  'Spiced Rum': 'Spiced rum', Tequila: 'Blanco tequila', Mezcal: 'Mezcal', Whiskey: 'Bourbon', Bourbon: 'Bourbon',
  Scotch: 'Blended Scotch whisky', Irish: 'Irish whiskey', Brandy: 'Brandy', Cognac: 'Cognac', Pisco: 'Pisco',
  Tiki: 'Aged Jamaican rum',
};

// Each style returns the rest of a row for a given spirit.
// [category, glass, ice, garnish, method, ingredients]
export const STYLES = {
  Collins: (s) => ['Highball', 'H', 'C', 'Lemon wheel and cherry', 'BT', `${s}=45 ml; ${LEMON}=25 ml; ${SYRUP}=15 ml; Soda water=Top`],
  Sour: (s) => ['Sour', 'R', 'C', 'Lemon twist and Angostura drops', 'DS', `${s}=50 ml; ${LEMON}=25 ml; ${SYRUP}=20 ml; Egg white=20 ml`],
  Gimlet: (s) => ['Sour', 'C', 'N', 'Lime wheel', 'SU', `${s}=60 ml; ${LIME}=20 ml; ${SYRUP}=15 ml`],
  Rickey: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=50 ml; ${LIME}=15 ml; Soda water=Top`],
  Fizz: (s) => ['Highball', 'H', 'C', 'Lemon wheel', 'FZ', `${s}=50 ml; ${LEMON}=25 ml; ${SYRUP}=15 ml; Soda water=Top`],
  Mojito: (s) => ['Highball', 'H', 'X', 'Mint sprig and lime wheel', 'MU', `${s}=45 ml; ${LIME}=20 ml; ${SYRUP}=15 ml; Mint leaves=8 leaves; Soda water=Top`],
  Sunrise: (s) => ['Highball', 'H', 'C', 'Orange slice and cherry', 'SUN', `${s}=45 ml; Orange juice=90 ml; Grenadine=15 ml`],
  Daisy: (s) => ['Sour', 'R', 'X', 'Lemon wheel', 'SX', `${s}=50 ml; ${LEMON}=20 ml; Triple sec=10 ml; Grenadine=5 ml; Soda water=Splash`],
  Smash: (s) => ['Sour', 'R', 'X', 'Mint sprig', 'MS', `${s}=50 ml; Fresh lemon=1/2 lemon; ${SYRUP}=20 ml; Mint leaves=8 leaves`],
  Julep: (s) => ['Classic', 'J', 'X', 'Large mint sprig', 'JU', `${s}=60 ml; ${SYRUP}=10 ml; Mint leaves=8 leaves`],
  Cobbler: (s) => ['Classic', 'H', 'X', 'Seasonal berries and mint sprig', 'SX', `${s}=60 ml; ${SYRUP}=15 ml; Orange slices=2 slices`],
  Spritz: (s) => ['Spritz', 'W', 'C', 'Lemon wheel', 'SP', `${s}=30 ml; Elderflower liqueur=15 ml; Prosecco=90 ml; Soda water=30 ml`],
  Royale: (s) => ['Spritz', 'F', '-', 'Lemon twist', 'SC', `${s}=30 ml; ${LEMON}=10 ml; ${SYRUP}=10 ml; Champagne=90 ml`],
  Sling: (s) => ['Highball', 'H', 'C', 'Lemon wheel and cherry', 'BT', `${s}=45 ml; ${LEMON}=25 ml; Cherry liqueur=15 ml; ${SYRUP}=10 ml; Soda water=Top`],
  Buck: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=45 ml; ${LIME}=15 ml; Ginger ale=120 ml`],
  Tonic: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=50 ml; Tonic water=150 ml`],
  Soda: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=50 ml; Soda water=150 ml`],
  Fix: (s) => ['Sour', 'R', 'X', 'Seasonal fruit', 'SX', `${s}=50 ml; ${LEMON}=20 ml; ${SYRUP}=15 ml; Pineapple juice=15 ml`],
  Toddy: (s) => ['Classic', 'G', 'H', 'Lemon wheel studded with cloves', 'HOT', `${s}=45 ml; Honey syrup=15 ml; ${LEMON}=10 ml; Hot water=100 ml`],
  Highball: (s) => ['Highball', 'H', 'C', 'Lemon peel', 'B', `${s}=50 ml; Soda water=150 ml`],
  Mule: (s) => ['Highball', 'K', 'C', 'Lime wedge and mint sprig', 'B', `${s}=45 ml; ${LIME}=10 ml; Ginger beer=120 ml`],
  'Old Fashioned': (s) => ['Stirred', 'R', 'L', 'Orange peel', 'TR', `${s}=50 ml; ${RICH}=7.5 ml; ${ANGO}=2 dashes`],
  Negroni: (s) => ['Stirred', 'R', 'L', 'Orange peel', 'TR', `${s}=30 ml; Campari=30 ml; Sweet vermouth=30 ml`],
  Manhattan: (s) => ['Stirred', 'C', 'N', 'Cocktail cherry', 'TU', `${s}=50 ml; Sweet vermouth=20 ml; ${ANGO}=1 dash`],
  Sidecar: (s) => ['Sour', 'C', 'N', 'Orange twist', 'SU', `${s}=50 ml; Cointreau=20 ml; ${LEMON}=20 ml`],
  Margarita: (s) => ['Sour', 'C', 'N', 'Lime wheel', 'SU', `${s}=50 ml; Triple sec=20 ml; ${LIME}=20 ml`],
  Alexander: (s) => ['Classic', 'C', 'N', 'Grated nutmeg', 'SU', `${s}=30 ml; Crème de cacao (dark)=30 ml; Fresh cream=30 ml`],
  Swizzle: (s) => ['Tiki', 'H', 'X', 'Mint sprig', 'SW', `${s}=50 ml; ${LIME}=20 ml; ${SYRUP}=15 ml; ${ANGO}=4 dashes`],
  Martini: (s) => ['Stirred', 'M', 'N', 'Lemon twist', 'TU', `${s}=60 ml; Dry vermouth=10 ml`],
  'Espresso Martini': (s) => ['Classic', 'C', 'N', '3 coffee beans', 'SU', `${s}=50 ml; Coffee liqueur=15 ml; Fresh espresso=30 ml; ${SYRUP}=5 ml`],
  Espresso: (s) => ['Classic', 'R', 'C', '3 coffee beans', 'SR', `${s}=40 ml; Fresh espresso=30 ml; Coffee liqueur=10 ml`],
  Caipirinha: (s) => ['Sour', 'R', 'X', 'Lime wedge', 'MU', `${s}=50 ml; Fresh lime=1/2 lime; White sugar=2 barspoons`],
  Paloma: (s) => ['Highball', 'H', 'C', 'Grapefruit wedge', 'B', `${s}=50 ml; ${LIME}=15 ml; Pink grapefruit soda=Top; Salt=Pinch`],
  Punch: (s) => ['Tiki', 'H', 'C', 'Orange slice and cherry', 'SR', `${s}=50 ml; ${LIME}=20 ml; ${SYRUP}=15 ml; Pineapple juice=30 ml; Orange juice=30 ml; ${ANGO}=2 dashes`],
  Lemonade: (s) => ['Highball', 'H', 'C', 'Lemon wheel', 'B', `${s}=50 ml; Lemonade=150 ml`],
  Ginger: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=50 ml; Ginger ale=150 ml`],
  Cranberry: (s) => ['Highball', 'H', 'C', 'Lime wedge', 'B', `${s}=50 ml; Cranberry juice=150 ml`],
};

// Where each style is usually credited to (shown as the drink's origin).
const STYLE_ORIGIN = {
  Collins: 'United Kingdom', Sour: 'United States', Gimlet: 'United Kingdom', Rickey: 'United States',
  Fizz: 'United States', Mojito: 'Cuba', Daisy: 'United States', Smash: 'United States', Julep: 'United States',
  Cobbler: 'United States', Spritz: 'Italy', Sling: 'United States', Buck: 'United States', Toddy: 'United Kingdom',
  Highball: 'United States', Mule: 'United States', 'Old Fashioned': 'United States', Negroni: 'Italy',
  Manhattan: 'United States', Sidecar: 'France', Margarita: 'Mexico', Alexander: 'United Kingdom', Swizzle: 'Trinidad and Tobago',
  Martini: 'United States', 'Espresso Martini': 'United Kingdom', Espresso: 'United Kingdom', Caipirinha: 'Brazil',
  Paloma: 'Mexico', Punch: 'Jamaica',
};

export function spiritStyle(spiritKey, style, nameOverride) {
  const [category, glass, ice, garnish, method, ingredients] = STYLES[style](SPIRITS[spiritKey]);
  const name = nameOverride || `${spiritKey} ${style}`;
  return fromRow([name, category, STYLE_ORIGIN[style] || '', glass, ice, garnish, method, ingredients]);
}

// --- Flavours used in fruit and herb variations ---
// [ingredient added, garnish]
export const FLAVOURS = {
  Strawberry: ['Strawberry purée', 'Strawberry'], Raspberry: ['Raspberry purée', 'Raspberries'],
  Blackberry: ['Blackberry purée', 'Blackberry'], Blueberry: ['Blueberry purée', 'Blueberries'],
  Cherry: ['Cherry liqueur', 'Cocktail cherry'], 'Black Cherry': ['Black cherry purée', 'Cocktail cherry'],
  Mango: ['Mango purée', 'Mango slice'], Pineapple: ['Pineapple juice', 'Pineapple wedge'],
  Passionfruit: ['Passion fruit purée', 'Half passion fruit'], Watermelon: ['Watermelon juice', 'Watermelon wedge'],
  Coconut: ['Coconut cream', 'Toasted coconut flakes'], Banana: ['Banana liqueur', 'Banana slice'],
  Peach: ['Peach purée', 'Peach slice'], Pear: ['Pear purée', 'Pear slice'], Apple: ['Cloudy apple juice', 'Apple slice'],
  'Green Apple': ['Sour apple liqueur', 'Green apple slice'], Kiwi: ['Kiwi purée', 'Kiwi slice'],
  Guava: ['Guava purée', 'Lime wheel'], Papaya: ['Papaya purée', 'Papaya slice'], Lychee: ['Lychee liqueur', 'Lychee'],
  'Dragon Fruit': ['Dragon fruit purée', 'Dragon fruit slice'], Pomegranate: ['Pomegranate juice', 'Pomegranate seeds'],
  Cranberry: ['Cranberry juice', 'Cranberries'], 'Blood Orange': ['Blood orange juice', 'Blood orange wheel'],
  Grapefruit: ['Pink grapefruit juice', 'Grapefruit wedge'], 'Prickly Pear': ['Prickly pear purée', 'Lime wheel'],
  Tamarind: ['Tamarind syrup', 'Lime wheel'], Fig: ['Fig syrup', 'Fig slice'], Blackcurrant: ['Crème de cassis', 'Blackcurrants'],
  Cucumber: ['Cucumber juice', 'Cucumber ribbon'], Jalapeño: ['Jalapeño slices', 'Jalapeño slice'],
  Hibiscus: ['Hibiscus syrup', 'Dried hibiscus flower'], Elderflower: ['Elderflower liqueur', 'Edible flower'],
  Lavender: ['Lavender syrup', 'Lavender sprig'], Rose: ['Rose syrup', 'Rose petal'], Honey: ['Honey syrup', 'Lemon twist'],
  Ginger: ['Ginger syrup', 'Candied ginger'], Cinnamon: ['Cinnamon syrup', 'Cinnamon stick'], Maple: ['Maple syrup', 'Orange peel'],
  Vanilla: ['Vanilla syrup', 'Vanilla pod'], Yuzu: ['Yuzu juice', 'Lemon twist'], Rosemary: ['Rosemary syrup', 'Rosemary sprig'],
  'Lemon Thyme': ['Thyme syrup', 'Thyme sprig'], Basil: ['Basil leaves', 'Basil sprig'], Lemongrass: ['Lemongrass syrup', 'Lemongrass stalk'],
  Pandan: ['Pandan syrup', 'Pandan leaf'], Matcha: ['Matcha syrup', 'Matcha dusting'], Citrus: ['Fresh lemon juice', 'Lemon and orange wheels'],
};

// Bases that take a flavour: (flavour ingredient) -> partial row
// [category, origin, glass, ice, method, ingredients, garnishPrefix]
const FRUIT_BASES = {
  Martini: (f) => ['Classic', '', 'M', 'N', 'SU', `Vodka=45 ml; ${f}=30 ml; ${LIME}=10 ml; ${SYRUP}=10 ml`],
  Margarita: (f) => ['Sour', 'Mexico', 'C', 'N', 'SU', `Blanco tequila=50 ml; Triple sec=15 ml; ${LIME}=20 ml; ${f}=30 ml`, 'Salt rim and '],
  Daiquiri: (f) => ['Sour', 'Cuba', 'C', 'N', 'SU', `White rum=50 ml; ${LIME}=20 ml; ${SYRUP}=10 ml; ${f}=30 ml`],
  Mojito: (f) => ['Highball', 'Cuba', 'H', 'X', 'MU', `White rum=45 ml; ${LIME}=20 ml; ${SYRUP}=15 ml; Mint leaves=8 leaves; ${f}=30 ml; Soda water=Top`, 'Mint sprig and '],
  Caipiroska: (f) => ['Sour', 'Brazil', 'R', 'X', 'MU', `Vodka=50 ml; Fresh lime=1/2 lime; White sugar=2 barspoons; ${f}=30 ml`],
  'Gin Fizz': (f) => ['Highball', 'United Kingdom', 'H', 'C', 'FZ', `London dry gin=45 ml; ${LEMON}=25 ml; ${SYRUP}=10 ml; ${f}=25 ml; Soda water=Top`],
  'Gin Sour': (f) => ['Sour', 'United Kingdom', 'R', 'C', 'DS', `London dry gin=50 ml; ${LEMON}=25 ml; ${f}=20 ml; Egg white=20 ml`],
  'Gin Smash': (f) => ['Sour', 'United Kingdom', 'R', 'X', 'MS', `London dry gin=50 ml; ${LEMON}=20 ml; ${SYRUP}=15 ml; ${f}=30 ml; Mint leaves=6 leaves`],
  Collins: (f) => ['Highball', 'United Kingdom', 'H', 'C', 'BT', `London dry gin=45 ml; ${LEMON}=25 ml; ${f}=20 ml; Soda water=Top`],
  'Rum Cooler': (f) => ['Tiki', 'Jamaica', 'H', 'C', 'BT', `White rum=45 ml; ${f}=40 ml; ${LIME}=15 ml; ${SYRUP}=10 ml; Soda water=Top`],
  'Rum Punch': (f) => ['Tiki', 'Jamaica', 'H', 'C', 'SR', `Dark rum=50 ml; ${f}=40 ml; ${LIME}=20 ml; ${SYRUP}=10 ml; Orange juice=30 ml; ${ANGO}=2 dashes`],
  Colada: (f) => ['Tiki', 'Puerto Rico', 'T', 'B', 'BL', `White rum=50 ml; Coconut cream=30 ml; Pineapple juice=40 ml; ${f}=40 ml`, 'Pineapple wedge and '],
  'Whiskey Sour': (f) => ['Sour', 'United States', 'R', 'C', 'DS', `Bourbon=50 ml; ${LEMON}=25 ml; ${SYRUP}=10 ml; ${f}=20 ml; Egg white=20 ml`],
  'Old Fashioned': (f) => ['Stirred', 'United States', 'R', 'L', 'TR', `Bourbon=50 ml; ${f}=7.5 ml; ${ANGO}=2 dashes`],
  Sangria: (f) => ['Spritz', 'Spain', 'W', 'C', 'PU', `Red wine=120 ml; Brandy=20 ml; Orange juice=30 ml; ${f}=30 ml; Soda water=30 ml`],
  Highball: (f) => ['Highball', 'Japan', 'H', 'C', 'B', `Japanese whisky=45 ml; ${f}=30 ml; Soda water=120 ml`],
  'Espresso Martini': (f) => ['Classic', 'United Kingdom', 'C', 'N', 'SU', `Vodka=40 ml; ${f}=15 ml; Coffee liqueur=10 ml; Fresh espresso=30 ml`],
  Spritz: (f) => ['Spritz', 'Italy', 'W', 'C', 'SP', `${f}=50 ml; Prosecco=90 ml; Soda water=30 ml`],
  Negroni: (f) => ['Stirred', 'Italy', 'R', 'L', 'TR', `London dry gin=30 ml; Campari=30 ml; Sweet vermouth=30 ml; ${f}=10 ml`],
  'Gin Fizz Herb': (f) => ['Highball', 'United Kingdom', 'H', 'C', 'FZ', `London dry gin=45 ml; ${LEMON}=25 ml; ${f}=20 ml; Soda water=Top`],
};

// Some flavours need a different measure or a flavoured spirit instead of a purée.
const SPIRIT_FLAVOURS = { Cherry: true, Lychee: true, Banana: true, 'Green Apple': true, Elderflower: true, Blackcurrant: true };

export function flavoured(flavourKey, base, nameOverride) {
  const [flavourIng, garnish] = FLAVOURS[flavourKey];
  let ingredient = flavourIng;
  if (base === 'Old Fashioned' && !flavourIng.includes('syrup')) ingredient = `${flavourKey} syrup`;
  const [category, origin, glass, ice, method, ingredients, garnishPrefix = ''] = FRUIT_BASES[base](ingredient);
  let ings = ingredients;
  const setMeasure = (measure) => {
    ings = ings.replace(new RegExp(`${ingredient.replace(/[()]/g, '\\$&')}=[\\d.]+ ml`), `${ingredient}=${measure}`);
  };
  // Liqueur flavours are stronger than purées: use less.
  if (SPIRIT_FLAVOURS[flavourKey]) setMeasure('20 ml');
  // A flavoured syrup replaces the plain sugar syrup instead of adding to it.
  if (ingredient.includes('syrup') && base !== 'Old Fashioned') {
    setMeasure('15 ml');
    ings = ings.replace(/; Sugar syrup \(1:1\)=[\d.]+ ml/, '');
  }
  if (flavourKey === 'Jalapeño') setMeasure('2 slices');
  const name = nameOverride || `${flavourKey} ${base.replace(' Herb', '')}`;
  return fromRow([name, category, origin, glass, ice, `${garnishPrefix}${garnish.charAt(0).toLowerCase()}${garnish.slice(1)}`.replace(/^./, (c) => c.toUpperCase()), method, ings]);
}

// "Frozen ___": the same drink blended with ice and served in a hurricane glass.
export function frozen(spec, name) {
  return { ...spec, name, glass: 'Hurricane', ice: 'Blended with ice', method: METHOD.BL };
}
