// Manager screen: quick stats, then the list of all specs with Edit / Delete buttons.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getSpecs, deleteSpec } from '../api/specs.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ManageStats from '../components/ManageStats.jsx';
import { SpecListSkeleton } from '../components/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ManagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [specs, setSpecs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hundreds of specs: show 50 at a time (the filter box searches all of them).
  const [visibleCount, setVisibleCount] = useState(50);
  useEffect(() => { setVisibleCount(50); }, [filter]);

  // The spec waiting for delete confirmation (null = dialog closed).
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load all specs once when the page opens.
  useEffect(() => {
    getSpecs()
      .then(setSpecs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // The form page sends a message like "Negroni was updated" - show it as a
  // toast once, then clear it so it doesn't come back on refresh.
  // (The ref stops React's development double-run from showing it twice.)
  const noticeShown = useRef(false);
  useEffect(() => {
    if (location.state?.notice && !noticeShown.current) {
      noticeShown.current = true;
      toast(location.state.notice, 'success');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, toast]);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteSpec(toDelete.id);
      // Remove it from the list without reloading everything.
      setSpecs((current) => current.filter((s) => s.id !== toDelete.id));
      toast(`"${toDelete.name}" was deleted.`, 'success');
      setToDelete(null);
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  // Quick client-side filter - the list is small, so no need to ask the server.
  const visibleSpecs = specs.filter((s) =>
    `${s.name} ${s.category}`.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <section>
      <div className="page-header">
        <h1>Manage specs</h1>
        <Link to="/manage/new" className="btn">+ New spec</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && <ManageStats specs={specs} />}

      <input
        type="search"
        className="search-input"
        placeholder="Filter by name or category…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter specs"
      />

      {loading && <SpecListSkeleton count={3} />}

      {!loading && visibleSpecs.length === 0 && (
        <p className="muted">{specs.length === 0 ? 'No specs yet. Create the first one!' : 'No specs match your filter.'}</p>
      )}

      <ul className="spec-list stagger">
        {visibleSpecs.slice(0, visibleCount).map((spec, index) => (
          <li key={spec.id} className="spec-row" style={{ '--i': index % 50 }}>
            <div className="spec-row-info">
              <Link to={`/specs/${spec.id}`} className="spec-row-name">{spec.name}</Link>
              <span className="badge">{spec.category}</span>
              <span className="hint">
                Updated {new Date(spec.updatedAt).toLocaleDateString()}
                {spec.updatedBy?.name && ` by ${spec.updatedBy.name}`}
              </span>
            </div>
            <div className="spec-row-actions">
              <Link to={`/manage/${spec.id}/edit`} className="btn btn-small btn-ghost">Edit</Link>
              <button type="button" className="btn btn-small btn-danger" onClick={() => setToDelete(spec)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {visibleSpecs.length > visibleCount && (
        <div className="show-more">
          <p className="hint">Showing {visibleCount} of {visibleSpecs.length}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setVisibleCount((n) => n + 50)}>
            Show more specs
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete spec?"
        message={toDelete && `"${toDelete.name}" will be permanently removed for all staff. This cannot be undone.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
