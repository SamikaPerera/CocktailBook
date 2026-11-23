// CocktailBook service worker.
//
// A service worker is a script the browser runs in the background, separate
// from the page. It sits between the app and the network, so it can answer
// requests from a cache when there's no internet.
//
// vite-plugin-pwa builds this file with the "injectManifest" strategy: at
// build time it replaces self.__WB_MANIFEST with the list of app-shell files.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';
import { API_CACHE, IMAGE_CACHE } from './constants/cache.js';

// Activate a new version of the service worker straight away and take
// control of open tabs, so users always get the latest app.
self.skipWaiting();
clientsClaim();

// --- 1. Precache the app shell ---
// HTML, JS, CSS and icons are downloaded once at install time and served
// from the cache, so the app opens instantly and works offline.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches(); // delete files from older app versions

// This is a single-page app: every page URL (/specs, /specs/123, ...) is
// handled by index.html + React Router. So offline navigations get the
// cached index.html. API URLs are excluded.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), {
  denylist: [/^\/api\//],
}));

// --- 2. Runtime cache for the spec API ---
// NetworkFirst: try the network first (so online users see the latest
// specs); if the network fails or takes longer than 4 seconds, use the
// last saved copy from the cache.
// The check uses the URL path, so it also works when the API is on another
// domain in production (e.g. Render).
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/specs'),
  new NetworkFirst({
    cacheName: API_CACHE,
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }), // never cache errors (401, 500...)
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
    ],
  }),
);

// --- 3. Runtime cache for cocktail photos ---
// CacheFirst: photos rarely change, so serve the saved copy if we have one.
// Status 0 = "opaque" response from another website (allowed for images).
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMAGE_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

// --- 4. Push notifications ---

// The server sent a push message. Show it as a notification.
// This runs even when the app is closed, because the browser wakes the
// service worker up for it.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() };
  }

  const title = data.title || 'CocktailBook';
  const options = {
    body: data.body || 'A cocktail spec was updated.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: data.tag,          // same tag = replace the older notification
    renotify: Boolean(data.tag),
    data: { url: data.url || '/specs' }, // remembered for the click handler below
  };

  // waitUntil keeps the service worker alive until the notification is shown.
  event.waitUntil(self.registration.showNotification(title, options));
});

// The user tapped the notification: open that cocktail's spec.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/specs', self.location.origin).href;

  event.waitUntil((async () => {
    // If CocktailBook is already open in a tab/window, reuse it...
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) {
      await existing.focus();
      return existing.navigate(targetUrl);
    }
    // ...otherwise open a new one.
    return self.clients.openWindow(targetUrl);
  })());
});
