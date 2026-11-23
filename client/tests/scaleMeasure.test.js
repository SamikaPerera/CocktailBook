// Unit tests for the batch scaler (client/src/utils/scaleMeasure.js).
// Run with:  npm test   (uses Node's built-in test runner)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { scaleMeasure, measureToMl, totalVolume } from '../src/utils/scaleMeasure.js';

describe('scaleMeasure', () => {
  test('multiplies millilitres', () => {
    assert.equal(scaleMeasure('25 ml', 4, 'ml'), '100 ml');
  });

  test('leaves a measure unchanged at x1 in the same unit', () => {
    assert.equal(scaleMeasure('22.5 ml', 1, 'ml'), '22.5 ml');
  });

  test('converts ml to oz using the bar standard of 30 ml per oz', () => {
    assert.equal(scaleMeasure('60 ml', 1, 'oz'), '2 oz');
    assert.equal(scaleMeasure('45 ml', 1, 'oz'), '1½ oz');
  });

  test('reads mixed fractions in oz and converts them to ml', () => {
    assert.equal(scaleMeasure('1 1/2 oz', 2, 'ml'), '90 ml');
  });

  test('reads unicode fractions such as ¾', () => {
    assert.equal(scaleMeasure('¾ oz', 1, 'ml'), '22.5 ml');
  });

  test('converts centilitres to millilitres', () => {
    assert.equal(scaleMeasure('5 cl', 1, 'ml'), '50 ml');
  });

  test('multiplies counts that are not volumes (dashes)', () => {
    assert.equal(scaleMeasure('2 dashes', 4, 'ml'), '8 dashes');
  });

  test('leaves measures without a number untouched', () => {
    assert.equal(scaleMeasure('Top', 8, 'ml'), 'Top');
  });
});

describe('measureToMl', () => {
  test('returns millilitres for volume measures', () => {
    assert.equal(measureToMl('1 oz'), 30);
    assert.equal(measureToMl('2 cl'), 20);
  });

  test('returns null for measures that are not volumes', () => {
    assert.equal(measureToMl('2 dashes'), null);
    assert.equal(measureToMl('Top'), null);
  });
});

describe('totalVolume', () => {
  const negroni = [
    { name: 'Gin', measure: '30 ml' },
    { name: 'Campari', measure: '30 ml' },
    { name: 'Sweet vermouth', measure: '30 ml' },
  ];

  test('adds up a whole spec', () => {
    assert.deepEqual(totalVolume(negroni, 1, 'ml'), { text: '90 ml', uncounted: false, hasVolume: true });
  });

  test('scales the total for a batch of 4', () => {
    assert.equal(totalVolume(negroni, 4, 'ml').text, '360 ml');
  });

  test('flags ingredients that cannot be counted', () => {
    const spritz = [{ name: 'Aperol', measure: '60 ml' }, { name: 'Soda', measure: 'Top' }];
    assert.equal(totalVolume(spritz, 1, 'ml').uncounted, true);
  });
});
