// Custom hook: light / dark theme.
// - By default the app follows the phone's setting (prefers-color-scheme).
// - When the user taps the toggle, their choice is saved on this device.
// The theme is applied as <html data-theme="light|dark">, and index.css
// switches all colour variables based on that attribute.
import { useEffect, useState } from 'react';

export const THEME_KEY = 'cocktailbook_theme';

const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

function savedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

// Colour of the phone's status bar / browser toolbar for each theme.
const THEME_COLOURS = { dark: '#1f1a24', light: '#f6f0e7' };

export function useTheme() {
  const [theme, setTheme] = useState(() => savedTheme() || systemTheme());

  // Keep following the phone's setting until the user makes a choice.
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!media) return undefined;
    const onChange = () => { if (!savedTheme()) setTheme(systemTheme()); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Update the browser toolbar colour to match.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOURS[theme]);
  }, [theme]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* not saved - fine */ }
  }

  return { theme, toggleTheme };
}
