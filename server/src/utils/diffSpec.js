// Compares the old version of a spec with the new values and lists what changed.
// Used for the change history and for the text of "Spec updated" notifications.

// Simple text fields and the label shown to users.
const FIELD_LABELS = {
  name: 'Name',
  category: 'Category',
  origin: 'Origin',
  glass: 'Glass',
  ice: 'Ice',
  garnish: 'Garnish',
  method: 'Method',
  photoUrl: 'Photo',
};

// "50 ml Gin" - how an ingredient is shown in the history.
const formatIngredient = (ing) => `${ing.measure} ${ing.name}`;

export function diffSpec(oldSpec, newData) {
  const changes = [];

  // 1. Plain text fields
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const before = (oldSpec[key] || '').trim();
    const after = (newData[key] || '').trim();
    if (before !== after) changes.push({ field: label, from: before || null, to: after || null });
  }

  // 2. Ingredients, matched by name (ignoring case), so we can say
  //    "added", "removed" or "measure changed" instead of "list changed".
  const key = (ing) => ing.name.trim().toLowerCase();
  const oldByName = new Map(oldSpec.ingredients.map((ing) => [key(ing), ing]));
  const newByName = new Map(newData.ingredients.map((ing) => [key(ing), ing]));

  for (const [name, oldIng] of oldByName) {
    const newIng = newByName.get(name);
    if (!newIng) {
      changes.push({ field: 'Ingredient', from: formatIngredient(oldIng), to: null }); // removed
    } else if (oldIng.measure.trim() !== newIng.measure.trim()) {
      changes.push({ field: 'Ingredient', from: formatIngredient(oldIng), to: formatIngredient(newIng) });
    }
  }
  for (const [name, newIng] of newByName) {
    if (!oldByName.has(name)) {
      changes.push({ field: 'Ingredient', from: null, to: formatIngredient(newIng) }); // added
    }
  }

  return changes;
}

// One change as a short sentence, e.g. "Garnish: Lemon peel → Orange twist".
export function describeChange({ field, from, to }) {
  if (field === 'Ingredient') {
    if (!from) return `Added ${to}`;
    if (!to) return `Removed ${from}`;
    return `${from} → ${to}`;
  }
  if (field === 'Method') return 'Method updated'; // too long for a notification
  if (field === 'Photo') return to ? 'Photo updated' : 'Photo removed';
  return `${field}: ${from || '-'} → ${to || '-'}`;
}
