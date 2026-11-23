// Helpers for subscribing this device to push notifications.
//
// The flow:
//   1. Ask the user for permission to show notifications.
//   2. Get the server's VAPID public key.
//   3. Ask the browser's push service for a subscription (endpoint + keys).
//   4. Send the subscription to our server, which stores it in MongoDB.
import { apiRequest } from '../api/client.js';

// Push needs a service worker, the Push API and the Notification API.
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// The service worker registration, or undefined if none is registered
// (e.g. in "npm run dev", where the service worker is disabled).
async function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

export async function hasServiceWorker() {
  return Boolean(await getRegistration());
}

// The browser's existing subscription for this device (or null).
export async function getCurrentSubscription() {
  const registration = await getRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
}

// The VAPID key arrives as a URL-safe base64 string, but the Push API wants
// raw bytes (a Uint8Array). This converts one into the other.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush() {
  // 1. Permission. Must be called from a click, or browsers will block it.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notifications were blocked. Allow them in your browser settings to turn them on.');
  }

  // 2. Server's public key.
  const { publicKey } = await apiRequest('/push/vapid-public-key');

  // 3. Subscribe with the browser's push service.
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // promise that every push shows a visible notification (required)
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // 4. Save it on our server. toJSON() gives { endpoint, keys: { p256dh, auth } }.
  await apiRequest('/push/subscribe', { method: 'POST', body: subscription.toJSON() });
  return subscription;
}

export async function unsubscribeFromPush() {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;

  // Tell our server first (needs the endpoint), then the browser.
  await apiRequest('/push/subscribe', { method: 'DELETE', body: { endpoint: subscription.endpoint } })
    .catch(() => {}); // if the server is unreachable, the next push will get a 410 and clean up
  await subscription.unsubscribe();
}
