// Bartender screen: browse, search and filter the cocktail gallery.
// The search text and filters are kept in the URL
// (?q=...&category=...&region=...&fav=1&sort=...), so going "Back" from a
// spec returns to the same filtered gallery.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getSpecs } from '../api/specs.js';
import { CATEGORIES } from '../constants/categories.js';
import { REGIONS } from '../constants/countries.js';
import { filterSpecs } from '../utils/filterSpecs.js';
import { useFavourites } from '../hooks/useFavourites.js';
import SpecGalleryCard from '../components/SpecGalleryCard.jsx';
import { GallerySkeleton } from '../components/Skeleton.jsx';

const PAGE_SIZE = 24; // cards per "Show more"

// Sort options for the gallery. The key is stored in the URL (?sort=...).
const SORTS = {
  name: { label: 'A–Z', compare: (a, b) => a.name.localeCompare(b.name) },
  updated: { label: 'Recently updated', compare: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) },
  category: {
    label: 'Category',
    compare: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  },
  origin: {
    label: 'Country',
    compare: (a, b) => (a.origin || '~').localeCompare(b.origin || '~') || a.name.localeCompare(b.name),
  },
};

export default function SpecsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const region = searchParams.get('region') || '';
  const onlyFavourites = searchParams.get('fav') === '1';
  const sort = SORTS[searchParams.get('sort')] ? searchParams.get('sort') : 'name';

  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { favourites, recent, isFavourite } = useFavourites();

  // The library has hundreds of drinks; drawing them all at once is slow on
  // a phone, so the gallery shows one "page" at a time with a Show more button.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, category, region, onlyFavourites, sort]);

  // Load all specs once. Online -> fresh from the server.
  // Offline -> the service worker answers from its cache.
  useEffect(() => {
    getSpecs()
      .then(setSpecs)
      .catch(() => setError(navigator.onLine
        ? 'Could not load specs. Please try again.'
        : 'You are offline and no specs have been saved yet. Open the app once while online.'))
      .finally(() => setLoading(false));
  }, []);

  // Update one URL parameter, removing it when empty.
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true }); // replace: don't add a history entry per keystroke
  }

  let results = filterSpecs(specs, { search, category, region });
  if (onlyFavourites) results = results.filter((spec) => favourites.includes(spec.id));
  results = [...results].sort(SORTS[sort].compare); // copy first: never sort state in place

  // "Recently viewed" only when the user isn't searching or filtering.
  // Specs that have since been deleted are skipped.
  const showRecent = !search && !category && !region && !onlyFavourites;
  const recentSpecs = recent.map((id) => specs.find((s) => s.id === id)).filter(Boolean);
  const countryCount = new Set(specs.map((s) => s.origin).filter(Boolean)).size;

  return (
    <section className="wide">
      <header className="gallery-header">
        <p className="eyebrow">The house collection</p>
        <h1>Cocktails of the world</h1>
        {!loading && !error && (
          <p className="muted">{specs.length} specs from {countryCount} countries - search by name, ingredient or country.</p>
        )}
      </header>

      <input
        type="search"
        className="search-input"
        placeholder="Search: Negroni, lime, Japan…"
        value={search}
        onChange={(e) => updateParam('q', e.target.value)}
        aria-label="Search specs"
      />

      {/* Filter "chips": tap to filter, tap again to clear. Scrolls sideways on phones. */}
      <div className="chips" role="group" aria-label="Filter specs">
        <button
          type="button"
          className={`chip ${!category && !onlyFavourites ? 'chip-active' : ''}`}
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('category');
            next.delete('fav');
            setSearchParams(next, { replace: true });
          }}
        >
          All
        </button>
        <button
          type="button"
          className={`chip ${onlyFavourites ? 'chip-active' : ''}`}
          aria-pressed={onlyFavourites}
          onClick={() => updateParam('fav', onlyFavourites ? '' : '1')}
        >
          ★ Favourites
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? 'chip-active' : ''}`}
            aria-pressed={category === c}
            onClick={() => updateParam('category', category === c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {showRecent && recentSpecs.length > 0 && (
        <nav className="recent" aria-label="Recently viewed">
          <span className="hint">Recently viewed</span>
          <div className="recent-links">
            {recentSpecs.map((spec) => (
              <Link key={spec.id} to={`/specs/${spec.id}`} className="recent-link">{spec.name}</Link>
            ))}
          </div>
        </nav>
      )}

      {loading && <GallerySkeleton />}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="list-controls">
          <p className="hint">{results.length} of {specs.length} specs</p>
          <div className="list-selects">
            <label className="hint">
              Region{' '}
              <select className="select sort-select" value={region} onChange={(e) => updateParam('region', e.target.value)}>
                <option value="">All regions</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="hint">
              Sort{' '}
              <select
                className="select sort-select"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value === 'name' ? '' : e.target.value)}
              >
                {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="muted">
          {onlyFavourites && favourites.length === 0
            ? 'No favourites yet. Open a spec and tap ☆ to add it here.'
            : 'No specs match your search.'}
        </p>
      )}

      {/* The gallery. "stagger": each card slides in slightly after the one before (--i = position) */}
      <ul className="gallery stagger">
        {results.slice(0, visibleCount).map((spec, index) => (
          // index % PAGE_SIZE: each newly shown page staggers in from the start
          <li key={spec.id} style={{ '--i': index % PAGE_SIZE }}>
            <SpecGalleryCard spec={spec} favourite={isFavourite(spec.id)} />
          </li>
        ))}
      </ul>

      {results.length > visibleCount && (
        <div className="show-more">
          <p className="hint">Showing {visibleCount} of {results.length}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Show more cocktails
          </button>
        </div>
      )}
    </section>
  );
}
