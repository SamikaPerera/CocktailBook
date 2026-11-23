// AuthContext: shares "who is logged in" with every component.
// Any component can call useAuth() to get the user and the
// login / register / logout functions.
import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, TOKEN_KEY } from '../api/client.js';
import { API_CACHE } from '../constants/cache.js';
import { getCurrentSubscription } from '../utils/push.js';

const USER_KEY = 'cocktailbook_user';

const AuthContext = createContext(null);

// Read the saved user from localStorage (so a page refresh keeps you logged in).
function loadSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);

  // Save the token + user after a successful login/register.
  function saveSession({ token, user: loggedInUser }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function login(email, password) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    saveSession(data);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
    saveSession(data);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    // Delete the offline copy of the specs, so a shared bar device doesn't
    // keep house recipes available after logging out.
    if ('caches' in window) caches.delete(API_CACHE);
    // Stop notifications on this device too. The server deletes the old
    // subscription automatically the next time a push gets a 410 "Gone".
    if ('serviceWorker' in navigator) {
      getCurrentSubscription().then((sub) => sub?.unsubscribe()).catch(() => {});
    }
  }

  // On app start, ask the server if our saved token is still valid.
  // - 401: token expired/invalid -> log out.
  // - Network error (e.g. offline): keep the saved user, so the app
  //   still works offline (important for Phase 4).
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    apiRequest('/auth/me')
      .then((data) => {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch((err) => {
        if (err.status === 401) logout();
      });
  }, []);

  // All tabs of the app share one localStorage. If someone logs in or out in
  // another tab, follow it here too, so this tab never shows one user while
  // sending another user's token.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === USER_KEY || event.key === TOKEN_KEY || event.key === null) {
        setUser(loadSavedUser());
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = {
    user,
    isLoggedIn: Boolean(user),
    isManager: user?.role === 'manager',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components write useAuth() instead of useContext(AuthContext).
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
