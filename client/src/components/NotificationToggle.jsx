// "Enable notifications" button. Shows the right message for every case:
// not supported, blocked, not set up, enabled.
import { useEffect, useState } from 'react';
import {
  getCurrentSubscription, hasServiceWorker, isPushSupported, subscribeToPush, unsubscribeFromPush,
} from '../utils/push.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function NotificationToggle() {
  // status: 'checking' | 'unsupported' | 'no-sw' | 'blocked' | 'off' | 'on'
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isOnline = useOnlineStatus();

  // Work out the current state when the component first shows.
  useEffect(() => {
    async function check() {
      if (!isPushSupported()) return setStatus('unsupported');
      if (!(await hasServiceWorker())) return setStatus('no-sw');
      if (Notification.permission === 'denied') return setStatus('blocked');
      const subscription = await getCurrentSubscription();
      return setStatus(subscription ? 'on' : 'off');
    }
    check().catch(() => setStatus('unsupported'));
  }, []);

  async function handleEnable() {
    setBusy(true);
    setError('');
    try {
      await subscribeToPush();
      setStatus('on');
    } catch (err) {
      if (Notification.permission === 'denied') setStatus('blocked');
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    setError('');
    try {
      await unsubscribeFromPush();
      setStatus('off');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'checking') return null;

  return (
    <div className="notify-box">
      <div>
        <strong>🔔 Spec notifications</strong>
        <p className="hint">Get notified when a spec is added or changed.</p>
      </div>

      {status === 'unsupported' && (
        <p className="hint">
          This browser doesn't support push notifications. On iPhone, first add CocktailBook
          to your Home Screen (Share → Add to Home Screen), then open it from there.
        </p>
      )}

      {status === 'no-sw' && (
        <p className="hint">
          Notifications need the service worker, which is off in development.
          Use <code>npm run build</code> then <code>npm run preview</code>.
        </p>
      )}

      {status === 'blocked' && (
        <p className="hint">
          Notifications are blocked for this site. Allow them in your browser's site settings, then reload.
        </p>
      )}

      {status === 'off' && (
        <button type="button" className="btn" onClick={handleEnable} disabled={busy || !isOnline}>
          {busy ? 'Enabling…' : 'Enable notifications'}
        </button>
      )}

      {status === 'on' && (
        <div className="notify-on">
          <span className="notice-inline">✓ Notifications are on</span>
          <button type="button" className="btn btn-small btn-ghost" onClick={handleDisable} disabled={busy || !isOnline}>
            {busy ? 'Turning off…' : 'Turn off'}
          </button>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
