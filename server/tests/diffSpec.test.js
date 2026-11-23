// Unit tests for diffSpec / describeChange (server/src/utils/diffSpec.js).
// Run with:  npm test   (uses Node's built-in test runner)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { diffSpec, describeChange } from '../src/utils/diffSpec.js';

const negroni = {
  name: 'Negroni',
  category: 'Stirred',
  origin: 'Italy',
  glass: 'Rocks',
  ice: 'Large cube',
  garnish: 'Orange peel',
  method: 'Stir with ice and strain.',
  photoUrl: '',
  ingredients: [
    { name: 'Gin', measure: '30 ml' },
    { name: 'Campari', measure: '30 ml' },
    { name: 'Sweet vermouth', measure: '30 ml' },
  ],
};

describe('diffSpec', () => {
  test('returns no changes when nothing was edited', () => {
    assert.deepEqual(diffSpec(negroni, structuredClone(negroni)), []);
  });

  test('ignores extra spaces around text values', () => {
    const edited = { ...structuredClone(negroni), garnish: '  Orange peel  ' };
    assert.deepEqual(diffSpec(negroni, edited), []);
  });

  test('detects a changed text field with its old and new value', () => {
    const edited = { ...structuredClone(negroni), garnish: 'Orange twist' };
    assert.deepEqual(diffSpec(negroni, edited), [
      { field: 'Garnish', from: 'Orange peel', to: 'Orange twist' },
    ]);
  });

  test('detects a changed measure for an existing ingredient', () => {
    const edited = structuredClone(negroni);
    edited.ingredients[0].measure = '45 ml';
    assert.deepEqual(diffSpec(negroni, edited), [
      { field: 'Ingredient', from: '30 ml Gin', to: '45 ml Gin' },
    ]);
  });

  test('detects an added and a removed ingredient', () => {
    const edited = structuredClone(negroni);
    edited.ingredients = [
      { name: 'Gin', measure: '30 ml' },
      { name: 'Campari', measure: '30 ml' },
      { name: 'Prosecco', measure: 'Top' }, // added, Sweet vermouth removed
    ];
    const changes = diffSpec(negroni, edited);
    assert.equal(changes.length, 2);
    assert.deepEqual(changes, [
      { field: 'Ingredient', from: '30 ml Sweet vermouth', to: null },
      { field: 'Ingredient', from: null, to: 'Top Prosecco' },
    ]);
  });

  test('matches ingredients by name without caring about upper/lower case', () => {
    const edited = structuredClone(negroni);
    edited.ingredients[1].name = 'campari';
    assert.deepEqual(diffSpec(negroni, edited), []);
  });

  test('treats clearing an optional field as a change to null', () => {
    const edited = { ...structuredClone(negroni), origin: '' };
    assert.deepEqual(diffSpec(negroni, edited), [{ field: 'Origin', from: 'Italy', to: null }]);
  });
});

describe('describeChange', () => {
  test('describes a text field change', () => {
    assert.equal(describeChange({ field: 'Garnish', from: 'Lemon peel', to: 'Orange twist' }),
      'Garnish: Lemon peel → Orange twist');
  });

  test('describes added and removed ingredients', () => {
    assert.equal(describeChange({ field: 'Ingredient', from: null, to: '20 ml Lime' }), 'Added 20 ml Lime');
    assert.equal(describeChange({ field: 'Ingredient', from: '20 ml Lime', to: null }), 'Removed 20 ml Lime');
  });

  test('keeps the method short because it is too long for a notification', () => {
    assert.equal(describeChange({ field: 'Method', from: 'a', to: 'b' }), 'Method updated');
  });
});
