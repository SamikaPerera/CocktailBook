// Home screen for logged-in users: a hero with search and the cocktail of
// the day, quick ways into the gallery (categories, regions), and the drinks
// that matter to this user right now (recently changed, favourites, recent).
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { getSpecs } from '../api/specs.js';
import { CATEGORIES } from '../constants/categories.js';
import { REGIONS, regionFor, flagFor } from '../constants/countries.js';
import { useFavourites } from '../hooks/useFavourites.js';
import { getFreshness } from '../utils/specFreshness.js';
import CocktailGlass from '../components/CocktailGlass.jsx';
import SpecGalleryCard from '../components/SpecGalleryCard.jsx';
import NotificationToggle from '../components/NotificationToggle.jsx';

const CATEGORY_ICONS = {
  Signature: '⭐', Classic: '🎩', Sour: '🍋', Highball: '🧊', Stirred: '🥃',
  Tiki: '🌺', Spritz: '🥂', Shot: '🔥', 'Non-alcoholic': '🌿',
};
const REGION_ICONS = {
  Europe: '🏰', 'North America': '🗽', 'Latin America & Caribbean': '🌴',
  'Asia & Pacific': '🏯', 'Africa & Middle East': '🐪',
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// The same drink for everyone all day, a different one tomorrow:
// days since 1970, wrapped around the (alphabetical) list.
function cocktailOfTheDay(specs) {
  if (specs.length === 0) return null;
  const sorted = [...specs].sort((a, b) => a.name.localeCompare(b.name));
  const day = Math.floor(Date.now() / 86400000);
  return sorted[day % sorted.length];
}

// A horizontal strip of small gallery cards (hidden when empty).
function Strip({ title, specs, isFavourite, link }) {
  if (specs.length === 0) return null;
  return (
    <section className="home-section">
      <div className="home-section-header">
        <h2>{title}</h2>
        {link && <Link to={link}>See all →</Link>}
      </div>
      <ul className="home-strip">
        {specs.map((s) => (
          <li key={s.id}><SpecGalleryCard spec={s} favourite={isFavourite(s.id)} compact /></li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const { favourites, recent, isFavourite } = useFavourites();

  const [specs, setSpecs] = useState([]);
  const [search, setSearch] = useState('');

  // The full list is usually already cached by the service worker.
  useEffect(() => {
    getSpecs().then(setSpecs).catch(() => setSpecs([]));
  }, []);

  // useMemo: only recalculate when the spec list changes, not on every keystroke.
  const { featured, countryCount, categoryCounts, regionCounts, changed } = useMemo(() => {
    const categoryCount = {};
    const regionCount = {};
    specs.forEach((s) => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
      const region = regionFor(s.origin);
      regionCount[region] = (regionCount[region] || 0) + 1;
    });
    return {
      featured: cocktailOfTheDay(specs),
      countryCount: new Set(specs.map((s) => s.origin).filter(Boolean)).size,
      categoryCounts: categoryCount,
      regionCounts: regionCount,
      changed: specs.filter((s) => getFreshness(s))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8),
    };
  }, [specs]);

  const byId = (ids) => ids.map((id) => specs.find((s) => s.id === id)).filter(Boolean);
  const firstName = user.name.split(' ')[0];

  function handleSearch(event) {
    event.preventDefault();
    navigate(search.trim() ? `/specs?q=${encodeURIComponent(search.trim())}` : '/specs');
  }

  return (
    <div className="wide home">
      {/* ---------- Hero ---------- */}
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="eyebrow">{greeting()}, {firstName}</p>
          <h1>What are we pouring tonight?</h1>
          <p className="muted">
            {specs.length > 0
              ? `${specs.length} house specs from ${countryCount} countries - always the current version, even offline.`
              : 'The house spec manual - always the current version, even offline.'}
          </p>

          <form className="home-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              className="search-input"
              placeholder="Search a drink, ingredient or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search specs"
            />
            <button type="submit" className="btn">Search</button>
          </form>

          <div className="home-actions">
            <Link to="/specs" className="btn btn-ghost">Browse all specs</Link>
            {isManager && <Link to="/manage/new" className="btn btn-ghost">+ New spec</Link>}
            {isManager && <Link to="/manage" className="btn btn-ghost">Manage specs</Link>}
          </div>
        </div>

        {featured && (
          <Link to={`/specs/${featured.id}`} className="home-featured">
            <span className="home-featured-label">🍸 Cocktail of the day</span>
            <div className="home-featured-glass">
              {/* key: re-pour when the featured drink changes */}
              <CocktailGlass key={featured.id} spec={featured} />
            </div>
            <span className="home-featured-name">{featured.name}</span>
            <span className="home-featured-meta">
              {featured.category}{featured.origin && ` · ${flagFor(featured.origin)} ${featured.origin}`}
            </span>
          </Link>
        )}
      </section>

      {/* ---------- Categories ---------- */}
      <section className="home-section">
        <div className="home-section-header"><h2>Browse by style</h2></div>
        <div className="home-tiles stagger">
          {CATEGORIES.map((c, i) => (
            <Link key={c} to={`/specs?category=${encodeURIComponent(c)}`} className="home-tile" style={{ '--i': i }}>
              <span className="home-tile-icon">{CATEGORY_ICONS[c]}</span>
              <span className="home-tile-name">{c}</span>
              <span className="home-tile-count">{categoryCounts[c] || 0} specs</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Regions ---------- */}
      <section className="home-section">
        <div className="home-section-header"><h2>Explore the world</h2></div>
        <div className="home-tiles home-regions stagger">
          {REGIONS.map((r, i) => (
            <Link key={r} to={`/specs?region=${encodeURIComponent(r)}`} className="home-tile" style={{ '--i': i }}>
              <span className="home-tile-icon">{REGION_ICONS[r]}</span>
              <span className="home-tile-name">{r}</span>
              <span className="home-tile-count">{regionCounts[r] || 0} specs</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Personal strips (only shown when they have drinks) ---------- */}
      <Strip title="🔄 Recently added or changed" specs={changed} isFavourite={isFavourite} link="/specs?sort=updated" />
      <Strip title="★ Your favourites" specs={byId(favourites).slice(0, 8)} isFavourite={isFavourite} link="/specs?fav=1" />
      <Strip title="🕘 Recently viewed" specs={byId(recent)} isFavourite={isFavourite} />

      <div className="home-notify">
        <NotificationToggle />
      </div>
    </div>
  );
}
