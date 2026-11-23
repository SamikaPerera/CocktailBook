// Quick stats for the manager: totals that count up, and a bar per category
// that grows in. Everything is worked out from the spec list already loaded,
// so no extra API call is needed.
import { useCountUp } from '../hooks/useCountUp.js';
import { getFreshness } from '../utils/specFreshness.js';

function StatCard({ value, label, index }) {
  const shown = useCountUp(value);
  return (
    <div className="stat-card" style={{ '--i': index }}>
      <span className="stat-value">{shown}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function ManageStats({ specs }) {
  const changedThisWeek = specs.filter((s) => getFreshness(s)).length;

  // { Sour: 3, Stirred: 1, ... } sorted from most to fewest specs
  const counts = {};
  specs.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1; });
  const categories = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = categories[0]?.[1] || 1;

  return (
    <>
      <div className="stats">
        <StatCard index={0} value={specs.length} label="Total specs" />
        <StatCard index={1} value={changedThisWeek} label="New / updated this week" />
        <StatCard index={2} value={new Set(specs.map((s) => s.origin).filter(Boolean)).size} label="Countries" />
      </div>

      {categories.length > 0 && (
        <div className="category-bars" aria-label="Specs per category">
          {categories.map(([name, count], i) => (
            <div key={name} className="category-bar">
              <span>{name}</span>
              <span className="category-bar-track">
                <span className="category-bar-fill" style={{ width: `${(count / max) * 100}%`, '--i': i, display: 'block' }} />
              </span>
              <span className="category-bar-count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
