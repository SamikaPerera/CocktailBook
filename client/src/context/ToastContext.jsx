// Toast messages: small notices that slide up from the bottom and disappear,
// e.g. "Negroni was updated" or "Added to favourites".
// Any component can call:  const toast = useToast();  toast('Saved!', 'success');
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

const SHOW_MS = 3000;   // how long a toast stays
const LEAVE_MS = 300;   // length of the slide-out animation

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // useCallback keeps the same function between renders, so components can
  // safely use it inside useEffect.
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, type, leaving: false }]); // max 3 on screen

    // Start the slide-out, then remove it.
    setTimeout(() => {
      setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, SHOW_MS);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, SHOW_MS + LEAVE_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* aria-live: screen readers read new toasts out loud */}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? 'leaving' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
