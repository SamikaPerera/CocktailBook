// Change history of a spec: who changed it, when, and exactly what changed.
//   useSpecHistory(id)   -> loads the history once (cached offline by the service worker)
//   <WhatChanged />      -> highlighted box with the latest changes (top of the spec page)
//   <ChangeHistoryList /> -> collapsible full history (bottom of the spec page)
import { useEffect, useState } from 'react';
import { getSpecHistory } from '../api/specs.js';

const formatDate = (iso) => new Date(iso).toLocaleString(undefined, {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// Returns the history array, or null if it isn't available (e.g. offline and never loaded).
export function useSpecHistory(specId) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let ignore = false;
    setHistory(null);
    getSpecHistory(specId)
      .then((data) => { if (!ignore) setHistory(data); })
      .catch(() => { if (!ignore) setHistory(null); }); // not available: the sections just hide
    return () => { ignore = true; };
  }, [specId]);

  return history;
}

// One changed field as JSX: old value struck through, new value highlighted.
function ChangeLine({ change }) {
  const { field, from, to } = change;
  if (field === 'Ingredient') {
    if (!from) return <li><span className="change-add">+ Added</span> {to}</li>;
    if (!to) return <li><span className="change-remove">− Removed</span> <del>{from}</del></li>;
  }
  if (field === 'Photo') return <li>{to ? 'Photo updated' : 'Photo removed'}</li>;
  return (
    <li>
      <strong>{field}:</strong> {from && <del>{from}</del>} {from && '→'} <ins>{to || '(empty)'}</ins>
    </li>
  );
}

const WhoAndWhen = ({ entry }) => (
  <span className="hint">
    {formatDate(entry.createdAt)}{entry.changedBy?.name && ` · ${entry.changedBy.name}`}
  </span>
);

// The latest edit, shown only if it is an update (not the original "created").
export function WhatChanged({ history }) {
  const latest = history?.[0];
  if (!latest || latest.action !== 'updated' || latest.changes.length === 0) return null;

  return (
    <aside className="what-changed" aria-label="What changed">
      <strong>🔄 What changed</strong>
      <WhoAndWhen entry={latest} />
      <ul>
        {latest.changes.map((change, i) => <ChangeLine key={i} change={change} />)}
      </ul>
    </aside>
  );
}

// Every entry, newest first. <details> is a built-in collapsible section.
export function ChangeHistoryList({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <details className="history">
      <summary>Change history ({history.length})</summary>
      <ol className="history-list">
        {history.map((entry) => (
          <li key={entry.id}>
            <WhoAndWhen entry={entry} />
            {entry.action === 'created' ? (
              <p className="history-created">Spec created</p>
            ) : (
              <ul>
                {entry.changes.map((change, i) => <ChangeLine key={i} change={change} />)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
