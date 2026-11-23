// Grey "shimmering" placeholders shown while data loads. They have the same
// shape as the real content, so the page doesn't jump when it arrives.

export function SpecListSkeleton({ count = 4 }) {
  return (
    <div className="spec-cards" aria-busy="true" aria-label="Loading specs">
      {Array.from({ length: count }, (_, i) => <div key={i} className="skeleton skeleton-card" />)}
    </div>
  );
}

// Tall placeholders in the same grid as the cocktail gallery.
export function GallerySkeleton({ count = 8 }) {
  return (
    <div className="gallery" aria-busy="true" aria-label="Loading specs">
      {Array.from({ length: count }, (_, i) => <div key={i} className="skeleton skeleton-tile" />)}
    </div>
  );
}

export function SpecDetailSkeleton() {
  return (
    <div className="card" aria-busy="true" aria-label="Loading spec">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-glass" />
      {[90, 75, 80, 60].map((width, i) => (
        <div key={i} className="skeleton skeleton-line" style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}
