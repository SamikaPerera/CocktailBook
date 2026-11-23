// Custom hook: favourite specs and recently viewed specs for the logged-in user.
// Saved in localStorage on this device, so it works offline and needs no
// server changes. Keys include the user id, so two people sharing a bar
// tablet keep separate lists.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const MAX_RECENT = 5;

function load(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return []; // storage blocked or corrupt - start empty
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked (e.g. private mode) - the feature just won't persist
  }
}

export function useFavourites() {
  const { user } = useAuth();
  const favKey = `cocktailbook_favourites_${user?.id}`;
  const recentKey = `cocktailbook_recent_${user?.id}`;

  const [favourites, setFavourites] = useState(() => load(favKey));
  const [recent, setRecent] = useState(() => load(recentKey));

  // Save whenever the lists change.
  useEffect(() => save(favKey, favourites), [favKey, favourites]);
  useEffect(() => save(recentKey, recent), [recentKey, recent]);

  function toggleFavourite(id) {
    setFavourites((current) => (current.includes(id) ? current.filter((f) => f !== id) : [...current, id]));
  }

  // Put the spec at the front of "Recently viewed", without duplicates.
  function addRecent(id) {
    setRecent((current) => [id, ...current.filter((r) => r !== id)].slice(0, MAX_RECENT));
  }

  return {
    favourites,
    recent,
    isFavourite: (id) => favourites.includes(id),
    toggleFavourite,
    addRecent,
  };
}
