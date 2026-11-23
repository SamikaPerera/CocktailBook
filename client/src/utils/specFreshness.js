// Works out whether a spec should show a "NEW" or "UPDATED" badge,
// so staff can spot recent changes at a glance.
const RECENT_DAYS = 7;
const RECENT_MS = RECENT_DAYS * 24 * 60 * 60 * 1000;

// Returns 'new', 'updated' or null.
export function getFreshness(spec, now = Date.now()) {
  const created = new Date(spec.createdAt).getTime();
  const updated = new Date(spec.updatedAt).getTime();
  if (now - created < RECENT_MS) return 'new';
  if (now - updated < RECENT_MS) return 'updated';
  return null;
}

// Text shown on the badge.
export const FRESHNESS_LABEL = { new: 'NEW', updated: 'UPDATED' };
