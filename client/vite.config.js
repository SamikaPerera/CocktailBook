// Vite configuration, including the PWA plugin (manifest + service worker).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Forward any request starting with /api to the Express server. The browser
// thinks everything is on one origin, so there are no CORS issues and the
// service worker can cache API calls easily.
// API_PROXY_TARGET lets you point at a different API port if needed.
const apiProxy = { '/api': process.env.API_PROXY_TARGET || 'http://localhost:5000' };

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We write our own service worker (src/sw.js) because Phase 5 adds
      // push-notification code to it. Workbox injects the precache list.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false, // we register it ourselves in main.jsx

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },

      // Extra files in /public to include in the precache.
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],

      // The web app manifest: tells the phone how to install the app.
      manifest: {
        name: 'CocktailBook',
        short_name: 'CocktailBook',
        description: 'The house cocktail spec manual - works offline during service.',
        theme_color: '#1f1a24',
        background_color: '#1f1a24',
        display: 'standalone', // opens without the browser address bar
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      // Set to true to test the service worker with "npm run dev".
      // Usually it's easier to test with "npm run build && npm run preview".
      devOptions: { enabled: false, type: 'module' },
    }),
  ],

  // npm run dev
  server: {
    // A dedicated port so CocktailBook never clashes with other Vite
    // projects (5173 is Vite's default). strictPort makes Vite stop with
    // an error instead of silently switching to another port.
    port: 5180,
    strictPort: true,
    proxy: apiProxy,
  },

  // npm run preview (serves the production build, with the service worker)
  preview: {
    port: 4180,
    strictPort: true,
    proxy: apiProxy,
  },
});
