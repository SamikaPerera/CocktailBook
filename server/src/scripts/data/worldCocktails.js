// Starter library of well-known cocktails from around the world, used by
// "npm run seed". Specs follow widely published classic recipes; a bar
// manager can edit any of them to match their own house style.
//
// Each entry: name, category, origin (country), ingredients, glass, ice,
// garnish and method - the same fields as the Spec model.

// Small helper so each ingredient fits on one line: i('Gin', '50 ml')
const i = (name, measure) => ({ name, measure });

export const worldCocktails = [
  // ---------- Italy ----------
  {
    name: 'Negroni', category: 'Stirred', origin: 'Italy',
    ingredients: [i('Gin', '30 ml'), i('Campari', '30 ml'), i('Sweet vermouth', '30 ml')],
    glass: 'Rocks', ice: 'Large cube', garnish: 'Orange peel',
    method: 'Add all ingredients to a mixing glass with ice. Stir for 20 seconds. Strain over a large cube and express the orange peel over the top.',
  },
  {
    name: 'Americano', category: 'Highball', origin: 'Italy',
    ingredients: [i('Campari', '30 ml'), i('Sweet vermouth', '30 ml'), i('Soda water', 'Top')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Orange slice',
    method: 'Build Campari and vermouth over ice. Top with soda water and stir gently.',
  },
  {
    name: 'Aperol Spritz', category: 'Spritz', origin: 'Italy',
    ingredients: [i('Prosecco', '90 ml'), i('Aperol', '60 ml'), i('Soda water', '30 ml')],
    glass: 'Wine glass', ice: 'Cubed', garnish: 'Orange slice',
    method: 'Fill a wine glass with ice. Add prosecco, then Aperol, then a splash of soda. Stir once.',
  },
  {
    name: 'Bellini', category: 'Spritz', origin: 'Italy',
    ingredients: [i('White peach purée', '50 ml'), i('Prosecco', '100 ml')],
    glass: 'Champagne flute', ice: 'None', garnish: 'Peach slice',
    method: 'Pour the peach purée into a chilled flute. Top slowly with prosecco and stir gently.',
  },
  {
    name: 'Hugo Spritz', category: 'Spritz', origin: 'Italy',
    ingredients: [i('Prosecco', '100 ml'), i('Elderflower liqueur', '20 ml'), i('Soda water', '30 ml'), i('Mint leaves', '6 leaves')],
    glass: 'Wine glass', ice: 'Cubed', garnish: 'Mint sprig and lime wheel',
    method: 'Gently press the mint in the glass. Add ice, elderflower liqueur and prosecco. Top with soda and stir.',
  },
  {
    name: 'Hanky Panky', category: 'Stirred', origin: 'United Kingdom',
    ingredients: [i('Gin', '45 ml'), i('Sweet vermouth', '45 ml'), i('Fernet-Branca', '7.5 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Orange peel',
    method: 'Stir all ingredients with ice until well chilled. Strain into a chilled coupe and express the orange peel.',
  },

  // ---------- Cuba ----------
  {
    name: 'Daiquiri', category: 'Sour', origin: 'Cuba',
    ingredients: [i('White rum', '60 ml'), i('Fresh lime juice', '25 ml'), i('Sugar syrup (1:1)', '20 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Lime wheel',
    method: 'Shake all ingredients hard with ice for 10 seconds. Double strain into a chilled coupe.',
  },
  {
    name: 'Mojito', category: 'Highball', origin: 'Cuba',
    ingredients: [i('White rum', '45 ml'), i('Fresh lime juice', '20 ml'), i('Sugar syrup (1:1)', '15 ml'), i('Mint leaves', '8 leaves'), i('Soda water', 'Top')],
    glass: 'Highball', ice: 'Crushed', garnish: 'Mint sprig and lime wheel',
    method: 'Gently muddle the mint with sugar syrup and lime. Add rum and crushed ice, churn, then top with soda.',
  },
  {
    name: 'Cuba Libre', category: 'Highball', origin: 'Cuba',
    ingredients: [i('White rum', '50 ml'), i('Fresh lime juice', '10 ml'), i('Cola', '120 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Lime wedge',
    method: 'Build rum and lime over ice. Top with cola and stir gently.',
  },
  {
    name: 'Hemingway Daiquiri', category: 'Sour', origin: 'Cuba',
    ingredients: [i('White rum', '60 ml'), i('Grapefruit juice', '40 ml'), i('Maraschino liqueur', '15 ml'), i('Fresh lime juice', '15 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Grapefruit twist',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },

  // ---------- Mexico ----------
  {
    name: 'Margarita', category: 'Sour', origin: 'Mexico',
    ingredients: [i('Blanco tequila', '50 ml'), i('Triple sec', '20 ml'), i('Fresh lime juice', '15 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Half salt rim and lime wheel',
    method: 'Rim half the glass with salt. Shake all ingredients with ice and strain into the glass.',
  },
  {
    name: 'Paloma', category: 'Highball', origin: 'Mexico',
    ingredients: [i('Blanco tequila', '50 ml'), i('Fresh lime juice', '15 ml'), i('Pink grapefruit soda', 'Top'), i('Salt', 'Pinch')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Grapefruit wedge',
    method: 'Build tequila, lime and salt over ice in a highball. Top with grapefruit soda and stir gently.',
  },

  // ---------- United States ----------
  {
    name: 'Old Fashioned', category: 'Stirred', origin: 'United States',
    ingredients: [i('Bourbon', '50 ml'), i('Sugar syrup (2:1)', '7.5 ml'), i('Angostura bitters', '2 dashes')],
    glass: 'Rocks', ice: 'Large cube', garnish: 'Orange peel and cherry',
    method: 'Stir all ingredients with ice for 30 seconds. Strain over a large cube and express the orange peel.',
  },
  {
    name: 'Manhattan', category: 'Stirred', origin: 'United States',
    ingredients: [i('Rye whiskey', '50 ml'), i('Sweet vermouth', '20 ml'), i('Angostura bitters', '1 dash')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Cocktail cherry',
    method: 'Stir all ingredients with ice until well chilled. Strain into a chilled coupe.',
  },
  {
    name: 'Dry Martini', category: 'Stirred', origin: 'United States',
    ingredients: [i('Gin', '60 ml'), i('Dry vermouth', '10 ml')],
    glass: 'Martini glass', ice: 'None (served up)', garnish: 'Olive or lemon twist',
    method: 'Stir with ice until very cold. Strain into a chilled martini glass.',
  },
  {
    name: 'Whiskey Sour', category: 'Sour', origin: 'United States',
    ingredients: [i('Bourbon', '45 ml'), i('Fresh lemon juice', '25 ml'), i('Sugar syrup (1:1)', '20 ml'), i('Egg white', '20 ml')],
    glass: 'Rocks', ice: 'Cubed', garnish: 'Orange slice and cherry',
    method: 'Dry shake all ingredients without ice, then shake again with ice. Strain over fresh ice.',
  },
  {
    name: 'Sazerac', category: 'Stirred', origin: 'United States',
    ingredients: [i('Rye whiskey', '50 ml'), i('Sugar syrup (2:1)', '5 ml'), i("Peychaud's bitters", '3 dashes'), i('Absinthe', 'Rinse')],
    glass: 'Rocks', ice: 'None', garnish: 'Lemon peel (discarded)',
    method: 'Rinse a chilled glass with absinthe. Stir the rest with ice and strain into the glass. Express lemon peel over the top.',
  },
  {
    name: 'Mint Julep', category: 'Classic', origin: 'United States',
    ingredients: [i('Bourbon', '60 ml'), i('Sugar syrup (1:1)', '10 ml'), i('Mint leaves', '8 leaves')],
    glass: 'Julep cup', ice: 'Crushed', garnish: 'Large mint sprig',
    method: 'Gently press mint with syrup in the cup. Add bourbon and crushed ice, churn, then cap with more ice.',
  },
  {
    name: 'Cosmopolitan', category: 'Classic', origin: 'United States',
    ingredients: [i('Citrus vodka', '40 ml'), i('Cointreau', '15 ml'), i('Fresh lime juice', '15 ml'), i('Cranberry juice', '30 ml')],
    glass: 'Martini glass', ice: 'None (served up)', garnish: 'Orange twist',
    method: 'Shake all ingredients with ice. Double strain into a chilled martini glass.',
  },
  {
    name: 'Moscow Mule', category: 'Highball', origin: 'United States',
    ingredients: [i('Vodka', '45 ml'), i('Fresh lime juice', '10 ml'), i('Ginger beer', '120 ml')],
    glass: 'Copper mug', ice: 'Cubed', garnish: 'Lime wedge',
    method: 'Build vodka and lime over ice. Top with ginger beer and stir.',
  },
  {
    name: 'Mai Tai', category: 'Tiki', origin: 'United States',
    ingredients: [i('Aged Jamaican rum', '30 ml'), i('Rhum agricole', '30 ml'), i('Orange curaçao', '15 ml'), i('Orgeat syrup', '15 ml'), i('Fresh lime juice', '30 ml')],
    glass: 'Rocks', ice: 'Crushed', garnish: 'Mint sprig and lime shell',
    method: 'Shake all ingredients with ice. Pour into a glass of crushed ice.',
  },
  {
    name: 'Aviation', category: 'Sour', origin: 'United States',
    ingredients: [i('Gin', '45 ml'), i('Maraschino liqueur', '15 ml'), i('Fresh lemon juice', '15 ml'), i('Crème de violette', '1 barspoon')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Cocktail cherry',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Last Word', category: 'Sour', origin: 'United States',
    ingredients: [i('Gin', '22.5 ml'), i('Green Chartreuse', '22.5 ml'), i('Maraschino liqueur', '22.5 ml'), i('Fresh lime juice', '22.5 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'No garnish',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Clover Club', category: 'Sour', origin: 'United States',
    ingredients: [i('Gin', '45 ml'), i('Raspberry syrup', '15 ml'), i('Fresh lemon juice', '15 ml'), i('Egg white', '15 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Raspberries',
    method: 'Dry shake, then shake with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Penicillin', category: 'Sour', origin: 'United States',
    ingredients: [i('Blended Scotch whisky', '60 ml'), i('Fresh lemon juice', '22.5 ml'), i('Honey-ginger syrup', '22.5 ml'), i('Islay Scotch whisky', '7.5 ml')],
    glass: 'Rocks', ice: 'Large cube', garnish: 'Candied ginger',
    method: 'Shake the blended Scotch, lemon and syrup with ice. Strain over a large cube and float the Islay whisky on top.',
  },
  {
    name: 'Paper Plane', category: 'Sour', origin: 'United States',
    ingredients: [i('Bourbon', '22.5 ml'), i('Aperol', '22.5 ml'), i('Amaro Nonino', '22.5 ml'), i('Fresh lemon juice', '22.5 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'No garnish',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Naked and Famous', category: 'Sour', origin: 'United States',
    ingredients: [i('Mezcal', '22.5 ml'), i('Aperol', '22.5 ml'), i('Yellow Chartreuse', '22.5 ml'), i('Fresh lime juice', '22.5 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'No garnish',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: "Tommy's Margarita", category: 'Sour', origin: 'United States',
    ingredients: [i('Reposado tequila', '60 ml'), i('Fresh lime juice', '30 ml'), i('Agave syrup', '15 ml')],
    glass: 'Rocks', ice: 'Cubed', garnish: 'Lime wedge',
    method: 'Shake all ingredients with ice. Strain over fresh ice.',
  },
  {
    name: 'Shirley Temple', category: 'Non-alcoholic', origin: 'United States',
    ingredients: [i('Ginger ale', '150 ml'), i('Grenadine', '15 ml'), i('Fresh lime juice', '10 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Cocktail cherry',
    method: 'Build over ice, adding grenadine last so it sinks. Stir gently.',
  },

  // ---------- United Kingdom & Ireland ----------
  {
    name: 'Espresso Martini', category: 'Classic', origin: 'United Kingdom',
    ingredients: [i('Vodka', '50 ml'), i('Coffee liqueur', '15 ml'), i('Fresh espresso', '30 ml'), i('Sugar syrup (1:1)', '5 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: '3 coffee beans',
    method: 'Shake all ingredients very hard with ice to build the foam. Double strain into a chilled coupe.',
  },
  {
    name: 'Gin and Tonic', category: 'Highball', origin: 'United Kingdom',
    ingredients: [i('London dry gin', '50 ml'), i('Tonic water', '150 ml')],
    glass: 'Balloon glass', ice: 'Cubed', garnish: 'Lime wedge',
    method: 'Fill the glass with ice, add gin and top with tonic. Stir once.',
  },
  {
    name: "Pimm's Cup", category: 'Highball', origin: 'United Kingdom',
    ingredients: [i("Pimm's No. 1", '50 ml'), i('Lemonade', '150 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Cucumber, strawberry and mint sprig',
    method: 'Build over ice, top with lemonade and add the fruit and mint.',
  },
  {
    name: 'Bramble', category: 'Sour', origin: 'United Kingdom',
    ingredients: [i('Gin', '40 ml'), i('Fresh lemon juice', '15 ml'), i('Sugar syrup (1:1)', '10 ml'), i('Crème de mûre (blackberry)', '15 ml')],
    glass: 'Rocks', ice: 'Crushed', garnish: 'Blackberry and lemon wheel',
    method: 'Shake gin, lemon and syrup with ice and strain over crushed ice. Drizzle the crème de mûre over the top.',
  },
  {
    name: 'Corpse Reviver No. 2', category: 'Sour', origin: 'United Kingdom',
    ingredients: [i('Gin', '22.5 ml'), i('Cointreau', '22.5 ml'), i('Lillet Blanc', '22.5 ml'), i('Fresh lemon juice', '22.5 ml'), i('Absinthe', '1 dash')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Orange twist',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Porn Star Martini', category: 'Signature', origin: 'United Kingdom',
    ingredients: [i('Vanilla vodka', '40 ml'), i('Passion fruit liqueur', '15 ml'), i('Passion fruit purée', '30 ml'), i('Fresh lime juice', '15 ml'), i('Vanilla syrup', '10 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Half passion fruit, prosecco on the side',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe and serve with a shot of prosecco.',
  },
  {
    name: 'Alexander', category: 'Classic', origin: 'United Kingdom',
    ingredients: [i('Cognac', '30 ml'), i('Crème de cacao (dark)', '30 ml'), i('Fresh cream', '30 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Grated nutmeg',
    method: 'Shake all ingredients with ice. Strain into a chilled coupe and grate nutmeg over the top.',
  },
  {
    name: 'Irish Coffee', category: 'Classic', origin: 'Ireland',
    ingredients: [i('Irish whiskey', '50 ml'), i('Hot coffee', '90 ml'), i('Brown sugar syrup', '15 ml'), i('Lightly whipped cream', '30 ml')],
    glass: 'Irish coffee glass', ice: 'None', garnish: 'Cream float',
    method: 'Warm the glass. Add whiskey, syrup and hot coffee and stir. Float the cream on top over the back of a spoon.',
  },

  // ---------- France & Belgium ----------
  {
    name: 'French 75', category: 'Classic', origin: 'France',
    ingredients: [i('Gin', '30 ml'), i('Fresh lemon juice', '15 ml'), i('Sugar syrup (1:1)', '15 ml'), i('Champagne', '60 ml')],
    glass: 'Champagne flute', ice: 'None', garnish: 'Lemon twist',
    method: 'Shake gin, lemon and syrup with ice. Strain into a flute and top with champagne.',
  },
  {
    name: 'Sidecar', category: 'Sour', origin: 'France',
    ingredients: [i('Cognac', '50 ml'), i('Cointreau', '20 ml'), i('Fresh lemon juice', '20 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Orange twist',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Kir Royal', category: 'Spritz', origin: 'France',
    ingredients: [i('Crème de cassis', '10 ml'), i('Champagne', '90 ml')],
    glass: 'Champagne flute', ice: 'None', garnish: 'No garnish',
    method: 'Pour the cassis into a flute and top slowly with champagne.',
  },
  {
    name: 'Bloody Mary', category: 'Classic', origin: 'France',
    ingredients: [i('Vodka', '45 ml'), i('Tomato juice', '90 ml'), i('Fresh lemon juice', '15 ml'), i('Worcestershire sauce', '2 dashes'), i('Hot sauce', '2 dashes'), i('Celery salt and black pepper', 'Pinch')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Celery stalk and lemon wedge',
    method: 'Roll all ingredients between two tins with ice (do not shake). Strain into an ice-filled highball.',
  },
  {
    name: 'Black Russian', category: 'Stirred', origin: 'Belgium',
    ingredients: [i('Vodka', '50 ml'), i('Coffee liqueur', '20 ml')],
    glass: 'Rocks', ice: 'Cubed', garnish: 'No garnish',
    method: 'Build over ice and stir.',
  },

  // ---------- Rest of Europe ----------
  {
    name: 'Gin Basil Smash', category: 'Sour', origin: 'Germany',
    ingredients: [i('Gin', '60 ml'), i('Fresh lemon juice', '20 ml'), i('Sugar syrup (1:1)', '20 ml'), i('Basil leaves', '10 leaves')],
    glass: 'Rocks', ice: 'Cubed', garnish: 'Basil sprig',
    method: 'Muddle the basil with lemon and syrup. Add gin, shake hard with ice and double strain over fresh ice.',
  },
  {
    name: 'Szarlotka', category: 'Highball', origin: 'Poland',
    ingredients: [i('Bison grass vodka', '50 ml'), i('Cloudy apple juice', '120 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Apple slice',
    method: 'Build over ice and stir gently.',
  },
  {
    name: 'Rebujito', category: 'Highball', origin: 'Spain',
    ingredients: [i('Fino sherry', '60 ml'), i('Lemon-lime soda', '120 ml'), i('Mint leaves', '4 leaves')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Mint sprig',
    method: 'Build sherry and mint over ice, top with soda and stir gently.',
  },
  {
    name: 'Porto Tónico', category: 'Spritz', origin: 'Portugal',
    ingredients: [i('White port', '50 ml'), i('Tonic water', '100 ml')],
    glass: 'Wine glass', ice: 'Cubed', garnish: 'Orange slice and mint sprig',
    method: 'Build over ice, top with tonic and stir once.',
  },

  // ---------- Latin America & Caribbean ----------
  {
    name: 'Caipirinha', category: 'Sour', origin: 'Brazil',
    ingredients: [i('Cachaça', '60 ml'), i('Fresh lime', '1/2 lime'), i('White sugar', '2 barspoons')],
    glass: 'Rocks', ice: 'Crushed', garnish: 'Lime wedge',
    method: 'Muddle the lime pieces with sugar in the glass. Add cachaça and crushed ice and stir.',
  },
  {
    name: 'Pisco Sour', category: 'Sour', origin: 'Peru',
    ingredients: [i('Pisco', '60 ml'), i('Fresh lime juice', '30 ml'), i('Sugar syrup (1:1)', '20 ml'), i('Egg white', '1'), i('Angostura bitters', '3 drops')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Angostura drops on the foam',
    method: 'Dry shake, then shake hard with ice. Strain into a coupe and dot the bitters on the foam.',
  },
  {
    name: 'Chilcano', category: 'Highball', origin: 'Peru',
    ingredients: [i('Pisco', '50 ml'), i('Fresh lime juice', '15 ml'), i('Ginger ale', '120 ml'), i('Angostura bitters', '2 dashes')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Lime wheel',
    method: 'Build pisco and lime over ice, top with ginger ale and finish with bitters.',
  },
  {
    name: 'Piña Colada', category: 'Tiki', origin: 'Puerto Rico',
    ingredients: [i('White rum', '50 ml'), i('Coconut cream', '30 ml'), i('Pineapple juice', '50 ml')],
    glass: 'Hurricane', ice: 'Crushed', garnish: 'Pineapple wedge and cherry',
    method: 'Blend with crushed ice until smooth, or shake hard and pour over crushed ice.',
  },
  {
    name: "Planter's Punch", category: 'Tiki', origin: 'Jamaica',
    ingredients: [i('Dark rum', '45 ml'), i('Orange juice', '35 ml'), i('Pineapple juice', '35 ml'), i('Fresh lemon juice', '20 ml'), i('Grenadine', '10 ml'), i('Angostura bitters', '3 dashes')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Orange slice and cherry',
    method: 'Shake all ingredients with ice and strain into an ice-filled glass.',
  },
  {
    name: "Ti' Punch", category: 'Classic', origin: 'Martinique',
    ingredients: [i('Rhum agricole blanc', '50 ml'), i('Cane syrup', '1 barspoon'), i('Lime disc', '1')],
    glass: 'Rocks', ice: 'None', garnish: 'Lime disc',
    method: 'Squeeze the lime disc into the glass, add cane syrup and rum, and stir.',
  },
  {
    name: 'Fernet con Coca', category: 'Highball', origin: 'Argentina',
    ingredients: [i('Fernet-Branca', '50 ml'), i('Cola', '150 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'No garnish',
    method: 'Pour Fernet over ice, then top slowly with cola (it foams).',
  },

  // ---------- Canada ----------
  {
    name: 'Caesar', category: 'Classic', origin: 'Canada',
    ingredients: [i('Vodka', '45 ml'), i('Clamato juice', '120 ml'), i('Worcestershire sauce', '2 dashes'), i('Hot sauce', '2 dashes')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Celery salt rim, celery stalk and lime wedge',
    method: 'Rim the glass with celery salt. Build over ice and stir.',
  },
  {
    name: 'B-52', category: 'Shot', origin: 'Canada',
    ingredients: [i('Coffee liqueur', '20 ml'), i('Irish cream liqueur', '20 ml'), i('Grand Marnier', '20 ml')],
    glass: 'Shot glass', ice: 'None', garnish: 'No garnish',
    method: 'Layer in order over the back of a barspoon: coffee liqueur, Irish cream, then Grand Marnier.',
  },

  // ---------- Asia, Oceania & Africa ----------
  {
    name: 'Singapore Sling', category: 'Tiki', origin: 'Singapore',
    ingredients: [i('Gin', '30 ml'), i('Cherry liqueur', '15 ml'), i('Cointreau', '7.5 ml'), i('Bénédictine', '7.5 ml'), i('Grenadine', '10 ml'), i('Pineapple juice', '120 ml'), i('Fresh lime juice', '15 ml'), i('Angostura bitters', '1 dash')],
    glass: 'Hurricane', ice: 'Cubed', garnish: 'Pineapple slice and cherry',
    method: 'Shake all ingredients with ice and strain into an ice-filled glass.',
  },
  {
    name: 'Japanese Highball', category: 'Highball', origin: 'Japan',
    ingredients: [i('Japanese whisky', '45 ml'), i('Chilled soda water', '135 ml')],
    glass: 'Highball', ice: 'Cubed', garnish: 'Lemon peel',
    method: 'Fill a chilled glass with ice and stir to chill. Add whisky, stir 13 times, top with soda and stir once.',
  },
  {
    name: 'Japanese Slipper', category: 'Sour', origin: 'Australia',
    ingredients: [i('Midori melon liqueur', '30 ml'), i('Cointreau', '30 ml'), i('Fresh lemon juice', '30 ml')],
    glass: 'Coupe', ice: 'None (served up)', garnish: 'Melon slice',
    method: 'Shake all ingredients with ice. Double strain into a chilled coupe.',
  },
  {
    name: 'Dawa', category: 'Classic', origin: 'Kenya',
    ingredients: [i('Vodka', '50 ml'), i('Fresh lime', '1/2 lime'), i('Honey', '15 ml'), i('White sugar', '1 barspoon')],
    glass: 'Rocks', ice: 'Crushed', garnish: 'Lime wedge and honey stick',
    method: 'Muddle the lime with sugar, add vodka and crushed ice. Serve with a honey-coated stirrer to mix in.',
  },
  {
    name: 'Virgin Mojito', category: 'Non-alcoholic', origin: 'Cuba',
    ingredients: [i('Fresh lime juice', '25 ml'), i('Sugar syrup (1:1)', '20 ml'), i('Mint leaves', '8 leaves'), i('Soda water', 'Top')],
    glass: 'Highball', ice: 'Crushed', garnish: 'Mint sprig and lime wheel',
    method: 'Gently muddle mint with lime and syrup. Add crushed ice, top with soda and churn.',
  },
];
