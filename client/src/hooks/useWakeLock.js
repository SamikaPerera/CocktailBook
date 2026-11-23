// Custom hook: keeps the phone screen switched on (Screen Wake Lock API),
// so the spec stays visible while the bartender makes the drink.
//
// status: 'off' | 'on' | 'unsupported' | 'error'
import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const lockRef = useRef(null);       // the WakeLockSentinel from the browser
  const wantedRef = useRef(false);    // should the screen be kept on?
  const [status, setStatus] = useState('off');

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) { setStatus('unsupported'); return; }
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
      setStatus('on');
      // The browser can release the lock itself (e.g. low battery).
      lockRef.current.addEventListener('release', () => {
        if (!wantedRef.current) setStatus('off');
      });
    } catch {
      setStatus('error'); // e.g. battery saver is on
    }
  }, []);

  const request = useCallback(() => {
    wantedRef.current = true;
    return acquire();
  }, [acquire]);

  const release = useCallback(() => {
    wantedRef.current = false;
    lockRef.current?.release().catch(() => {});
    lockRef.current = null;
    setStatus('off');
  }, []);

  // Browsers drop the lock when the tab is hidden; take it again when the
  // user comes back to the app.
  useEffect(() => {
    const onVisible = () => {
      if (wantedRef.current && document.visibilityState === 'visible') acquire();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lockRef.current?.release().catch(() => {});
    };
  }, [acquire]);

  return { status, request, release };
}
