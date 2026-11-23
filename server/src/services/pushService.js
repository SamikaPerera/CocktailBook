// Sends Web Push notifications to every subscribed device.
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import { describeChange } from '../utils/diffSpec.js';

let configured = false;

// Called once at startup (server.js). Push is optional: without keys the app
// still works, it just doesn't send notifications.
export function configurePush() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('⚠️  VAPID keys missing - push notifications are disabled (run: npm run generate-vapid)');
    return;
  }
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  console.log('🔔 Web Push configured');
}

export const isPushConfigured = () => configured;

// Send one payload to all stored subscriptions.
// Subscriptions the push service reports as gone (404/410 - e.g. the user
// blocked notifications or uninstalled the app) are deleted from MongoDB.
export async function sendToAll(payload) {
  if (!configured) return { sent: 0, removed: 0 };

  const subscriptions = await PushSubscription.find();
  const message = JSON.stringify(payload);

  // allSettled: one failing device must not stop the others.
  const results = await Promise.allSettled(
    subscriptions.map((sub) => webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      message,
      { TTL: 60 * 60 * 24 }, // the push service keeps it for 24 h if the phone is offline
    )),
  );

  const expiredIds = [];
  let sent = 0;
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      sent += 1;
    } else if ([404, 410].includes(result.reason?.statusCode)) {
      expiredIds.push(subscriptions[i]._id);
    } else {
      console.error('Push failed:', result.reason?.statusCode, result.reason?.body || result.reason?.message);
    }
  });

  if (expiredIds.length) await PushSubscription.deleteMany({ _id: { $in: expiredIds } });

  console.log(`🔔 Push "${payload.title}": sent ${sent}, removed ${expiredIds.length} expired`);
  return { sent, removed: expiredIds.length };
}

// Builds the notification for a created/updated spec and sends it.
// It is NOT awaited by the controller, so a slow push service never delays
// the manager's save. Errors are logged instead of crashing the request.
export function notifySpecChange(spec, action, changes = []) {
  const title = action === 'created' ? `New spec: ${spec.name}` : `Spec updated: ${spec.name}`;

  // New spec: a short summary. Update: the first two changes, then "+N more".
  let body = `${spec.category} · ${spec.glass} · ${spec.ingredients.length} ingredients`;
  if (changes.length > 0) {
    body = changes.slice(0, 2).map(describeChange).join(' · ');
    if (changes.length > 2) body += ` (+${changes.length - 2} more)`;
  }

  sendToAll({
    title,
    body,
    url: `/specs/${spec.id}`, // opened when the notification is tapped
    tag: `spec-${spec.id}`,   // a newer notification for the same spec replaces the old one
  }).catch((err) => console.error('Push error:', err.message));
}
