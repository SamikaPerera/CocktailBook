// Unit tests for offline search/filtering and the NEW / UPDATED badges.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { filterSpecs } from '../src/utils/filterSpecs.js';
import { getFreshness } from '../src/utils/specFreshness.js';

const specs = [
  { name: 'Negroni', category: 'Stirred', origin: 'Italy', ingredients: [{ name: 'Gin' }, { name: 'Campari' }] },
  { name: 'Margarita', category: 'Sour', origin: 'Mexico', ingredients: [{ name: 'Tequila' }, { name: 'Lime juice' }] },
  { name: 'Mojito', category: 'Highball', origin: 'Cuba', ingredients: [{ name: 'White rum' }, { name: 'Lime juice' }] },
];
const names = (list) => list.map((s) => s.name);

describe('filterSpecs', () => {
  test('returns every spec when there is no search or filter', () => {
    assert.equal(filterSpecs(specs, {}).length, 3);
  });

  test('searches by drink name, ignoring case', () => {
    assert.deepEqual(names(filterSpecs(specs, { search: 'NEGRONI' })), ['Negroni']);
  });

  test('searches by ingredient', () => {
    assert.deepEqual(names(filterSpecs(specs, { search: 'lime' })), ['Margarita', 'Mojito']);
  });

  test('searches by country', () => {
    assert.deepEqual(names(filterSpecs(specs, { search: 'cuba' })), ['Mojito']);
  });

  test('combines search text with a category filter', () => {
    assert.deepEqual(names(filterSpecs(specs, { search: 'lime', category: 'Sour' })), ['Margarita']);
  });

  test('filters by region', () => {
    assert.deepEqual(names(filterSpecs(specs, { region: 'Europe' })), ['Negroni']);
  });

  test('returns an empty list when nothing matches', () => {
    assert.deepEqual(filterSpecs(specs, { search: 'vodka' }), []);
  });
});

describe('getFreshness', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.UTC(2026, 10, 23);

  test('marks a spec created in the last 7 days as new', () => {
    const spec = { createdAt: new Date(now - 2 * DAY), updatedAt: new Date(now - 2 * DAY) };
    assert.equal(getFreshness(spec, now), 'new');
  });

  test('marks an old spec that was edited this week as updated', () => {
    const spec = { createdAt: new Date(now - 30 * DAY), updatedAt: new Date(now - 1 * DAY) };
    assert.equal(getFreshness(spec, now), 'updated');
  });

  test('shows no badge for a spec unchanged for over a week', () => {
    const spec = { createdAt: new Date(now - 30 * DAY), updatedAt: new Date(now - 10 * DAY) };
    assert.equal(getFreshness(spec, now), null);
  });
});
