// Registration form. New accounts are always bartenders - the server
// enforces this, so there is no role choice here.
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // One state object for the whole form.
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) return <Navigate to="/" replace />;

  // One change handler for every input, using the input's "name" attribute.
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      // Validation errors from the server are already joined into one message.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1>Create account</h1>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <label>
          Name
          <input name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span className="hint">At least 8 characters, with a letter and a number.</span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
