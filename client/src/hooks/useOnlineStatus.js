// Custom hook: returns true when the browser is online, false when offline,
// and re-renders the component whenever that changes.
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    // The browser fires these events when the connection changes.
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Clean up when the component unmounts, to avoid memory leaks.
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
