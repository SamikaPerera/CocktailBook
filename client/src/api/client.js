// A tiny wrapper around fetch() used by every API call in the app.
// Keeping it in one place means the base URL, JSON handling, error
// handling and the JWT header are written only once.

// Empty in development (Vite proxy), full Render URL in production.
const API_URL = import.meta.env.VITE_API_URL || '';

// Where the login token is kept in the browser.
export const TOKEN_KEY = 'cocktailbook_token';

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  // If we're logged in, prove it by sending the JWT with every request.
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Some responses (e.g. 204 No Content) have no body.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Turn server error messages into a normal JS Error the UI can display.
    // We attach the status code so callers can react to e.g. 401 (logged out).
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.errors = data?.errors; // per-field validation errors, if any
    throw error;
  }
  return data;
}
