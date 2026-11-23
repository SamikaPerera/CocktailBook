// Login form. After logging in, the user is sent back to the page they
// originally tried to open (or the home page).
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PourSplash from '../components/PourSplash.jsx';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  // "Controlled" form: React state is the single source of truth for each input.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? No need to see this page.
  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Animated intro: a cocktail is poured while the form fades in */}
      <PourSplash />
      <div className="splash-title">
        <h1>CocktailBook</h1>
        <p className="muted">The house spec manual, in your pocket.</p>
      </div>

      <section className="card auth-card after-splash">
        <h2>Log in</h2>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={submitting || !email || !password}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="muted">
          New bartender? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </>
  );
}
