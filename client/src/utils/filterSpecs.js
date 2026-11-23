// Filters a list of specs by search text, category and region, in the browser.
//
// Why filter here instead of calling GET /api/specs?search=... for every
// keystroke? Because the full list is cached by the service worker, local
// filtering works for ANY search when offline, and it's instant.
// (The API still supports ?search= and ?category= for other clients.)
import { regionFor } from '../constants/countries.js';

export function filterSpecs(specs, { search = '', category = '', region = '' }) {
  const text = search.trim().toLowerCase();

  return specs.filter((spec) => {
    if (category && spec.category !== category) return false;
    if (region && regionFor(spec.origin) !== region) return false;
    if (!text) return true;
    // Match the drink name, its category, its country, or any ingredient ("gin", "lime"...).
    return (
      spec.name.toLowerCase().includes(text)
      || spec.category.toLowerCase().includes(text)
      || (spec.origin || '').toLowerCase().includes(text)
      || spec.ingredients.some((i) => i.name.toLowerCase().includes(text))
    );
  });
}
