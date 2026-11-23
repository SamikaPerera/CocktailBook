// Full spec for one cocktail - what a bartender reads while making the drink.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getSpec, getSpecs } from '../api/specs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavourites } from '../hooks/useFavourites.js';
import BatchScaler from '../components/BatchScaler.jsx';
import { useSpecHistory, WhatChanged, ChangeHistoryList } from '../components/ChangeHistory.jsx';
import { scaleMeasure, totalVolume } from '../utils/scaleMeasure.js';
import { getFreshness, FRESHNESS_LABEL } from '../utils/specFreshness.js';
import CocktailGlass from '../components/CocktailGlass.jsx';
import ServiceMode from '../components/ServiceMode.jsx';
import { SpecDetailSkeleton } from '../components/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SpecGalleryCard from '../components/SpecGalleryCard.jsx';
import { flagFor } from '../constants/countries.js';

// "More like this": same category first, then same country, never the spec itself.
function relatedSpecs(spec, all, max = 4) {
  const others = all.filter((s) => s.id !== spec.id);
  const sameCategory = others.filter((s) => s.category === spec.category);
  const sameCountry = others.filter((s) => spec.origin && s.origin === spec.origin && s.category !== spec.category);
  return [...sameCategory, ...sameCountry].slice(0, max);
}

const UNIT_KEY = 'cocktailbook_unit';

// The bartender's preferred unit is remembered on this device.
function loadUnit() {
  try {
    return localStorage.getItem(UNIT_KEY) === 'oz' ? 'oz' : 'ml';
  } catch {
    return 'ml';
  }
}

export default function SpecDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { isFavourite, toggleFavourite, addRecent } = useFavourites();
  const history = useSpecHistory(id);

  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

  // Batch scaler: number of drinks resets for each spec, the unit is remembered.
  const [multiplier, setMultiplier] = useState(1);
  const [unit, setUnit] = useState(loadUnit);

  const [burst, setBurst] = useState(0);              // favourite sparkle animation
  const [serviceOpen, setServiceOpen] = useState(false);
  // useCallback: ServiceMode uses onClose in an effect, so it must not change every render.
  const closeService = useCallback(() => setServiceOpen(false), []);
  const toast = useToast();

  // The full list (usually already cached) for the "More like this" strip.
  const [allSpecs, setAllSpecs] = useState([]);
  useEffect(() => {
    getSpecs().then(setAllSpecs).catch(() => setAllSpecs([])); // not available: the strip just hides
  }, []);

  function handleUnitChange(newUnit) {
    setUnit(newUnit);
    try { localStorage.setItem(UNIT_KEY, newUnit); } catch { /* not saved - fine */ }
  }

  useEffect(() => {
    // "ignore" stops an old request from overwriting a newer one if the
    // user switches specs quickly (e.g. by tapping a notification).
    let ignore = false;
    setLoading(true);
    setError('');
    setPhotoFailed(false);
    setMultiplier(1);

    async function load() {
      try {
        return await getSpec(id);
      } catch (err) {
        if (err.status === 404) throw err;
        // Offline and this exact spec was never opened? It's probably still
        // in the cached full list from the search screen - look it up there.
        const all = await getSpecs();
        const found = all.find((s) => s.id === id);
        if (!found) throw err;
        return found;
      }
    }

    load()
      .then((data) => {
        if (ignore) return;
        setSpec(data);
        addRecent(data.id); // remember it for "Recently viewed"
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.status === 404
          ? 'This spec no longer exists - it may have been deleted.'
          : 'This spec is not available offline yet. Open it once while online.');
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
    // addRecent is recreated on every render; we only want to reload when the id changes.
  }, [id]);

  if (loading) return <SpecDetailSkeleton />;

  if (error) {
    return (
      <section className="card">
        <p className="form-error" role="alert">{error}</p>
        <p><Link to="/specs">← Back to all specs</Link></p>
      </section>
    );
  }

  const favourite = isFavourite(spec.id);
  const freshness = getFreshness(spec);
  const total = totalVolume(spec.ingredients, multiplier, unit);
  const related = relatedSpecs(spec, allSpecs);

  function handleFavourite() {
    if (!favourite) setBurst((n) => n + 1); // play the sparkle burst
    toggleFavourite(spec.id);
    toast(favourite ? `${spec.name} removed from favourites` : `★ ${spec.name} added to favourites`, 'success');
  }

  return (
    <article className="card spec-detail">
      {/* navigate(-1) goes back to the filtered list; fall back to /specs if opened directly */}
      <button
        type="button"
        className="link-button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/specs'))}
      >
        ← Back
      </button>

      {/* Breadcrumb: where this spec sits in the collection */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/specs">Specs</Link>
        <span aria-hidden="true">›</span>
        <Link to={`/specs?category=${encodeURIComponent(spec.category)}`}>{spec.category}</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{spec.name}</span>
      </nav>

      <header className="spec-detail-header">
        <h1>{spec.name}</h1>
        <span className="badge">{spec.category}</span>
        {spec.origin && <span className="origin-tag">{flagFor(spec.origin)} {spec.origin}</span>}
        {freshness && <span className={`badge badge-${freshness}`}>{FRESHNESS_LABEL[freshness]}</span>}
        <button
          type="button"
          className={`fav-button ${favourite ? 'is-fav' : ''}`}
          onClick={handleFavourite}
          aria-pressed={favourite}
          aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
          title={favourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <span className="fav-icon">{favourite ? '★' : '☆'}</span>
          {/* A new key each time re-creates the sparks, so the burst replays */}
          {burst > 0 && (
            <span className="burst" key={burst} aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => <span key={i} style={{ '--angle': `${i * 45}deg` }} />)}
            </span>
          )}
        </button>
      </header>

      <div className="detail-actions">
        <button type="button" className="btn btn-small" onClick={() => setServiceOpen(true)}>
          🔆 Service mode
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => window.print()}>
          🖨️ Print
        </button>
      </div>

      {/* Latest changes, only if the spec changed in the last 7 days */}
      {freshness && <WhatChanged history={history} />}

      {spec.photoUrl && !photoFailed && (
        <img
          className="spec-photo"
          src={spec.photoUrl}
          alt={spec.name}
          loading="lazy"
          onError={() => setPhotoFailed(true)} // hide broken images (e.g. offline, not cached)
        />
      )}

      <div className="spec-hero">
        {/* Animated glass on a dark, spot-lit "bar" stage: pours this drink's ingredients in their real colours */}
        <div className="detail-stage">
          <CocktailGlass key={spec.id} spec={spec} />
        </div>

        {/* The three things a bartender grabs first */}
        <dl className="spec-facts">
          <div><dt>Glass</dt><dd>{spec.glass}</dd></div>
          <div><dt>Ice</dt><dd>{spec.ice}</dd></div>
          <div><dt>Garnish</dt><dd>{spec.garnish}</dd></div>
        </dl>
      </div>

      <div className="ingredients-header">
        <h2>Ingredients</h2>
        <BatchScaler
          multiplier={multiplier}
          unit={unit}
          onMultiplierChange={setMultiplier}
          onUnitChange={handleUnitChange}
        />
      </div>

      <table className="ingredients-table">
        <tbody>
          {spec.ingredients.map((ing, index) => (
            <tr key={`${ing.name}-${index}`}>
              {/* Recalculated for the chosen number of drinks and unit */}
              <td className="measure">
                {/* The key changes with the value, so each new number "pops" in */}
                <span className="measure-value" key={`${multiplier}-${unit}`}>
                  {scaleMeasure(ing.measure, multiplier, unit)}
                </span>
              </td>
              <td>{ing.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {multiplier > 1 && total.hasVolume && (
        <p className="batch-total">
          Batch of {multiplier}: <strong>{total.text}</strong> total
          {total.uncounted && ' (plus top-ups / dashes)'}
        </p>
      )}

      <h2>Method</h2>
      {/* pre-line keeps the manager's line breaks */}
      <p className="method">{spec.method}</p>

      <p className="hint">
        Last updated {new Date(spec.updatedAt).toLocaleString()}
        {spec.updatedBy?.name && ` by ${spec.updatedBy.name}`}
      </p>

      <ChangeHistoryList history={history} />

      {isManager && (
        <Link to={`/manage/${spec.id}/edit`} className="btn btn-ghost">Edit this spec</Link>
      )}

      {related.length > 0 && (
        <section className="related" aria-label="More like this">
          <h2>More like this</h2>
          <ul className="gallery related-gallery">
            {related.map((s) => (
              <li key={s.id}><SpecGalleryCard spec={s} favourite={isFavourite(s.id)} compact /></li>
            ))}
          </ul>
        </section>
      )}

      {serviceOpen && (
        <ServiceMode spec={spec} multiplier={multiplier} unit={unit} onClose={closeService} />
      )}
    </article>
  );
}
