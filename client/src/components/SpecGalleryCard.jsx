// One tile in the cocktail gallery: a dark, spot-lit "bar" stage with the
// drink's glass on it, then the name, category and country.
// Hovering (or focusing) lifts the glass and sets the liquid moving.
import { Link } from 'react-router-dom';
import CocktailGlass from './CocktailGlass.jsx';
import { flagFor } from '../constants/countries.js';
import { getFreshness, FRESHNESS_LABEL } from '../utils/specFreshness.js';

export default function SpecGalleryCard({ spec, favourite = false, compact = false }) {
  const freshness = getFreshness(spec);

  return (
    <Link to={`/specs/${spec.id}`} className={`gallery-card ${compact ? 'compact' : ''}`}>
      <div className="gallery-stage">
        {freshness && <span className={`badge badge-${freshness} stage-badge`}>{FRESHNESS_LABEL[freshness]}</span>}
        {favourite && <span className="stage-fav" aria-label="Favourite">★</span>}
        <div className="gallery-glass">
          <CocktailGlass spec={spec} animated={false} />
        </div>
      </div>

      <div className="gallery-info">
        <h3 className="gallery-name">{spec.name}</h3>
        <p className="gallery-meta">
          <span>🏷️ {spec.category}</span>
          {spec.origin && <span>{flagFor(spec.origin)} {spec.origin}</span>}
        </p>
        {!compact && <p className="gallery-ingredients">{spec.ingredients.map((i) => i.name).join(' · ')}</p>}
      </div>
    </Link>
  );
}
