// Create / edit form for a cocktail spec.
// The same component is used for both routes:
//   /manage/new         -> empty form, POST on save
//   /manage/:id/edit    -> loads the spec, PUT on save
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { createSpec, getSpec, updateSpec } from '../api/specs.js';
import { CATEGORIES } from '../constants/categories.js';
import { COUNTRY_NAMES } from '../constants/countries.js';

const EMPTY_INGREDIENT = { name: '', measure: '' };

const EMPTY_SPEC = {
  name: '',
  category: '',
  origin: '',
  ingredients: [{ ...EMPTY_INGREDIENT }],
  glass: '',
  ice: '',
  garnish: '',
  method: '',
  photoUrl: '',
};

// Client-side validation: gives instant feedback before calling the API.
// The server validates again, because client checks can be bypassed.
function validateSpec(spec) {
  const errors = {};
  if (!spec.name.trim()) errors.name = 'Name is required';
  if (!spec.category) errors.category = 'Choose a category';
  if (!spec.glass.trim()) errors.glass = 'Glass is required';
  if (!spec.ice.trim()) errors.ice = 'Ice is required';
  if (!spec.garnish.trim()) errors.garnish = 'Garnish is required';
  if (!spec.method.trim()) errors.method = 'Method is required';

  const filled = spec.ingredients.filter((i) => i.name.trim() || i.measure.trim());
  if (filled.length === 0) {
    errors.ingredients = 'Add at least one ingredient';
  } else if (filled.some((i) => !i.name.trim() || !i.measure.trim())) {
    errors.ingredients = 'Every ingredient needs both a name and a measure';
  }

  if (spec.photoUrl.trim() && !/^https?:\/\/\S+$/i.test(spec.photoUrl.trim())) {
    errors.photoUrl = 'Photo URL must start with http:// or https://';
  }
  return errors;
}

export default function SpecFormPage() {
  const { id } = useParams(); // undefined on /manage/new
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [spec, setSpec] = useState(EMPTY_SPEC);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // When editing, load the existing spec into the form.
  useEffect(() => {
    if (!isEditing) return;
    getSpec(id)
      .then((data) => setSpec({
        name: data.name,
        category: data.category,
        origin: data.origin || '',
        ingredients: data.ingredients.length ? data.ingredients : [{ ...EMPTY_INGREDIENT }],
        glass: data.glass,
        ice: data.ice,
        garnish: data.garnish,
        method: data.method,
        photoUrl: data.photoUrl || '',
      }))
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  // --- Change handlers ---

  function handleChange(event) {
    const { name, value } = event.target;
    setSpec({ ...spec, [name]: value });
  }

  function handleIngredientChange(index, field, value) {
    // Build a NEW array (never mutate state directly) with one item changed.
    const ingredients = spec.ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing));
    setSpec({ ...spec, ingredients });
  }

  function addIngredient() {
    setSpec({ ...spec, ingredients: [...spec.ingredients, { ...EMPTY_INGREDIENT }] });
  }

  function removeIngredient(index) {
    setSpec({ ...spec, ingredients: spec.ingredients.filter((_, i) => i !== index) });
  }

  // --- Submit ---

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateSpec(spec);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return; // stop: fix errors first

    // Drop completely empty ingredient rows before sending.
    const payload = {
      ...spec,
      ingredients: spec.ingredients.filter((i) => i.name.trim() || i.measure.trim()),
    };

    setSaving(true);
    try {
      const saved = isEditing ? await updateSpec(id, payload) : await createSpec(payload);
      navigate('/manage', { state: { notice: `"${saved.name}" was ${isEditing ? 'updated' : 'created'}.` } });
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading spec…</p>;

  return (
    <section className="card">
      <h1>{isEditing ? `Edit ${spec.name || 'spec'}` : 'New spec'}</h1>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <Field label="Name" error={errors.name}>
          <input name="name" value={spec.name} onChange={handleChange} maxLength={80} />
        </Field>

        <Field label="Category" error={errors.category}>
          <select name="category" value={spec.category} onChange={handleChange}>
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Origin (optional)" error={errors.origin}>
          {/* <datalist> suggests countries as you type, but any text is allowed */}
          <input
            name="origin"
            list="country-options"
            value={spec.origin}
            onChange={handleChange}
            placeholder="e.g. Italy"
            maxLength={60}
          />
          <datalist id="country-options">
            {COUNTRY_NAMES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>

        <fieldset className="ingredients">
          <legend>Ingredients</legend>
          {spec.ingredients.map((ing, index) => (
            // Index keys are OK here: rows have no ids and are only added/removed by the user.
            <div className="ingredient-row" key={index}>
              <input
                placeholder="Ingredient (e.g. Gin)"
                aria-label={`Ingredient ${index + 1} name`}
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                maxLength={80}
              />
              <input
                placeholder="Measure (e.g. 50 ml)"
                aria-label={`Ingredient ${index + 1} measure`}
                value={ing.measure}
                onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)}
                maxLength={40}
              />
              <button
                type="button"
                className="btn btn-small btn-ghost"
                onClick={() => removeIngredient(index)}
                disabled={spec.ingredients.length === 1}
                aria-label={`Remove ingredient ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          {errors.ingredients && <span className="field-error">{errors.ingredients}</span>}
          <button type="button" className="btn btn-small btn-ghost" onClick={addIngredient}>
            + Add ingredient
          </button>
        </fieldset>

        <div className="form-grid">
          <Field label="Glass" error={errors.glass}>
            <input name="glass" value={spec.glass} onChange={handleChange} placeholder="e.g. Coupe" maxLength={60} />
          </Field>
          <Field label="Ice" error={errors.ice}>
            <input name="ice" value={spec.ice} onChange={handleChange} placeholder="e.g. Large cube" maxLength={60} />
          </Field>
        </div>

        <Field label="Garnish" error={errors.garnish}>
          <input name="garnish" value={spec.garnish} onChange={handleChange} placeholder="e.g. Orange peel" maxLength={100} />
        </Field>

        <Field label="Method" error={errors.method}>
          <textarea name="method" rows={4} value={spec.method} onChange={handleChange} maxLength={2000} />
        </Field>

        <Field label="Photo URL (optional)" error={errors.photoUrl}>
          <input name="photoUrl" type="url" value={spec.photoUrl} onChange={handleChange} placeholder="https://…" />
        </Field>

        {serverError && <p className="form-error" role="alert">{serverError}</p>}

        <div className="form-actions">
          <Link to="/manage" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save spec'}
          </button>
        </div>
      </form>
    </section>
  );
}

// Small helper component: a label, the input, and its error message.
function Field({ label, error, children }) {
  return (
    <label className={error ? 'has-error' : undefined}>
      {label}
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
