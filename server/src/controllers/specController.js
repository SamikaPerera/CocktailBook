// Handlers for /api/specs.
// matchedData() returns ONLY the fields that passed validation, so a user
// can't sneak extra fields (e.g. createdBy) into the database.
import { matchedData } from 'express-validator';
import Spec from '../models/Spec.js';
import SpecChange from '../models/SpecChange.js';
import { notifySpecChange } from '../services/pushService.js';
import { diffSpec } from '../utils/diffSpec.js';

// Escape characters that have a special meaning in regular expressions,
// so a search like "a.b" or "(" can't break or abuse the query.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Show the name of the user who last changed a spec, not just their id.
const withUpdatedBy = { path: 'updatedBy', select: 'name' };

// GET /api/specs?search=neg&category=Stirred
export async function listSpecs(req, res) {
  // Read the validated (trimmed) query values. In Express 5 req.query is
  // read-only, so sanitised values are only available through matchedData().
  const { search, category } = matchedData(req, { locations: ['query'] });
  const filter = {};

  if (search) {
    // Case-insensitive "contains" on the name or the country of origin.
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [{ name: pattern }, { origin: pattern }];
  }
  if (category) filter.category = category;

  const specs = await Spec.find(filter)
    .collation({ locale: 'en', strength: 2 }) // sort A-Z ignoring case
    .sort({ name: 1 })
    .populate(withUpdatedBy);

  res.json(specs);
}

// GET /api/specs/:id
export async function getSpec(req, res) {
  const spec = await Spec.findById(req.params.id).populate(withUpdatedBy);
  if (!spec) return res.status(404).json({ message: 'Spec not found' });
  res.json(spec);
}

// GET /api/specs/:id/history - newest change first
export async function getSpecHistory(req, res) {
  const history = await SpecChange.find({ spec: req.params.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({ path: 'changedBy', select: 'name' });
  res.json(history);
}

// POST /api/specs  (manager only)
export async function createSpec(req, res) {
  const data = matchedData(req, { locations: ['body'] });

  const spec = await Spec.create({
    ...data,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  await spec.populate(withUpdatedBy);

  // First entry in the spec's change history.
  await SpecChange.create({ spec: spec._id, action: 'created', changedBy: req.user._id });

  // Tell every subscribed device (runs in the background, not awaited).
  notifySpecChange(spec, 'created');

  res.status(201).json(spec);
}

// PUT /api/specs/:id  (manager only) - replaces the whole spec
export async function updateSpec(req, res) {
  const data = matchedData(req, { locations: ['body'] });

  const spec = await Spec.findById(req.params.id);
  if (!spec) return res.status(404).json({ message: 'Spec not found' });

  // Optional fields left empty mean "remove it".
  const newValues = { ...data, photoUrl: data.photoUrl || '', origin: data.origin || '' };

  // Work out what actually changed BEFORE overwriting the old values.
  const changes = diffSpec(spec, newValues);

  // Nothing changed (e.g. the manager pressed Save without editing):
  // don't touch "last updated", don't add history, don't notify anyone.
  if (changes.length === 0) {
    await spec.populate(withUpdatedBy);
    return res.json(spec);
  }

  // Copy the new values onto the document, then save() runs the schema validation.
  spec.set({ ...newValues, updatedBy: req.user._id });
  await spec.save();
  await spec.populate(withUpdatedBy);

  await SpecChange.create({ spec: spec._id, action: 'updated', changes, changedBy: req.user._id });

  // The notification says what changed, e.g. "Garnish: Lemon peel → Orange twist".
  notifySpecChange(spec, 'updated', changes);

  res.json(spec);
}

// DELETE /api/specs/:id  (manager only)
export async function deleteSpec(req, res) {
  const spec = await Spec.findByIdAndDelete(req.params.id);
  if (!spec) return res.status(404).json({ message: 'Spec not found' });
  await SpecChange.deleteMany({ spec: spec._id }); // its history goes too
  res.json({ message: `"${spec.name}" was deleted`, id: spec.id });
}
