// Wraps pages that need a logged-in user (and optionally a specific role).
//
//   <ProtectedRoute>                 -> any logged-in user
//   <ProtectedRoute role="manager">  -> managers only
//
// NOTE: this only hides pages in the browser for a better user experience.
// The REAL security is on the server (protect + requireRole middleware),
// because anyone can modify JavaScript running in their own browser.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Send them to login, remembering where they wanted to go.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <section className="card">
        <h1>Access denied</h1>
        <p>This page is only available to {role}s.</p>
      </section>
    );
  }

  return children;
}
