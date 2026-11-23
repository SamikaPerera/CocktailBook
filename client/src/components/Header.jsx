// Top bar: app name, navigation links, the logged-in user and the theme switch.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <Link to="/" className="brand">🍸 CocktailBook</Link>

      {/* Shown to everyone, including on the login page. On phones it sits on
          the top row next to the app name, and the nav wraps underneath. */}
      <ThemeToggle />

      {user && (
        <nav className="nav">
          <NavLink to="/specs">Specs</NavLink>
          {/* Only managers see the Manage link */}
          {isManager && <NavLink to="/manage">Manage</NavLink>}
          <span className="user-chip" title={user.email}>
            {user.name} <span className="badge">{user.role}</span>
          </span>
          <button type="button" className="btn btn-small btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
