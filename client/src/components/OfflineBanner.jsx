// Shows a banner at the top of every page while the device is offline.
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    // role="status" makes screen readers announce the change.
    <div className="offline-banner" role="status">
      📴 You're offline - showing saved specs. Changes can't be saved until you reconnect.
    </div>
  );
}
